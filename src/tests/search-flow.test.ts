import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadTransactions,
  saveTransactions,
  groupByDate,
  calculateMonthlySummary,
} from '../utils/storage'
import type { Transaction } from '../types'

describe('智能搜索流程测试', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const createTestTransactions = (): Transaction[] => [
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
      date: '2024-01-16',
      note: '地铁',
      createdAt: 2,
    },
    {
      id: '3',
      type: 'income',
      amount: 5000,
      category: 'salary',
      date: '2024-01-01',
      note: '工资',
      createdAt: 3,
    },
    {
      id: '4',
      type: 'expense',
      amount: 200,
      category: 'shopping',
      date: '2024-01-20',
      note: '购物',
      createdAt: 4,
    },
    {
      id: '5',
      type: 'expense',
      amount: 150,
      category: 'catering',
      date: '2024-01-18',
      note: '晚餐',
      createdAt: 5,
    },
    {
      id: '6',
      type: 'income',
      amount: 500,
      category: 'bonus',
      date: '2024-01-25',
      note: '奖金',
      createdAt: 6,
    },
  ]

  describe('按类型搜索', () => {
    it('搜索所有收入记录', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const incomeTransactions = loaded.filter(t => t.type === 'income')
      
      expect(incomeTransactions).toHaveLength(2)
      expect(incomeTransactions.every(t => t.type === 'income')).toBe(true)
    })

    it('搜索所有支出记录', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const expenseTransactions = loaded.filter(t => t.type === 'expense')
      
      expect(expenseTransactions).toHaveLength(4)
      expect(expenseTransactions.every(t => t.type === 'expense')).toBe(true)
    })
  })

  describe('按类别搜索', () => {
    it('搜索餐饮类支出', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const cateringTransactions = loaded.filter(t => t.category === 'catering')
      
      expect(cateringTransactions).toHaveLength(2)
      expect(cateringTransactions.every(t => t.category === 'catering')).toBe(true)
    })

    it('搜索工资类收入', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const salaryTransactions = loaded.filter(t => t.category === 'salary')
      
      expect(salaryTransactions).toHaveLength(1)
      expect(salaryTransactions[0].amount).toBe(5000)
    })

    it('搜索多个类别', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const categories = ['catering', 'transport']
      const filtered = loaded.filter(t => categories.includes(t.category))
      
      expect(filtered).toHaveLength(3)
    })
  })

  describe('按日期范围搜索', () => {
    it('搜索指定日期的记录', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => t.date === '2024-01-15')
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].note).toBe('午餐')
    })

    it('搜索日期范围内的记录', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const startDate = '2024-01-15'
      const endDate = '2024-01-20'
      const filtered = loaded.filter(t => t.date >= startDate && t.date <= endDate)
      
      expect(filtered).toHaveLength(4)
    })

    it('搜索指定月份的记录', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const monthTransactions = loaded.filter(t => t.date.startsWith('2024-01'))
      
      expect(monthTransactions).toHaveLength(6)
    })
  })

  describe('按金额范围搜索', () => {
    it('搜索大于指定金额的记录', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => t.amount > 200)
      
      expect(filtered).toHaveLength(2)
      expect(filtered.every(t => t.amount > 200)).toBe(true)
    })

    it('搜索小于指定金额的记录', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => t.amount < 100)
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].amount).toBe(50)
    })

    it('搜索金额范围内的记录', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const minAmount = 100
      const maxAmount = 200
      const filtered = loaded.filter(t => t.amount >= minAmount && t.amount <= maxAmount)
      
      expect(filtered).toHaveLength(3)
    })
  })

  describe('按备注搜索', () => {
    it('搜索备注包含关键字的记录', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const keyword = '餐'
      const filtered = loaded.filter(t => t.note.includes(keyword))
      
      expect(filtered).toHaveLength(2)
      expect(filtered.every(t => t.note.includes('餐'))).toBe(true)
    })

    it('搜索备注精确匹配', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => t.note === '工资')
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].category).toBe('salary')
    })

    it('搜索备注不存在的关键字返回空数组', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => t.note.includes('不存在的关键字'))
      
      expect(filtered).toHaveLength(0)
    })
  })

  describe('组合条件搜索', () => {
    it('搜索餐饮类支出且金额大于50', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => 
        t.category === 'catering' && t.amount > 50
      )
      
      expect(filtered).toHaveLength(2)
    })

    it('搜索收入且金额大于1000', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => 
        t.type === 'income' && t.amount > 1000
      )
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].category).toBe('salary')
    })

    it('搜索支出且日期在指定范围内', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => 
        t.type === 'expense' && t.date >= '2024-01-15' && t.date <= '2024-01-18'
      )
      
      expect(filtered).toHaveLength(3)
    })

    it('搜索支出且类别为餐饮或交通', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => 
        t.type === 'expense' && (t.category === 'catering' || t.category === 'transport')
      )
      
      expect(filtered).toHaveLength(3)
    })
  })

  describe('搜索结果排序', () => {
    it('按日期降序排列搜索结果', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const expenseTransactions = loaded
        .filter(t => t.type === 'expense')
        .sort((a, b) => b.date.localeCompare(a.date))
      
      expect(expenseTransactions[0].date).toBe('2024-01-20')
      expect(expenseTransactions[expenseTransactions.length - 1].date).toBe('2024-01-15')
    })

    it('按金额降序排列搜索结果', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const sorted = [...loaded].sort((a, b) => b.amount - a.amount)
      
      expect(sorted[0].amount).toBe(5000)
      expect(sorted[sorted.length - 1].amount).toBe(50)
    })
  })

  describe('搜索结果统计', () => {
    it('计算搜索结果的总金额', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const expenseTransactions = loaded.filter(t => t.type === 'expense')
      const totalAmount = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
      
      expect(totalAmount).toBe(500)
    })

    it('计算搜索结果的平均金额', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const expenseTransactions = loaded.filter(t => t.type === 'expense')
      const avgAmount = expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / expenseTransactions.length
      
      expect(avgAmount).toBe(125)
    })
  })

  describe('搜索结果分组', () => {
    it('按日期分组搜索结果', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const expenseTransactions = loaded.filter(t => t.type === 'expense')
      const grouped = groupByDate(expenseTransactions)
      
      expect(grouped.length).toBeGreaterThan(0)
      grouped.forEach(day => {
        day.transactions.forEach(t => {
          expect(t.type).toBe('expense')
        })
      })
    })

    it('按类别分组搜索结果', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const expenseTransactions = loaded.filter(t => t.type === 'expense')
      const byCategory: Record<string, Transaction[]> = {}
      
      expenseTransactions.forEach(t => {
        if (!byCategory[t.category]) {
          byCategory[t.category] = []
        }
        byCategory[t.category].push(t)
      })
      
      expect(Object.keys(byCategory)).toContain('catering')
      expect(Object.keys(byCategory)).toContain('transport')
      expect(Object.keys(byCategory)).toContain('shopping')
    })
  })

  describe('搜索边界情况', () => {
    it('空数据搜索返回空数组', async () => {
      saveTransactions([])
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => t.type === 'expense')
      
      expect(filtered).toHaveLength(0)
    })

    it('无匹配结果返回空数组', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => t.amount > 10000)
      
      expect(filtered).toHaveLength(0)
    })

    it('所有记录都匹配返回全部数据', async () => {
      const transactions = createTestTransactions()
      saveTransactions(transactions)
      
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => t.amount > 0)
      
      expect(filtered).toHaveLength(6)
    })
  })

  describe('搜索性能测试', () => {
    it('大数据量搜索性能', async () => {
      const largeTransactions: Transaction[] = []
      for (let i = 0; i < 1000; i++) {
        largeTransactions.push({
          id: `id-${i}`,
          type: i % 2 === 0 ? 'expense' : 'income',
          amount: Math.random() * 1000,
          category: ['catering', 'transport', 'shopping', 'salary', 'bonus'][i % 5] as any,
          date: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
          note: `记录${i}`,
          createdAt: i,
        })
      }
      
      saveTransactions(largeTransactions)
      
      const startTime = Date.now()
      const loaded = loadTransactions()
      const filtered = loaded.filter(t => t.type === 'expense' && t.amount > 500)
      const endTime = Date.now()
      
      expect(filtered.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})
