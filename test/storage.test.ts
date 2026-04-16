import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Transaction } from '../src/types'
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

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('loadTransactions', () => {
    it('should return empty array when no data in localStorage', () => {
      const result = loadTransactions()
      expect(result).toEqual([])
    })

    it('should return parsed transactions from localStorage', () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-01-15',
          note: 'Lunch',
          createdAt: 1705315200000,
        },
      ]
      localStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))
      const result = loadTransactions()
      expect(result).toEqual(mockTransactions)
    })

    it('should return empty array when localStorage data is invalid', () => {
      localStorage.setItem('finance_transactions', 'invalid json')
      const result = loadTransactions()
      expect(result).toEqual([])
    })
  })

  describe('saveTransactions', () => {
    it('should save transactions to localStorage', () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 5000,
          category: 'salary',
          date: '2024-01-01',
          note: 'Monthly salary',
          createdAt: 1704067200000,
        },
      ]
      saveTransactions(mockTransactions)
      const saved = localStorage.getItem('finance_transactions')
      expect(saved).toEqual(JSON.stringify(mockTransactions))
    })
  })

  describe('generateId', () => {
    it('should generate unique ids', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toEqual(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-01-15')
      expect(result).toMatch(/2024-01-15 周一/)
    })

    it('should show correct weekday', () => {
      expect(formatDate('2024-01-15')).toContain('周一')
      expect(formatDate('2024-01-14')).toContain('周日')
      expect(formatDate('2024-01-20')).toContain('周六')
    })
  })

  describe('formatMoney', () => {
    it('should format money with 2 decimal places', () => {
      expect(formatMoney(100)).toBe('100.00')
      expect(formatMoney(100.5)).toBe('100.50')
      expect(formatMoney(1000)).toBe('1,000.00')
      expect(formatMoney(1234567.89)).toBe('1,234,567.89')
    })
  })

  describe('getToday', () => {
    it('should return today date in YYYY-MM-DD format', () => {
      const result = getToday()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      const today = new Date()
      const expected = today.toISOString().split('T')[0]
      expect(result).toBe(expected)
    })
  })

  describe('getCurrentMonth', () => {
    it('should return current month in YYYY-MM format', () => {
      const result = getCurrentMonth()
      expect(result).toMatch(/^\d{4}-\d{2}$/)
      const today = new Date()
      const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
      expect(result).toBe(expected)
    })
  })

  describe('groupByDate', () => {
    it('should group transactions by date', () => {
      const transactions: Transaction[] = [
        { id: '1', type: 'expense', amount: 50, category: 'catering', date: '2024-01-15', note: '', createdAt: 1 },
        { id: '2', type: 'income', amount: 100, category: 'salary', date: '2024-01-15', note: '', createdAt: 2 },
        { id: '3', type: 'expense', amount: 30, category: 'transport', date: '2024-01-14', note: '', createdAt: 3 },
      ]
      const result = groupByDate(transactions)
      expect(result).toHaveLength(2)
      expect(result[0].date).toBe('2024-01-15')
      expect(result[0].income).toBe(100)
      expect(result[0].expense).toBe(50)
      expect(result[0].transactions).toHaveLength(2)
      expect(result[1].date).toBe('2024-01-14')
      expect(result[1].expense).toBe(30)
    })

    it('should sort by date descending', () => {
      const transactions: Transaction[] = [
        { id: '1', type: 'expense', amount: 10, category: 'catering', date: '2024-01-10', note: '', createdAt: 1 },
        { id: '2', type: 'expense', amount: 20, category: 'catering', date: '2024-01-20', note: '', createdAt: 2 },
        { id: '3', type: 'expense', amount: 30, category: 'catering', date: '2024-01-15', note: '', createdAt: 3 },
      ]
      const result = groupByDate(transactions)
      expect(result[0].date).toBe('2024-01-20')
      expect(result[1].date).toBe('2024-01-15')
      expect(result[2].date).toBe('2024-01-10')
    })

    it('should return empty array for empty input', () => {
      const result = groupByDate([])
      expect(result).toEqual([])
    })
  })

  describe('calculateMonthlySummary', () => {
    it('should calculate monthly summary correctly', () => {
      const transactions: Transaction[] = [
        { id: '1', type: 'income', amount: 5000, category: 'salary', date: '2024-01-01', note: '', createdAt: 1 },
        { id: '2', type: 'expense', amount: 1000, category: 'catering', date: '2024-01-05', note: '', createdAt: 2 },
        { id: '3', type: 'expense', amount: 500, category: 'transport', date: '2024-01-10', note: '', createdAt: 3 },
        { id: '4', type: 'income', amount: 1000, category: 'bonus', date: '2024-02-01', note: '', createdAt: 4 },
      ]
      const result = calculateMonthlySummary(transactions, '2024-01')
      expect(result.totalIncome).toBe(5000)
      expect(result.totalExpense).toBe(1500)
      expect(result.balance).toBe(3500)
      expect(result.categoryBreakdown).toEqual({
        'income-salary': 5000,
        'expense-catering': 1000,
        'expense-transport': 500,
      })
    })

    it('should handle empty month', () => {
      const transactions: Transaction[] = [
        { id: '1', type: 'expense', amount: 100, category: 'catering', date: '2024-02-01', note: '', createdAt: 1 },
      ]
      const result = calculateMonthlySummary(transactions, '2024-01')
      expect(result.totalIncome).toBe(0)
      expect(result.totalExpense).toBe(0)
      expect(result.balance).toBe(0)
      expect(result.categoryBreakdown).toEqual({})
    })

    it('should handle empty transactions', () => {
      const result = calculateMonthlySummary([], '2024-01')
      expect(result.totalIncome).toBe(0)
      expect(result.totalExpense).toBe(0)
      expect(result.balance).toBe(0)
      expect(result.categoryBreakdown).toEqual({})
    })
  })
})
