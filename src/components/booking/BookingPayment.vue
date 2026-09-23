<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { createCardToken } from '@/services/omise'
import { createCharge } from '@/services/paymentApi'

const props = withDefaults(
  defineProps<{
    totalPrice?: number
  }>(),
  { totalPrice: 0 },
)

const method = defineModel<'promptpay' | 'card'>('method', { default: 'card' })
const valid = defineModel<boolean>('valid', { default: false })

const card = reactive({
  number: '',
  name: '',
  expiry: '',
  cvv: '',
})

const promoCode = ref('')
const promoApplied = ref(false)

const submitting = ref(false)
const submitError = ref('')

function formatCardNumber(event: Event) {
  const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16)
  card.number = digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(event: Event) {
  const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
  card.expiry = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function formatCvv(event: Event) {
  card.cvv = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
}

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
  const cardYear = 2000 + year
  const cardMonth = new Date(cardYear, month - 1, 1)
  return cardMonth <= now
}

function applyPromo() {
  if (!promoCode.value.trim() || promoApplied.value) return
  promoApplied.value = true
}

const isCardValid = computed(() => {
  const cardNumber = card.number.replace(/\s/g, '')
  if (cardNumber.length < 13 || cardNumber.length > 19) return false
  if (!luhnCheck(cardNumber)) return false
  if (card.name.trim().length === 0) return false
  if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return false

  const [month, year] = card.expiry.split('/').map(Number)
  if (month < 1 || month > 12) return false
  if (isCardExpired(month, year)) return false

  if (card.cvv.length < 3 || card.cvv.length > 4) return false
  return true
})

watch(
  [method, isCardValid],
  ([currentMethod, cardValid]) => {
    valid.value = currentMethod === 'promptpay' ? true : cardValid
  },
  { immediate: true },
)

function clearCardData() {
  card.number = ''
  card.name = ''
  card.cvv = ''
}

async function submit(): Promise<boolean> {
  submitError.value = ''

  if (method.value === 'promptpay') {
    return true
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
    await createCharge(token, props.totalPrice, 'HomeServices booking')
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
        <input v-model="method" type="radio" name="payment-method" value="promptpay" />
        <span class="icon icon--qr" aria-hidden="true"></span>
        พร้อมเพย์
      </label>
      <label class="select-box">
        <input v-model="method" type="radio" name="payment-method" value="card" />
        <span class="icon icon--credit-card" aria-hidden="true"></span>
        บัตรเครดิต
      </label>
    </div>

    <div v-if="method === 'card'" class="payment__form">
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
            maxlength="4"
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
          :disabled="promoApplied"
        />
        <button
          class="btn btn--primary"
          type="button"
          :disabled="!promoCode.trim() || promoApplied"
          @click="applyPromo"
        >
          {{ promoApplied ? 'ใช้แล้ว' : 'ใช้โค้ด' }}
        </button>
      </div>
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
