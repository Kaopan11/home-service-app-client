<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { createCardToken } from '@/services/omise'
import { createCharge, type BookingCharge } from '@/services/paymentApi'
import { applyPromotionCode } from '@/services/promoApi'

const props = withDefaults(
  defineProps<{
    totalPrice?: number
    booking: BookingCharge
  }>(),
  { totalPrice: 0 },
)

const payableAmount = defineModel<number>('payableAmount', { default: 0 })

const method = defineModel<'promptpay' | 'card'>('method', { default: 'card' })
const valid = defineModel<boolean>('valid', { default: false })

type CardBrand = 'visa' | 'mastercard'

const CARD_NUMBER_LENGTH = 16
const CVV_LENGTH = 3

const cardBrand = ref<CardBrand>('visa')

const card = reactive({
  number: '',
  name: '',
  expiry: '',
  cvv: '',
})

const promoCode = ref('')
const promoApplied = ref(false)
const promoBusy = ref(false)
const promoError = ref('')

const submitting = ref(false)
const submitError = ref('')

watch(
  () => props.totalPrice,
  (amount) => {
    if (!promoApplied.value) {
      payableAmount.value = amount
    }
  },
  { immediate: true },
)

function formatCardNumber(event: Event) {
  const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, CARD_NUMBER_LENGTH)
  card.number = digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(event: Event) {
  const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
  card.expiry = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function formatCvv(event: Event) {
  card.cvv = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, CVV_LENGTH)
}

// Visa starts with 4; Mastercard uses 51–55 or 2221–2720.
function matchesBrand(num: string, brand: CardBrand): boolean {
  if (brand === 'visa') return num.startsWith('4')
  const prefix2 = Number(num.slice(0, 2))
  const prefix4 = Number(num.slice(0, 4))
  return (prefix2 >= 51 && prefix2 <= 55) || (prefix4 >= 2221 && prefix4 <= 2720)
}

const brandMismatch = computed(() => {
  const cardNumber = card.number.replace(/\s/g, '')
  return cardNumber.length >= 4 && !matchesBrand(cardNumber, cardBrand.value)
})

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '')
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }
  return sum % 10 === 0
}

function isCardExpired(month: number, year: number): boolean {
  const now = new Date()
  // Cards stay valid through the end of the expiry month.
  const firstDayAfterExpiry = new Date(2000 + year, month, 1)
  return firstDayAfterExpiry <= now
}

async function applyPromo() {
  if (!promoCode.value.trim() || promoApplied.value || promoBusy.value) return
  promoError.value = ''
  promoBusy.value = true
  try {
    const result = await applyPromotionCode(promoCode.value.trim(), props.totalPrice)
    payableAmount.value = result.payable_amount
    promoApplied.value = true
  } catch (error) {
    promoError.value = error instanceof Error ? error.message : 'ไม่สามารถใช้รหัสโปรโมชันได้'
  } finally {
    promoBusy.value = false
  }
}

const isCardValid = computed(() => {
  const cardNumber = card.number.replace(/\s/g, '')
  if (cardNumber.length !== CARD_NUMBER_LENGTH) return false
  if (!matchesBrand(cardNumber, cardBrand.value)) return false
  if (!luhnCheck(cardNumber)) return false
  if (card.name.trim().length === 0) return false
  if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return false

  const [month, year] = card.expiry.split('/').map(Number)
  if (month < 1 || month > 12) return false
  if (isCardExpired(month, year)) return false

  if (card.cvv.length !== CVV_LENGTH) return false
  return true
})

watch(
  [method, isCardValid],
  ([currentMethod, cardValid]) => {
    // PromptPay is not wired to a real payment flow yet, so it can never be submitted.
    valid.value = currentMethod === 'card' && cardValid
  },
  { immediate: true },
)

function clearCardData() {
  card.number = ''
  card.name = ''
  card.expiry = ''
  card.cvv = ''
}

async function submit(): Promise<boolean> {
  submitError.value = ''

  if (method.value === 'promptpay') {
    submitError.value = 'ยังไม่เปิดให้ชำระเงินผ่านพร้อมเพย์ กรุณาใช้บัตรเครดิต'
    return false
  }

  if (!isCardValid.value) {
    submitError.value = 'ข้อมูลบัตรเครดิตไม่ถูกต้อง'
    return false
  }

  submitting.value = true
  try {
    const [expiryMonth, expiryYear] = card.expiry.split('/')
    const token = await createCardToken({
      name: card.name.trim(),
      number: card.number.replace(/\s/g, ''),
      expirationMonth: Number(expiryMonth),
      expirationYear: 2000 + Number(expiryYear),
      securityCode: card.cvv,
    })
    const charge = await createCharge(token, payableAmount.value, props.booking, 'HomeServices booking')
    if (!charge.paid || charge.status !== 'successful') {
      submitError.value = 'การชำระเงินไม่สำเร็จ กรุณาตรวจสอบบัตรหรือลองใหม่อีกครั้ง'
      return false
    }
    clearCardData()
    return true
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
    return false
  } finally {
    submitting.value = false
  }
}

defineExpose({ submit, submitting })
</script>

<template>
  <section class="payment">
    <h2 class="payment__title">ชำระเงิน</h2>

    <div class="payment__methods" role="radiogroup" aria-label="วิธีการชำระเงิน">
      <label class="select-box">
        <input v-model="method" type="radio" name="payment-method" value="promptpay" disabled />
        <span class="icon icon--qr" aria-hidden="true"></span>
        พร้อมเพย์ (เร็วๆ นี้)
      </label>
      <label class="select-box">
        <input v-model="method" type="radio" name="payment-method" value="card" />
        <span class="icon icon--credit-card" aria-hidden="true"></span>
        บัตรเครดิต
      </label>
    </div>

    <div v-if="method === 'card'" class="payment__form">
      <div class="field">
        <span>ประเภทบัตร<em>*</em></span>
        <div class="payment__brands" role="radiogroup" aria-label="ประเภทบัตร">
          <label class="select-box">
            <input
              v-model="cardBrand"
              type="radio"
              name="card-brand"
              value="visa"
              :disabled="submitting"
            />
            <span class="payment__brand payment__brand--visa">VISA</span>
          </label>
          <label class="select-box">
            <input
              v-model="cardBrand"
              type="radio"
              name="card-brand"
              value="mastercard"
              :disabled="submitting"
            />
            <span class="payment__brand-mc" aria-hidden="true"><i></i><i></i></span>
            <span class="payment__brand">Mastercard</span>
          </label>
        </div>
      </div>

      <label class="field">
        <span>หมายเลขบัตรเครดิต<em>*</em></span>
        <input
          :value="card.number"
          type="text"
          inputmode="numeric"
          autocomplete="cc-number"
          maxlength="19"
          placeholder="กรุณากรอกหมายเลขบัตร"
          :disabled="submitting"
          @input="formatCardNumber"
        />
      </label>
      <p v-if="brandMismatch" class="payment__error" role="alert">
        หมายเลขบัตรไม่ตรงกับประเภทบัตร {{ cardBrand === 'visa' ? 'Visa' : 'Mastercard' }} ที่เลือก
      </p>

      <label class="field">
        <span>ชื่อบนบัตร<em>*</em></span>
        <input
          v-model="card.name"
          type="text"
          autocomplete="cc-name"
          placeholder="กรุณากรอกชื่อบนบัตร"
          :disabled="submitting"
        />
      </label>

      <div class="payment__row">
        <label class="field">
          <span>วันหมดอายุ<em>*</em></span>
          <input
            :value="card.expiry"
            type="text"
            inputmode="numeric"
            autocomplete="cc-exp"
            maxlength="5"
            placeholder="MM/YY"
            :disabled="submitting"
            @input="formatExpiry"
          />
        </label>
        <label class="field">
          <span>รหัส CVC / CVV<em>*</em></span>
          <input
            :value="card.cvv"
            type="text"
            inputmode="numeric"
            autocomplete="cc-csc"
            maxlength="3"
            placeholder="xxx"
            :disabled="submitting"
            @input="formatCvv"
          />
        </label>
      </div>

      <p v-if="submitError" class="payment__error" role="alert">{{ submitError }}</p>
    </div>

    <div v-else class="payment__qr">
      <img class="payment__qr-icon" src="/icons/action/qr-code.svg" alt="" width="96" height="96" />
      <p class="payment__qr-text">สแกน QR Code นี้ด้วยแอปธนาคารของคุณเพื่อชำระเงิน</p>
    </div>

    <div class="payment__divider" role="separator"></div>

    <label class="field">
      <span>Promotion Code</span>
      <div class="payment__promo">
        <input
          v-model="promoCode"
          type="text"
          placeholder="กรุณากรอกโค้ดส่วนลด (ถ้ามี)"
          :disabled="promoApplied || promoBusy || submitting"
        />
        <button
          class="btn btn--primary"
          type="button"
          :disabled="!promoCode.trim() || promoApplied || promoBusy || submitting"
          @click="applyPromo"
        >
          {{ promoApplied ? 'ใช้แล้ว' : promoBusy ? 'กำลังตรวจ...' : 'ใช้โค้ด' }}
        </button>
      </div>
      <p v-if="promoError" class="payment__error" role="alert">{{ promoError }}</p>
    </label>
  </section>
</template>

<style scoped>
.payment {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.payment__title {
  margin-bottom: 1.25rem;
  font-size: var(--headline-5-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-950);
}

.payment__methods {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.payment__methods .select-box {
  flex: 1;
  min-width: 0;
}

.payment__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.payment__row {
  display: flex;
  gap: 1.25rem;
}

.payment__brands {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.payment__brands .select-box {
  flex: 1;
  min-width: 0;
}

.payment__brand {
  font-weight: var(--font-weight-medium);
}

.payment__brand--visa {
  font-style: italic;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #1a1f71;
}

.payment__brand-mc {
  display: inline-flex;
  flex-shrink: 0;
}

.payment__brand-mc i {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #eb001b;
}

.payment__brand-mc i + i {
  margin-left: -0.4rem;
  background: #f79e1b;
  opacity: 0.9;
}

.payment__row .field {
  min-width: 0;
}

.payment__error {
  margin: -0.5rem 0 0;
  color: var(--red);
  font-size: var(--body-3-size);
}

.payment__qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  margin-bottom: 1.25rem;
  border: 1.5px dashed var(--gray-300);
  border-radius: var(--radius);
  text-align: center;
}

.payment__qr-icon {
  display: block;
}

.payment__qr-text {
  color: var(--gray-600);
  font-size: var(--body-3-size);
}

.payment__divider {
  height: 1px;
  margin-bottom: 1.25rem;
  background: var(--gray-300);
}

.payment__promo {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.payment__promo input {
  flex: 1;
  min-width: 0;
}

.payment__promo .btn {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .payment {
    padding: 1rem;
  }

  .payment__row {
    flex-direction: column;
    gap: 1.25rem;
  }

  .payment__promo {
    flex-direction: column;
  }

  .payment__promo .btn {
    width: 100%;
  }
}
</style>
