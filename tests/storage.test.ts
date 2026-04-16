import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  loadTransactions,
  saveTransactions,
  generateId,
  formatDate,
  formatMoney,
  getToday,
  getCurrentMonth,
  groupByDate,
  calculateMonthlySummary,
} from '../src/utils/storage'
import type { Transaction } from '../src/types'

describe('存储工具函数', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('本地存储操作', () => {
    it('没有数据时应返回空数组', () => {
      const result = loadTransactions()
      expect(result).toEqual([])
    })

    it('应正确保存和加载交易记录', () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 1000,
          category: 'salary',
          date: '2024-01-15',
          note: '工资',
          createdAt: 1700000000000,
        },
      ]

      saveTransactions(mockTransactions)
      const loaded = loadTransactions()
      expect(loaded).toEqual(mockTransactions)
    })

    it('JSON数据无效时应返回空数组', () => {
      localStorage.setItem('finance_transactions', 'invalid-json')
      const result = loadTransactions()
      expect(result).toEqual([])
    })
  })

  describe('ID生成器', () => {
    it('应生成唯一的ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^\d+-\w+$/)
    })
  })

  describe('日期工具函数', () => {
    it('应正确格式化日期并显示星期', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('2024-01-15')
      expect(result).toMatch(/(周日|周一|周二|周三|周四|周五|周六)$/)
    })

    it('应返回YYYY-MM-DD格式的今天日期', () => {
      const today = getToday()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('应返回YYYY-MM格式的当前月份', () => {
      const month = getCurrentMonth()
      expect(month).toMatch(/^\d{4}-\d{2}$/)
    })
  })

  describe('金额格式化', () => {
    it('应格式化金额为2位小数', () => {
      expect(formatMoney(1000)).toContain('1,000.00')
      expect(formatMoney(1234.56)).toContain('1,234.56')
      expect(formatMoney(0)).toBe('0.00')
    })
  })

  describe('按日期分组', () => {
    it('应按日期分组交易并计算合计', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 1000,
          category: 'salary',
          date: '2024-01-15',
          note: '',
          createdAt: 1700000000000,
        },
        {
          id: '2',
          type: 'expense',
          amount: 50,
          category: 'catering',
          date: '2024-01-15',
          note: '',
          createdAt: 1700000001000,
        },
        {
          id: '3',
          type: 'expense',
          amount: 30,
          category: 'transport',
          date: '2024-01-16',
          note: '',
          createdAt: 1700000002000,
        },
      ]

      const result = groupByDate(transactions)

      expect(result.length).toBe(2)
      expect(result[0].date).toBe('2024-01-16')
      expect(result[0].income).toBe(0)
      expect(result[0].expense).toBe(30)
      expect(result[1].date).toBe('2024-01-15')
      expect(result[1].income).toBe(1000)
      expect(result[1].expense).toBe(50)
    })

    it('没有交易记录时应返回空数组', () => {
      const result = groupByDate([])
      expect(result).toEqual([])
    })
  })

  describe('计算月度汇总', () => {
    it('应正确计算月度汇总数据', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 10000,
          category: 'salary',
          date: '2024-01-01',
          note: '',
          createdAt: 1700000000000,
        },
        {
          id: '2',
          type: 'income',
          amount: 2000,
          category: 'bonus',
          date: '2024-01-15',
          note: '',
          createdAt: 1700000001000,
        },
        {
          id: '3',
          type: 'expense',
          amount: 3000,
          category: 'catering',
          date: '2024-01-10',
          note: '',
          createdAt: 1700000002000,
        },
        {
          id: '4',
          type: 'expense',
          amount: 500,
          category: 'transport',
          date: '2024-01-20',
          note: '',
          createdAt: 1700000003000,
        },
        {
          id: '5',
          type: 'expense',
          amount: 100,
          category: 'transport',
          date: '2024-02-01',
          note: '',
          createdAt: 1700000004000,
        },
      ]

      const summary = calculateMonthlySummary(transactions, '2024-01')

      expect(summary.totalIncome).toBe(12000)
      expect(summary.totalExpense).toBe(3500)
      expect(summary.balance).toBe(8500)
      expect(summary.categoryBreakdown['income-salary']).toBe(10000)
      expect(summary.categoryBreakdown['income-bonus']).toBe(2000)
      expect(summary.categoryBreakdown['expense-catering']).toBe(3000)
      expect(summary.categoryBreakdown['expense-transport']).toBe(500)
      expect(summary.categoryBreakdown['expense-transport']).not.toBe(600)
    })

    it('该月份没有交易时应返回零汇总', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 1000,
          category: 'salary',
          date: '2024-01-01',
          note: '',
          createdAt: 1700000000000,
        },
      ]

      const summary = calculateMonthlySummary(transactions, '2024-02')

      expect(summary.totalIncome).toBe(0)
      expect(summary.totalExpense).toBe(0)
      expect(summary.balance).toBe(0)
      expect(summary.categoryBreakdown).toEqual({})
    })
  })
})
