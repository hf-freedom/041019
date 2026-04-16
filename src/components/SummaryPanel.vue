<script setup lang="ts">
import type { MonthlySummary } from '../types'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../types'
import { formatMoney } from '../utils/storage'

defineProps<{
  summary: MonthlySummary
  currentMonth: string
}>()

function getMonthDisplay(month: string): string {
  const [year, m] = month.split('-')
  return `${year}年${parseInt(m)}月`
}

function getBreakdownItems(summary: MonthlySummary) {
  return Object.entries(summary.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, amount]) => {
      const [type, category] = key.split('-')
      return {
        category: category as keyof typeof CATEGORY_LABELS,
        type,
        amount,
        label: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
        icon: CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS],
      }
    })
}
</script>

<template>
  <div class="summary-panel">
    <div class="month-title">{{ getMonthDisplay(currentMonth) }}</div>
    
    <div class="summary-cards">
      <div class="summary-card income">
        <div class="card-label">收入</div>
        <div class="card-amount">¥{{ formatMoney(summary.totalIncome) }}</div>
      </div>
      <div class="summary-card expense">
        <div class="card-label">支出</div>
        <div class="card-amount">¥{{ formatMoney(summary.totalExpense) }}</div>
      </div>
      <div class="summary-card balance" :class="{ negative: summary.balance < 0 }">
        <div class="card-label">结余</div>
        <div class="card-amount">¥{{ formatMoney(Math.abs(summary.balance)) }}</div>
      </div>
    </div>

    <div class="category-breakdown">
      <h4>类别分布</h4>
      <div v-if="getBreakdownItems(summary).length === 0" class="no-data">
        暂无数据
      </div>
      <div v-else class="breakdown-list">
        <div 
          v-for="item in getBreakdownItems(summary)" 
          :key="`${item.type}-${item.category}`"
          class="breakdown-item"
        >
          <span class="breakdown-icon">{{ item.icon }}</span>
          <span class="breakdown-label">{{ item.label }}</span>
          <span class="breakdown-amount" :class="item.type">
            {{ item.type === 'income' ? '+' : '-' }}¥{{ formatMoney(item.amount) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.month-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.summary-card {
  padding: 16px 12px;
  border-radius: 10px;
  text-align: center;
}

.summary-card.income {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.summary-card.expense {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
}

.summary-card.balance {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.summary-card.balance.negative {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
}

.card-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.card-amount {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.category-breakdown h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #666;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.breakdown-icon {
  font-size: 18px;
}

.breakdown-label {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.breakdown-amount {
  font-size: 14px;
  font-weight: 500;
}

.breakdown-amount.income {
  color: #4CAF50;
}

.breakdown-amount.expense {
  color: #f44336;
}
</style>
