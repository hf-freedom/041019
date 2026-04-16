import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import App from '../App.vue'
import type { Transaction } from '../types'
import {
  loadTransactions,
  saveTransactions,
  generateId,
  groupByDate,
  calculateMonthlySummary,
  getCurrentMonth,
} from '../utils/storage'

describe('预算管理流程测试', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('添加收支记录流程', () => {
    it('完整流程：添加支出记录', async () => {
      const transactions: Transaction[] = []
      
      const newTransaction: Transaction = {
        id: generateId(),
        type: 'expense',
        amount: 100,
        category: 'catering',
        date: '2024-01-15',
        note: '午餐',
        createdAt: Date.now(),
      }
      
      transactions.push(newTransaction)
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].type).toBe('expense')
      expect(loaded[0].amount).toBe(100)
      expect(loaded[0].category).toBe('catering')
    })

    it('完整流程：添加收入记录', async () => {
      const transactions: Transaction[] = []
      
      const newTransaction: Transaction = {
        id: generateId(),
        type: 'income',
        amount: 5000,
        category: 'salary',
        date: '2024-01-01',
        note: '工资',
        createdAt: Date.now(),
      }
      
      transactions.push(newTransaction)
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].type).toBe('income')
      expect(loaded[0].amount).toBe(5000)
    })

    it('添加多条记录', async () => {
      const transactions: Transaction[] = []
      
      for (let i = 0; i < 5; i++) {
        transactions.push({
          id: generateId(),
          type: i % 2 === 0 ? 'expense' : 'income',
          amount: (i + 1) * 100,
          category: i % 2 === 0 ? 'catering' : 'salary',
          date: `2024-01-${String(i + 10).padStart(2, '0')}`,
          note: `记录${i + 1}`,
          createdAt: Date.now() + i,
        })
      }
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      expect(loaded).toHaveLength(5)
    })
  })

  describe('编辑收支记录流程', () => {
    it('完整流程：编辑现有记录', async () => {
      const originalTransaction: Transaction = {
        id: 'test-id',
        type: 'expense',
        amount: 100,
        category: 'catering',
        date: '2024-01-15',
        note: '午餐',
        createdAt: 1705305600000,
      }
      
      saveTransactions([originalTransaction])
      
      const transactions = loadTransactions()
      const index = transactions.findIndex(t => t.id === 'test-id')
      
      transactions[index] = {
        ...transactions[index],
        amount: 150,
        note: '午餐加饮料',
      }
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      expect(loaded[0].amount).toBe(150)
      expect(loaded[0].note).toBe('午餐加饮料')
      expect(loaded[0].id).toBe('test-id')
      expect(loaded[0].createdAt).toBe(1705305600000)
    })
  })

  describe('删除收支记录流程', () => {
    it('完整流程：删除记录', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-01-15',
          note: '午餐',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 50,
          category: 'transport',
          date: '2024-01-15',
          note: '交通',
          createdAt: 2,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => t.id !== '1')
      saveTransactions(filtered)
      
      const result = loadTransactions()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })
  })

  describe('月度预算追踪流程', () => {
    it('追踪月度支出是否超预算', async () => {
      const budgetLimit = 5000
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 2000,
          category: 'catering',
          date: '2024-01-05',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 1500,
          category: 'transport',
          date: '2024-01-10',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 2000,
          category: 'shopping',
          date: '2024-01-15',
          note: '',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      const isOverBudget = summary.totalExpense > budgetLimit
      expect(summary.totalExpense).toBe(5500)
      expect(isOverBudget).toBe(true)
    })

    it('预算内支出验证', async () => {
      const budgetLimit = 5000
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 1000,
          category: 'catering',
          date: '2024-01-05',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 1500,
          category: 'transport',
          date: '2024-01-10',
          note: '',
          createdAt: 2,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      const isOverBudget = summary.totalExpense > budgetLimit
      expect(summary.totalExpense).toBe(2500)
      expect(isOverBudget).toBe(false)
    })
  })

  describe('收支平衡流程', () => {
    it('计算月度收支平衡', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 10000,
          category: 'salary',
          date: '2024-01-01',
          note: '工资',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 3000,
          category: 'catering',
          date: '2024-01-15',
          note: '餐饮',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 2000,
          category: 'transport',
          date: '2024-01-20',
          note: '交通',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      expect(summary.totalIncome).toBe(10000)
      expect(summary.totalExpense).toBe(5000)
      expect(summary.balance).toBe(5000)
    })

    it('负结余情况', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 3000,
          category: 'salary',
          date: '2024-01-01',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 5000,
          category: 'shopping',
          date: '2024-01-15',
          note: '',
          createdAt: 2,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      expect(summary.balance).toBe(-2000)
    })
  })

  describe('类别预算管理流程', () => {
    it('追踪特定类别支出', async () => {
      const cateringBudget = 2000
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 800,
          category: 'catering',
          date: '2024-01-05',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 600,
          category: 'catering',
          date: '2024-01-10',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 500,
          category: 'catering',
          date: '2024-01-15',
          note: '',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      const cateringExpense = summary.categoryBreakdown['expense-catering'] || 0
      expect(cateringExpense).toBe(1900)
      expect(cateringExpense <= cateringBudget).toBe(true)
    })

    it('类别超预算预警', async () => {
      const entertainmentBudget = 500
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 300,
          category: 'entertainment',
          date: '2024-01-05',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 400,
          category: 'entertainment',
          date: '2024-01-10',
          note: '',
          createdAt: 2,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      const entertainmentExpense = summary.categoryBreakdown['expense-entertainment'] || 0
      expect(entertainmentExpense).toBe(700)
      expect(entertainmentExpense > entertainmentBudget).toBe(true)
    })
  })

  describe('多月份预算管理', () => {
    it('区分不同月份的记录', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 1000,
          category: 'catering',
          date: '2024-01-15',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 2000,
          category: 'catering',
          date: '2024-02-15',
          note: '',
          createdAt: 2,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const janSummary = calculateMonthlySummary(loaded, '2024-01')
      const febSummary = calculateMonthlySummary(loaded, '2024-02')
      
      expect(janSummary.totalExpense).toBe(1000)
      expect(febSummary.totalExpense).toBe(2000)
    })
  })
})
