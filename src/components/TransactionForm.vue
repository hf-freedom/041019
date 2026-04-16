<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Transaction, TransactionType, Category, ExpenseCategory, IncomeCategory } from '../types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types'
import { generateId, getToday } from '../utils/storage'

const props = defineProps<{
  editTransaction?: Transaction | null
}>()

const emit = defineEmits<{
  (e: 'submit', transaction: Transaction): void
  (e: 'cancel'): void
}>()

const type = ref<TransactionType>('expense')
const amount = ref<number>(0)
const category = ref<Category>('catering')
const date = ref<string>(getToday())
const note = ref<string>('')

const categories = computed(() => {
  return type.value === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
})

watch(type, () => {
  category.value = categories.value[0].value
})

watch(() => props.editTransaction, (newVal) => {
  if (newVal) {
    type.value = newVal.type
    amount.value = newVal.amount
    category.value = newVal.category
    date.value = newVal.date
    note.value = newVal.note
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  type.value = 'expense'
  amount.value = 0
  category.value = 'catering'
  date.value = getToday()
  note.value = ''
}

function handleSubmit() {
  if (amount.value <= 0) {
    alert('请输入有效金额')
    return
  }

  const transaction: Transaction = {
    id: props.editTransaction?.id || generateId(),
    type: type.value,
    amount: amount.value,
    category: category.value,
    date: date.value,
    note: note.value,
    createdAt: props.editTransaction?.createdAt || Date.now(),
  }

  emit('submit', transaction)
  resetForm()
}

function handleCancel() {
  resetForm()
  emit('cancel')
}
</script>

<template>
  <div class="transaction-form">
    <h3>{{ editTransaction ? '编辑记录' : '新增记录' }}</h3>
    
    <div class="form-group">
      <label>类型</label>
      <div class="type-tabs">
        <button 
          :class="['type-tab', { active: type === 'expense' }]"
          @click="type = 'expense'"
        >
          支出
        </button>
        <button 
          :class="['type-tab', { active: type === 'income' }]"
          @click="type = 'income'"
        >
          收入
        </button>
      </div>
    </div>

    <div class="form-group">
      <label>金额</label>
      <div class="amount-input">
        <span class="currency">¥</span>
        <input 
          type="number" 
          v-model.number="amount" 
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>
    </div>

    <div class="form-group">
      <label>类别</label>
      <div class="category-grid">
        <button
          v-for="cat in categories"
          :key="cat.value"
          :class="['category-btn', { active: category === cat.value }]"
          @click="category = cat.value"
        >
          <span class="category-icon">{{ cat.icon }}</span>
          <span class="category-label">{{ cat.label }}</span>
        </button>
      </div>
    </div>

    <div class="form-group">
      <label>日期</label>
      <input type="date" v-model="date" />
    </div>

    <div class="form-group">
      <label>备注</label>
      <input 
        type="text" 
        v-model="note" 
        placeholder="添加备注（可选）"
        maxlength="100"
      />
    </div>

    <div class="form-actions">
      <button class="btn-cancel" @click="handleCancel">取消</button>
      <button class="btn-submit" @click="handleSubmit">
        {{ editTransaction ? '保存' : '添加' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.transaction-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.transaction-form h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.type-tabs {
  display: flex;
  gap: 8px;
}

.type-tab {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-tab.active {
  border-color: #4CAF50;
  background: #f1f8f1;
  color: #4CAF50;
}

.type-tab:hover:not(.active) {
  border-color: #ccc;
}

.amount-input {
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.amount-input:focus-within {
  border-color: #4CAF50;
}

.currency {
  padding: 12px 16px;
  background: #f5f5f5;
  font-size: 18px;
  color: #666;
}

.amount-input input {
  flex: 1;
  border: none;
  padding: 12px;
  font-size: 18px;
  outline: none;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  border-color: #ccc;
}

.category-btn.active {
  border-color: #4CAF50;
  background: #f1f8f1;
}

.category-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.category-label {
  font-size: 12px;
  color: #666;
}

input[type="date"],
input[type="text"] {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

input[type="date"]:focus,
input[type="text"]:focus {
  border-color: #4CAF50;
  outline: none;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: #4CAF50;
  color: white;
}

.btn-submit:hover {
  background: #43A047;
}
</style>
