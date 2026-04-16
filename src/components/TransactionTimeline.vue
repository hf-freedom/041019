<script setup lang="ts">
import type { Transaction, DailySummary } from '../types'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../types'
import { formatDate, formatMoney } from '../utils/storage'

defineProps<{
  dailySummaries: DailySummary[]
}>()

const emit = defineEmits<{
  (e: 'edit', transaction: Transaction): void
  (e: 'delete', id: string): void
}>()

function handleDelete(id: string) {
  if (confirm('确定要删除这条记录吗？')) {
    emit('delete', id)
  }
}
</script>

<template>
  <div class="timeline">
    <div v-if="dailySummaries.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <p>暂无记录</p>
      <p class="empty-hint">点击右上角"新增记录"开始记账</p>
    </div>

    <div v-for="day in dailySummaries" :key="day.date" class="day-group">
      <div class="day-header">
        <div class="day-date">{{ formatDate(day.date) }}</div>
        <div class="day-summary">
          <span v-if="day.income > 0" class="income">
            收入: +¥{{ formatMoney(day.income) }}
          </span>
          <span v-if="day.expense > 0" class="expense">
            支出: -¥{{ formatMoney(day.expense) }}
          </span>
        </div>
      </div>

      <div class="transaction-list">
        <div 
          v-for="transaction in day.transactions" 
          :key="transaction.id"
          class="transaction-item"
        >
          <div class="transaction-icon">
            {{ CATEGORY_ICONS[transaction.category] }}
          </div>
          <div class="transaction-info">
            <div class="transaction-category">
              {{ CATEGORY_LABELS[transaction.category] }}
            </div>
            <div v-if="transaction.note" class="transaction-note">
              {{ transaction.note }}
            </div>
          </div>
          <div class="transaction-amount" :class="transaction.type">
            {{ transaction.type === 'income' ? '+' : '-' }}¥{{ formatMoney(transaction.amount) }}
          </div>
          <div class="transaction-actions">
            <button class="action-btn edit" @click="emit('edit', transaction)" title="编辑">
              ✏️
            </button>
            <button class="action-btn delete" @click="handleDelete(transaction.id)" title="删除">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 4px 0;
}

.empty-hint {
  font-size: 14px;
  color: #bbb;
}

.day-group {
  margin-bottom: 16px;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.day-date {
  font-weight: 600;
  color: #333;
}

.day-summary {
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.day-summary .income {
  color: #4CAF50;
}

.day-summary .expense {
  color: #f44336;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.transaction-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transaction-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 22px;
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-category {
  font-weight: 500;
  color: #333;
}

.transaction-note {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 600;
  min-width: 100px;
  text-align: right;
}

.transaction-amount.income {
  color: #4CAF50;
}

.transaction-amount.expense {
  color: #f44336;
}

.transaction-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.transaction-item:hover .transaction-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #e0e0e0;
}

.action-btn.delete:hover {
  background: #ffebee;
}
</style>
