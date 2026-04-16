import type { Transaction, DailySummary, MonthlySummary } from '../types'

const STORAGE_KEY = 'finance_transactions'

export function loadTransactions(): Transaction[] {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  try {
    return JSON.parse(data) as Transaction[]
  } catch {
    return []
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  return `${year}-${month}-${day} ${weekDay}`
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function getToday(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export function getCurrentMonth(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

export function groupByDate(transactions: Transaction[]): DailySummary[] {
  const grouped: Record<string, DailySummary> = {}

  const sorted = [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return b.createdAt - a.createdAt
  })

  for (const t of sorted) {
    if (!grouped[t.date]) {
      grouped[t.date] = {
        date: t.date,
        income: 0,
        expense: 0,
        transactions: [],
      }
    }
    grouped[t.date].transactions.push(t)
    if (t.type === 'income') {
      grouped[t.date].income += t.amount
    } else {
      grouped[t.date].expense += t.amount
    }
  }

  return Object.values(grouped)
}

export function calculateMonthlySummary(transactions: Transaction[], month: string): MonthlySummary {
  const monthTransactions = transactions.filter(t => t.date.startsWith(month))

  let totalIncome = 0
  let totalExpense = 0
  const categoryBreakdown: Record<string, number> = {}

  for (const t of monthTransactions) {
    if (t.type === 'income') {
      totalIncome += t.amount
    } else {
      totalExpense += t.amount
    }
    const key = `${t.type}-${t.category}`
    categoryBreakdown[key] = (categoryBreakdown[key] || 0) + t.amount
  }

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categoryBreakdown,
  }
}
