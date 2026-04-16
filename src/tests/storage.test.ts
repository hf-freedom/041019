import { describe, it, expect, beforeEach, vi } from 'vitest'
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
} from '../utils/storage'
import type { Transaction } from '../types'

describe('storage 工具函数测试', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('loadTransactions', () => {
    it('当localStorage为空时返回空数组', () => {
      const result = loadTransactions()
      expect(result).toEqual([])
    })

    it('正确加载已存储的交易数据', () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-01-15',
          note: '午餐',
          createdAt: 1705305600000,
        },
      ]
      localStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))
      
      const result = loadTransactions()
      expect(result).toEqual(mockTransactions)
    })

    it('当JSON解析失败时返回空数组', () => {
      localStorage.setItem('finance_transactions', 'invalid json')
      const result = loadTransactions()
      expect(result).toEqual([])
    })
  })

  describe('saveTransactions', () => {
    it('正确保存交易数据到localStorage', () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 5000,
          category: 'salary',
          date: '2024-01-01',
          note: '工资',
          createdAt: 1704067200000,
        },
      ]
      
      saveTransactions(mockTransactions)
      
      const stored = localStorage.getItem('finance_transactions')
      expect(stored).toBe(JSON.stringify(mockTransactions))
    })
  })

  describe('generateId', () => {
    it('生成唯一ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('生成的ID是字符串类型', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })

    it('生成的ID包含时间戳和随机字符串', () => {
      const id = generateId()
      expect(id).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })

  describe('formatDate', () => {
    it('正确格式化日期', () => {
      const result = formatDate('2024-01-15')
      expect(result).toMatch(/2024-01-15/)
    })

    it('包含星期信息', () => {
      const result = formatDate('2024-01-15')
      expect(result).toMatch(/周[一二三四五六日]/)
    })
  })

  describe('formatMoney', () => {
    it('正确格式化金额', () => {
      expect(formatMoney(1000)).toBe('1,000.00')
    })

    it('处理小数金额', () => {
      expect(formatMoney(1234.56)).toBe('1,234.56')
    })

    it('处理零金额', () => {
      expect(formatMoney(0)).toBe('0.00')
    })

    it('处理小数位数不足的金额', () => {
      expect(formatMoney(100)).toBe('100.00')
    })
  })

  describe('getToday', () => {
    it('返回今天的日期字符串', () => {
      const result = getToday()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('getCurrentMonth', () => {
    it('返回当前月份字符串', () => {
      const result = getCurrentMonth()
      expect(result).toMatch(/^\d{4}-\d{2}$/)
    })
  })

  describe('groupByDate', () => {
    it('按日期分组交易记录', () => {
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
          type: 'income',
          amount: 5000,
          category: 'salary',
          date: '2024-01-15',
          note: '工资',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 50,
          category: 'transport',
          date: '2024-01-14',
          note: '交通',
          createdAt: 3,
        },
      ]
      
      const result = groupByDate(transactions)
      
      expect(result).toHaveLength(2)
      expect(result[0].date).toBe('2024-01-15')
      expect(result[0].income).toBe(5000)
      expect(result[0].expense).toBe(100)
      expect(result[0].transactions).toHaveLength(2)
    })

    it('按日期降序排列', () => {
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
          date: '2024-01-15',
          note: '',
          createdAt: 2,
        },
      ]
      
      const result = groupByDate(transactions)
      
      expect(result[0].date).toBe('2024-01-15')
      expect(result[1].date).toBe('2024-01-10')
    })

    it('处理空数组', () => {
      const result = groupByDate([])
      expect(result).toEqual([])
    })
  })

  describe('calculateMonthlySummary', () => {
    it('正确计算月度统计', () => {
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
          type: 'expense',
          amount: 1000,
          category: 'catering',
          date: '2024-01-15',
          note: '',
          createdAt: 2,
        },
        {
          id: '3',
          type: 'expense',
          amount: 500,
          category: 'transport',
          date: '2024-01-20',
          note: '',
          createdAt: 3,
        },
        {
          id: '4',
          type: 'expense',
          amount: 200,
          category: 'catering',
          date: '2024-02-01',
          note: '',
          createdAt: 4,
        },
      ]
      
      const result = calculateMonthlySummary(transactions, '2024-01')
      
      expect(result.totalIncome).toBe(5000)
      expect(result.totalExpense).toBe(1500)
      expect(result.balance).toBe(3500)
      expect(result.categoryBreakdown['income-salary']).toBe(5000)
      expect(result.categoryBreakdown['expense-catering']).toBe(1000)
      expect(result.categoryBreakdown['expense-transport']).toBe(500)
    })

    it('处理没有交易的月份', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-02-01',
          note: '',
          createdAt: 1,
        },
      ]
      
      const result = calculateMonthlySummary(transactions, '2024-01')
      
      expect(result.totalIncome).toBe(0)
      expect(result.totalExpense).toBe(0)
      expect(result.balance).toBe(0)
      expect(Object.keys(result.categoryBreakdown)).toHaveLength(0)
    })

    it('处理空交易数组', () => {
      const result = calculateMonthlySummary([], '2024-01')
      
      expect(result.totalIncome).toBe(0)
      expect(result.totalExpense).toBe(0)
      expect(result.balance).toBe(0)
    })
  })
})
