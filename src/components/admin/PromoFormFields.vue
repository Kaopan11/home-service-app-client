<script setup lang="ts">
import DatePicker from '@/components/ui/DatePicker.vue'
import TimePicker from '@/components/ui/TimePicker.vue'
import type { PromoDiscountType } from '@/types/promo'

const code = defineModel<string>('code', { required: true })
const discountType = defineModel<PromoDiscountType>('discountType', { required: true })
const fixedValue = defineModel<string>('fixedValue', { required: true })
const percentValue = defineModel<string>('percentValue', { required: true })
const quota = defineModel<string>('quota', { required: true })
const expiryDate = defineModel<Date | null>('expiryDate', { required: true })
const expiryTime = defineModel<string | null>('expiryTime', { required: true })

function selectType(type: PromoDiscountType): void {
  discountType.value = type
}
</script>

<template>
  <div class="fields">
    <div class="row">
      <label class="label" for="promo-code">Promotion Code<span>*</span></label>
      <input id="promo-code" v-model="code" class="input" type="text" maxlength="50" />
    </div>

    <div class="row row--type">
      <span class="label">ประเภท<span>*</span></span>
      <div class="type-list">
        <div class="radio-field" @click="selectType('fixed')">
          <label class="radio">
            <input v-model="discountType" type="radio" name="promo-type" value="fixed" />
            Fixed
          </label>
          <div class="radio-input">
            <input
              v-model="fixedValue"
              type="number"
              min="0"
              step="0.01"
              inputmode="decimal"
              :disabled="discountType !== 'fixed'"
            />
            <span>฿</span>
          </div>
        </div>
        <div class="radio-field" @click="selectType('percent')">
          <label class="radio">
            <input v-model="discountType" type="radio" name="promo-type" value="percent" />
            Percent
          </label>
          <div class="radio-input">
            <input
              v-model="percentValue"
              type="number"
              min="0"
              max="100"
              step="0.01"
              inputmode="decimal"
              :disabled="discountType !== 'percent'"
            />
            <span>%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <label class="label" for="promo-quota">โควต้าการใช้</label>
      <div class="affix">
        <input id="promo-quota" v-model="quota" type="number" min="1" step="1" inputmode="numeric" />
        <span>ครั้ง</span>
      </div>
    </div>

    <div class="row">
      <span class="label">วันหมดอายุ</span>
      <div class="expiry">
        <DatePicker v-model="expiryDate" display-format="mdy" placeholder="กรุณาเลือกวันที่" />
        <TimePicker v-model="expiryTime" hour-cycle="h12" placeholder="กรุณาเลือกเวลา" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fields {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  width: 100%;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  width: 662px;
  max-width: 100%;
}

.row--type {
  align-items: flex-start;
}

.label {
  width: 205px;
  flex-shrink: 0;
  color: #646c80;
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
}

.label span {
  color: #c82438;
}

.input,
.affix {
  box-sizing: border-box;
  width: 433px;
  max-width: 100%;
  height: 44px;
  border: 1px solid #ccd0d7;
  border-radius: 8px;
  background: #ffffff;
}

.input {
  padding: 10px 16px;
  color: #000000;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 150%;
}

.input:focus,
.affix:focus-within {
  outline: none;
  border-color: #336df2;
}

.affix {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
}

.affix input,
.radio-input input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  background: transparent;
  color: #000000;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  outline: none;
}

.affix span,
.radio-input span {
  color: #9aa1b0;
  font-size: 16px;
  line-height: 150%;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-field {
  width: 433px;
  max-width: 100%;
  cursor: pointer;
}

.radio {
  width: 92px;
  flex-shrink: 0;
}

.radio-input {
  flex: 1;
  justify-content: space-between;
  gap: 8px;
}

.radio-input input {
  text-align: left;
}

.expiry {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  width: 433px;
  max-width: 100%;
}

.expiry :deep(.picker) {
  flex: 1;
  min-width: 0;
}

.expiry :deep(.picker__trigger.input) {
  height: 44px;
  padding: 10px 16px;
  border: 1px solid #ccd0d7;
  border-radius: 8px;
  background: #ffffff;
  color: #000000;
  font-size: 16px;
  box-shadow: none;
}

.expiry :deep(.picker__trigger.input:focus),
.expiry :deep(.picker--open .picker__trigger.input) {
  border-color: #336df2;
}

.expiry :deep(.dropdown__value--placeholder) {
  color: #9aa1b0;
}

input[type='number'] {
  appearance: textfield;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}
</style>
