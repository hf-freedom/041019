<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TransactionForm from './components/TransactionForm.vue'
import TransactionTimeline from './components/TransactionTimeline.vue'
import SummaryPanel from './components/SummaryPanel.vue'
import type { Transaction } from './types'
import { 
  loadTransactions, 
  saveTransactions, 
  groupByDate, 
  calculateMonthlySummary,
  getCurrentMonth 
} from './utils/storage'

const transactions = ref<Transaction[]>([])
const showForm = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const currentMonth = ref(getCurrentMonth())

const dailySummaries = computed(() => {
  const monthTransactions = transactions.value.filter(t => 
    t.date.startsWith(currentMonth.value)
  )
  return groupByDate(monthTransactions)
})

const monthlySummary = computed(() => {
  return calculateMonthlySummary(transactions.value, currentMonth.value)
})

onMounted(() => {
  transactions.value = loadTransactions()
})

function handleAddNew() {
  editingTransaction.value = null
  showForm.value = true
}

function handleEdit(transaction: Transaction) {
  editingTransaction.value = transaction
  showForm.value = true
}

function handleSubmit(transaction: Transaction) {
  const index = transactions.value.findIndex(t => t.id === transaction.id)
  if (index >= 0) {
    transactions.value[index] = transaction
  } else {
    transactions.value.push(transaction)
  }
  saveTransactions(transactions.value)
  showForm.value = false
  editingTransaction.value = null
}

function handleDelete(id: string) {
  transactions.value = transactions.value.filter(t => t.id !== id)
  saveTransactions(transactions.value)
}

function handleCancel() {
  showForm.value = false
  editingTransaction.value = null
}

function prevMonth() {
  const [year, month] = currentMonth.value.split('-').map(Number)
  const date = new Date(year, month - 2, 1)
  currentMonth.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth() {
  const [year, month] = currentMonth.value.split('-').map(Number)
  const date = new Date(year, month, 1)
  currentMonth.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function goToToday() {
  currentMonth.value = getCurrentMonth()
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <h1 class="logo">💰 财务流水看板</h1>
        <button class="add-btn" @click="handleAddNew">
          <span class="add-icon">+</span>
          新增记录
        </button>
      </div>
    </header>

    <main class="main">
      <aside class="sidebar">
        <div class="month-nav">
          <button class="nav-btn" @click="prevMonth">‹</button>
          <span class="current-month">{{ currentMonth }}</span>
          <button class="nav-btn" @click="nextMonth">›</button>
          <button class="today-btn" @click="goToToday">今</button>
        </div>
        <SummaryPanel :summary="monthlySummary" :current-month="currentMonth" />
      </aside>

      <section class="content">
        <TransactionTimeline 
          :daily-summaries="dailySummaries"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </section>
    </main>

    <div v-if="showForm" class="modal-overlay" @click.self="handleCancel">
      <div class="modal">
        <TransactionForm
          :edit-transaction="editingTransaction"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #43A047;
  transform: translateY(-1px);
}

.add-icon {
  font-size: 20px;
  font-weight: 300;
}

.main {
  flex: 1;
  display: flex;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  gap: 24px;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-btn:hover {
  background: #e0e0e0;
}

.current-month {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.today-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #4CAF50;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.today-btn:hover {
  background: #43A047;
}

.content {
  flex: 1;
  min-width: 0;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

@media (max-width: 900px) {
  .main {
    flex-direction: column;
    padding: 16px;
  }

  .sidebar {
    width: 100%;
  }

  .header-content {
    padding: 12px 16px;
  }

  .logo {
    font-size: 20px;
  }
}
</style>
