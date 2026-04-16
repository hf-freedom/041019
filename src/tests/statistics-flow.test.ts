import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadTransactions,
  saveTransactions,
  groupByDate,
  calculateMonthlySummary,
  formatMoney,
} from '../utils/storage'
import type { Transaction } from '../types'

describe('数据统计流程测试', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('收入统计流程', () => {
    it('统计单一收入记录', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 5000,
          category: 'salary',
          date: '2024-01-01',
          note: '工资',
          createdAt: 1,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      expect(summary.totalIncome).toBe(5000)
      expect(summary.totalExpense).toBe(0)
      expect(summary.balance).toBe(5000)
    })

    it('统计多条收入记录', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 5000,
          category: 'salary',
          date: '2024-01-01',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'income',
          amount: 1000,
          category: 'bonus',
          date: '2024-01-15',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'income',
          amount: 500,
          category: 'investment',
          date: '2024-01-20',
          note: '',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      expect(summary.totalIncome).toBe(6500)
    })

    it('按类别统计收入', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 5000,
          category: 'salary',
          date: '2024-01-01',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'income',
          amount: 3000,
          category: 'salary',
          date: '2024-01-15',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'income',
          amount: 500,
          category: 'bonus',
          date: '2024-01-20',
          note: '',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      expect(summary.categoryBreakdown['income-salary']).toBe(8000)
      expect(summary.categoryBreakdown['income-bonus']).toBe(500)
    })
  })

  describe('支出统计流程', () => {
    it('统计单一支出记录', async () => {
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
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      expect(summary.totalIncome).toBe(0)
      expect(summary.totalExpense).toBe(100)
      expect(summary.balance).toBe(-100)
    })

    it('统计多条支出记录', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 500,
          category: 'catering',
          date: '2024-01-05',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 300,
          category: 'transport',
          date: '2024-01-10',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 200,
          category: 'shopping',
          date: '2024-01-15',
          note: '',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      expect(summary.totalExpense).toBe(1000)
    })

    it('按类别统计支出', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 300,
          category: 'catering',
          date: '2024-01-05',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 200,
          category: 'catering',
          date: '2024-01-10',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 150,
          category: 'transport',
          date: '2024-01-15',
          note: '',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      expect(summary.categoryBreakdown['expense-catering']).toBe(500)
      expect(summary.categoryBreakdown['expense-transport']).toBe(150)
    })
  })

  describe('收支混合统计流程', () => {
    it('统计收支混合记录', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 10000,
          category: 'salary',
          date: '2024-01-01',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 2000,
          category: 'catering',
          date: '2024-01-10',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 1500,
          category: 'transport',
          date: '2024-01-15',
          note: '',
          createdAt: 3,
        },
        {
          id: '4',
          type: 'income',
          amount: 500,
          category: 'bonus',
          date: '2024-01-20',
          note: '',
          createdAt: 4,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      expect(summary.totalIncome).toBe(10500)
      expect(summary.totalExpense).toBe(3500)
      expect(summary.balance).toBe(7000)
    })
  })

  describe('日期分组统计流程', () => {
    it('按日期分组显示统计', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-01-15',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'income',
          amount: 500,
          category: 'bonus',
          date: '2024-01-15',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 50,
          category: 'transport',
          date: '2024-01-14',
          note: '',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const dailySummaries = groupByDate(loaded)
      
      expect(dailySummaries).toHaveLength(2)
      
      const jan15 = dailySummaries.find(d => d.date === '2024-01-15')
      expect(jan15?.income).toBe(500)
      expect(jan15?.expense).toBe(100)
      expect(jan15?.transactions).toHaveLength(2)
      
      const jan14 = dailySummaries.find(d => d.date === '2024-01-14')
      expect(jan14?.expense).toBe(50)
      expect(jan14?.transactions).toHaveLength(1)
    })

    it('日期分组按降序排列', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-01-10',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-01-20',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-01-15',
          note: '',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const dailySummaries = groupByDate(loaded)
      
      expect(dailySummaries[0].date).toBe('2024-01-20')
      expect(dailySummaries[1].date).toBe('2024-01-15')
      expect(dailySummaries[2].date).toBe('2024-01-10')
    })
  })

  describe('类别分布统计流程', () => {
    it('统计各类别占比', async () => {
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
          amount: 500,
          category: 'transport',
          date: '2024-01-10',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 300,
          category: 'shopping',
          date: '2024-01-15',
          note: '',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      const totalExpense = summary.totalExpense
      const cateringPercent = (summary.categoryBreakdown['expense-catering'] / totalExpense) * 100
      const transportPercent = (summary.categoryBreakdown['expense-transport'] / totalExpense) * 100
      const shoppingPercent = (summary.categoryBreakdown['expense-shopping'] / totalExpense) * 100
      
      expect(cateringPercent).toBeCloseTo(55.56, 1)
      expect(transportPercent).toBeCloseTo(27.78, 1)
      expect(shoppingPercent).toBeCloseTo(16.67, 1)
    })

    it('类别分布按金额降序', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'shopping',
          date: '2024-01-05',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 500,
          category: 'catering',
          date: '2024-01-10',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 300,
          category: 'transport',
          date: '2024-01-15',
          note: '',
          createdAt: 3,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const summary = calculateMonthlySummary(loaded, '2024-01')
      
      const sortedCategories = Object.entries(summary.categoryBreakdown)
        .filter(([key]) => key.startsWith('expense-'))
        .sort((a, b) => b[1] - a[1])
      
      expect(sortedCategories[0][0]).toBe('expense-catering')
      expect(sortedCategories[1][0]).toBe('expense-transport')
      expect(sortedCategories[2][0]).toBe('expense-shopping')
    })
  })

  describe('金额格式化统计', () => {
    it('正确格式化金额显示', async () => {
      expect(formatMoney(1000)).toBe('1,000.00')
      expect(formatMoney(12345.67)).toBe('12,345.67')
      expect(formatMoney(0)).toBe('0.00')
      expect(formatMoney(100)).toBe('100.00')
    })
  })

  describe('跨月统计流程', () => {
    it('区分不同月份的统计数据', async () => {
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
        {
          id: '3',
          type: 'income',
          amount: 5000,
          category: 'salary',
          date: '2024-01-01',
          note: '',
          createdAt: 3,
        },
        {
          id: '4',
          type: 'income',
          amount: 6000,
          category: 'salary',
          date: '2024-02-01',
          note: '',
          createdAt: 4,
        },
      ]
      
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const janSummary = calculateMonthlySummary(loaded, '2024-01')
      const febSummary = calculateMonthlySummary(loaded, '2024-02')
      
      expect(janSummary.totalIncome).toBe(5000)
      expect(janSummary.totalExpense).toBe(1000)
      expect(janSummary.balance).toBe(4000)
      
      expect(febSummary.totalIncome).toBe(6000)
      expect(febSummary.totalExpense).toBe(2000)
      expect(febSummary.balance).toBe(4000)
    })
  })

  describe('数据持久化统计', () => {
    it('统计数据持久化到localStorage', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 5000,
          category: 'salary',
          date: '2024-01-01',
          note: '工资',
          createdAt: 1,
        },
      ]
      
      saveTransactions(transactions)
      
      const storedData = localStorage.getItem('finance_transactions')
      expect(storedData).toBeTruthy()
      
      const parsed = JSON.parse(storedData!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].amount).toBe(5000)
    })

    it('重新加载后统计数据正确', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 10000,
          category: 'salary',
          date: '2024-01-01',
          note: '',
          createdAt: 1,
        },
        {
          id: '2',
          type: 'expense',
          amount: 3000,
          category: 'catering',
          date: '2024-01-15',
          note: '',
          createdAt: 2,
        },
      ]
      
      saveTransactions(transactions)
      
      const reloaded = loadTransactions()
      const summary = calculateMonthlySummary(reloaded, '2024-01')
      
      expect(summary.totalIncome).toBe(10000)
      expect(summary.totalExpense).toBe(3000)
      expect(summary.balance).toBe(7000)
    })
  })
})
