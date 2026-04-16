import { describe, it, expect, beforeEach } from 'vitest'
import type { Transaction } from '../src/types'
import {
  loadTransactions,
  saveTransactions,
  generateId,
  groupByDate,
  calculateMonthlySummary,
  getToday,
} from '../src/utils/storage'

describe('交易管理流程', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('增删改查操作', () => {
    it('应成功添加一笔收入交易', () => {
      const transactions: Transaction[] = []

      const newTransaction: Transaction = {
        id: generateId(),
        type: 'income',
        amount: 15000,
        category: 'salary',
        date: getToday(),
        note: '1月份工资',
        createdAt: Date.now(),
      }

      transactions.push(newTransaction)
      saveTransactions(transactions)

      const loaded = loadTransactions()
      expect(loaded.length).toBe(1)
      expect(loaded[0].type).toBe('income')
      expect(loaded[0].amount).toBe(15000)
      expect(loaded[0].category).toBe('salary')
      expect(loaded[0].note).toBe('1月份工资')
    })

    it('应成功添加一笔支出交易', () => {
      const transactions: Transaction[] = []

      const newTransaction: Transaction = {
        id: generateId(),
        type: 'expense',
        amount: 88.5,
        category: 'catering',
        date: getToday(),
        note: '午餐',
        createdAt: Date.now(),
      }

      transactions.push(newTransaction)
      saveTransactions(transactions)

      const loaded = loadTransactions()
      expect(loaded.length).toBe(1)
      expect(loaded[0].type).toBe('expense')
      expect(loaded[0].amount).toBe(88.5)
      expect(loaded[0].category).toBe('catering')
    })

    it('应编辑现有的交易记录', () => {
      const transactions: Transaction[] = [
        {
          id: 'test-id-1',
          type: 'expense',
          amount: 50,
          category: 'catering',
          date: '2024-01-15',
          note: '早餐',
          createdAt: 1700000000000,
        },
      ]
      saveTransactions(transactions)

      const loaded = loadTransactions()
      const index = loaded.findIndex(t => t.id === 'test-id-1')
      loaded[index] = {
        ...loaded[index],
        amount: 65,
        note: '早餐+咖啡',
        category: 'catering',
      }
      saveTransactions(loaded)

      const updated = loadTransactions()
      expect(updated[0].amount).toBe(65)
      expect(updated[0].note).toBe('早餐+咖啡')
    })

    it('应删除一笔交易记录', () => {
      const transactions: Transaction[] = [
        {
          id: 'test-id-1',
          type: 'expense',
          amount: 50,
          category: 'catering',
          date: '2024-01-15',
          note: '早餐',
          createdAt: 1700000000000,
        },
        {
          id: 'test-id-2',
          type: 'income',
          amount: 10000,
          category: 'salary',
          date: '2024-01-15',
          note: '工资',
          createdAt: 1700000001000,
        },
      ]
      saveTransactions(transactions)

      const afterDelete = loadTransactions().filter(t => t.id !== 'test-id-1')
      saveTransactions(afterDelete)

      const final = loadTransactions()
      expect(final.length).toBe(1)
      expect(final[0].id).toBe('test-id-2')
    })
  })

  describe('数据统计流程', () => {
    it('添加多笔交易后应正确计算统计数据', () => {
      const transactions: Transaction[] = []
      const testMonth = '2024-01'

      transactions.push(
        {
          id: '1',
          type: 'income',
          amount: 15000,
          category: 'salary',
          date: '2024-01-05',
          note: '工资',
          createdAt: 1700000000000,
        },
        {
          id: '2',
          type: 'income',
          amount: 2000,
          category: 'bonus',
          date: '2024-01-10',
          note: '年终奖',
          createdAt: 1700000001000,
        },
        {
          id: '3',
          type: 'expense',
          amount: 3000,
          category: 'shopping',
          date: '2024-01-08',
          note: '买衣服',
          createdAt: 1700000002000,
        },
        {
          id: '4',
          type: 'expense',
          amount: 500,
          category: 'catering',
          date: '2024-01-15',
          note: '聚餐',
          createdAt: 1700000003000,
        },
        {
          id: '5',
          type: 'expense',
          amount: 200,
          category: 'transport',
          date: '2024-01-20',
          note: '打车',
          createdAt: 1700000004000,
        }
      )

      const summary = calculateMonthlySummary(transactions, testMonth)

      expect(summary.totalIncome).toBe(17000)
      expect(summary.totalExpense).toBe(3700)
      expect(summary.balance).toBe(13300)
      expect(summary.categoryBreakdown['income-salary']).toBe(15000)
      expect(summary.categoryBreakdown['income-bonus']).toBe(2000)
      expect(summary.categoryBreakdown['expense-shopping']).toBe(3000)
      expect(summary.categoryBreakdown['expense-catering']).toBe(500)
      expect(summary.categoryBreakdown['expense-transport']).toBe(200)
    })

    it('编辑交易后统计数据应正确更新', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-01-15',
          note: '午餐',
          createdAt: 1700000000000,
        },
      ]

      const initialSummary = calculateMonthlySummary(transactions, '2024-01')
      expect(initialSummary.totalExpense).toBe(100)
      expect(initialSummary.categoryBreakdown['expense-catering']).toBe(100)

      transactions[0].amount = 200
      transactions[0].category = 'shopping'

      const updatedSummary = calculateMonthlySummary(transactions, '2024-01')
      expect(updatedSummary.totalExpense).toBe(200)
      expect(updatedSummary.categoryBreakdown['expense-shopping']).toBe(200)
      expect(updatedSummary.categoryBreakdown['expense-catering']).toBeUndefined()
    })

    it('删除交易后统计数据应正确更新', () => {
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
          type: 'expense',
          amount: 1000,
          category: 'shopping',
          date: '2024-01-15',
          note: '',
          createdAt: 1700000001000,
        },
      ]

      const initialSummary = calculateMonthlySummary(transactions, '2024-01')
      expect(initialSummary.totalIncome).toBe(10000)
      expect(initialSummary.totalExpense).toBe(1000)
      expect(initialSummary.balance).toBe(9000)

      const filtered = transactions.filter(t => t.id !== '2')
      const afterDeleteSummary = calculateMonthlySummary(filtered, '2024-01')
      expect(afterDeleteSummary.totalIncome).toBe(10000)
      expect(afterDeleteSummary.totalExpense).toBe(0)
      expect(afterDeleteSummary.balance).toBe(10000)
    })

    it('应正确跨多日期分组每日汇总', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 10000,
          category: 'salary',
          date: '2024-01-05',
          note: '',
          createdAt: 1700000000000,
        },
        {
          id: '2',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-01-05',
          note: '',
          createdAt: 1700000001000,
        },
        {
          id: '3',
          type: 'expense',
          amount: 50,
          category: 'transport',
          date: '2024-01-06',
          note: '',
          createdAt: 1700000002000,
        },
        {
          id: '4',
          type: 'expense',
          amount: 200,
          category: 'entertainment',
          date: '2024-01-06',
          note: '',
          createdAt: 1700000003000,
        },
        {
          id: '5',
          type: 'income',
          amount: 500,
          category: 'investment',
          date: '2024-01-07',
          note: '',
          createdAt: 1700000004000,
        },
      ]

      const dailySummaries = groupByDate(transactions)

      expect(dailySummaries.length).toBe(3)
      expect(dailySummaries[0].date).toBe('2024-01-07')
      expect(dailySummaries[0].income).toBe(500)
      expect(dailySummaries[0].expense).toBe(0)

      expect(dailySummaries[1].date).toBe('2024-01-06')
      expect(dailySummaries[1].income).toBe(0)
      expect(dailySummaries[1].expense).toBe(250)

      expect(dailySummaries[2].date).toBe('2024-01-05')
      expect(dailySummaries[2].income).toBe(10000)
      expect(dailySummaries[2].expense).toBe(100)
    })

    it('应处理边界情况：空交易数据统计', () => {
      const summary = calculateMonthlySummary([], '2024-01')
      expect(summary.totalIncome).toBe(0)
      expect(summary.totalExpense).toBe(0)
      expect(summary.balance).toBe(0)
      expect(Object.keys(summary.categoryBreakdown).length).toBe(0)

      const dailySummaries = groupByDate([])
      expect(dailySummaries.length).toBe(0)
    })
  })

  describe('智能搜索流程', () => {
    const createTestTransactions = (): Transaction[] => [
      {
        id: '1',
        type: 'expense',
        amount: 35,
        category: 'catering',
        date: '2024-01-15',
        note: '麦当劳午餐',
        createdAt: 1700000000000,
      },
      {
        id: '2',
        type: 'expense',
        amount: 88,
        category: 'catering',
        date: '2024-01-16',
        note: '星巴克咖啡',
        createdAt: 1700000001000,
      },
      {
        id: '3',
        type: 'expense',
        amount: 150,
        category: 'shopping',
        date: '2024-01-15',
        note: '买衣服',
        createdAt: 1700000002000,
      },
      {
        id: '4',
        type: 'income',
        amount: 500,
        category: 'investment',
        date: '2024-01-15',
        note: '基金收益',
        createdAt: 1700000003000,
      },
      {
        id: '5',
        type: 'expense',
        amount: 45,
        category: 'transport',
        date: '2024-01-17',
        note: '滴滴打车去公司',
        createdAt: 1700000004000,
      },
    ]

    it('应按类别过滤交易', () => {
      const transactions = createTestTransactions()

      const cateringTransactions = transactions.filter(t => t.category === 'catering')
      expect(cateringTransactions.length).toBe(2)
      expect(cateringTransactions.every(t => t.category === 'catering')).toBe(true)

      const transportTransactions = transactions.filter(t => t.category === 'transport')
      expect(transportTransactions.length).toBe(1)
      expect(transportTransactions[0].amount).toBe(45)
    })

    it('应按交易类型过滤', () => {
      const transactions = createTestTransactions()

      const incomeTransactions = transactions.filter(t => t.type === 'income')
      expect(incomeTransactions.length).toBe(1)
      expect(incomeTransactions[0].category).toBe('investment')

      const expenseTransactions = transactions.filter(t => t.type === 'expense')
      expect(expenseTransactions.length).toBe(4)
    })

    it('应按备注关键词搜索交易', () => {
      const transactions = createTestTransactions()

      const coffeeTransactions = transactions.filter(t =>
        t.note.includes('咖啡')
      )
      expect(coffeeTransactions.length).toBe(1)
      expect(coffeeTransactions[0].note).toContain('星巴克咖啡')

      const companyTransactions = transactions.filter(t =>
        t.note.includes('公司')
      )
      expect(companyTransactions.length).toBe(1)
      expect(companyTransactions[0].category).toBe('transport')
    })

    it('应支持模糊匹配关键词搜索', () => {
      const transactions = createTestTransactions()

      const searchKeyword = '麦'
      const results = transactions.filter(t =>
        t.note.includes(searchKeyword) ||
        t.category.includes(searchKeyword)
      )
      expect(results.length).toBe(1)
      expect(results[0].note).toBe('麦当劳午餐')
    })

    it('应按日期范围过滤交易', () => {
      const transactions = createTestTransactions()

      const startDate = '2024-01-15'
      const endDate = '2024-01-16'

      const dateRangeTransactions = transactions.filter(t =>
        t.date >= startDate && t.date <= endDate
      )

      expect(dateRangeTransactions.length).toBe(4)
      expect(dateRangeTransactions.every(t =>
        t.date === '2024-01-15' || t.date === '2024-01-16'
      )).toBe(true)
    })

    it('应支持多条件组合搜索', () => {
      const transactions = createTestTransactions()

      const results = transactions.filter(t =>
        t.type === 'expense' &&
        t.category === 'catering' &&
        t.date >= '2024-01-15' &&
        t.amount < 50
      )

      expect(results.length).toBe(1)
      expect(results[0].note).toBe('麦当劳午餐')
      expect(results[0].amount).toBe(35)
    })
  })

  describe('预算管理流程', () => {
    it('应跟踪月度支出预算执行情况', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 1500,
          category: 'shopping',
          date: '2024-01-05',
          note: '买衣服',
          createdAt: 1700000000000,
        },
        {
          id: '2',
          type: 'expense',
          amount: 800,
          category: 'catering',
          date: '2024-01-10',
          note: '聚餐',
          createdAt: 1700000001000,
        },
        {
          id: '3',
          type: 'expense',
          amount: 300,
          category: 'transport',
          date: '2024-01-15',
          note: '打车',
          createdAt: 1700000002000,
        },
      ]

      const monthlyBudget = 3000
      const summary = calculateMonthlySummary(transactions, '2024-01')
      const totalExpense = summary.totalExpense
      const remainingBudget = monthlyBudget - totalExpense

      expect(totalExpense).toBe(2600)
      expect(remainingBudget).toBe(400)
      expect(remainingBudget > 0).toBe(true)
    })

    it('应计算分类别预算使用情况', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 800,
          category: 'catering',
          date: '2024-01-05',
          note: '',
          createdAt: 1700000000000,
        },
        {
          id: '2',
          type: 'expense',
          amount: 500,
          category: 'catering',
          date: '2024-01-10',
          note: '',
          createdAt: 1700000001000,
        },
        {
          id: '3',
          type: 'expense',
          amount: 200,
          category: 'entertainment',
          date: '2024-01-15',
          note: '',
          createdAt: 1700000002000,
        },
      ]

      const categoryBudgets: Record<string, number> = {
        catering: 1500,
        entertainment: 300,
        transport: 500,
      }

      const summary = calculateMonthlySummary(transactions, '2024-01')

      const cateringSpent = summary.categoryBreakdown['expense-catering'] || 0
      const entertainmentSpent = summary.categoryBreakdown['expense-entertainment'] || 0

      expect(cateringSpent).toBe(1300)
      expect(cateringSpent <= categoryBudgets.catering).toBe(true)
      expect(entertainmentSpent).toBe(200)
      expect(entertainmentSpent <= categoryBudgets.entertainment).toBe(true)
    })

    it('应检测预算超支情况', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 2000,
          category: 'shopping',
          date: '2024-01-05',
          note: '买衣服',
          createdAt: 1700000000000,
        },
      ]

      const monthlyBudget = 1500
      const summary = calculateMonthlySummary(transactions, '2024-01')

      expect(summary.totalExpense > monthlyBudget).toBe(true)
      expect(summary.totalExpense - monthlyBudget).toBe(500)
    })
  })
})
