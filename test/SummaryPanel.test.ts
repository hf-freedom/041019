import { describe, it, expect } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import SummaryPanel from '../src/components/SummaryPanel.vue'
import type { MonthlySummary } from '../src/types'

describe('SummaryPanel', () => {
  let wrapper: VueWrapper

  const mockSummary: MonthlySummary = {
    totalIncome: 8000,
    totalExpense: 3500,
    balance: 4500,
    categoryBreakdown: {
      'income-salary': 5000,
      'income-bonus': 3000,
      'expense-catering': 1500,
      'expense-transport': 500,
      'expense-shopping': 1500,
    },
  }

  describe('月度标题显示', () => {
    it('should display month title correctly', () => {
      wrapper = mount(SummaryPanel, {
        props: { summary: mockSummary, currentMonth: '2024-01' },
      })
      expect(wrapper.find('.month-title').text()).toBe('2024年1月')
    })

    it('should handle double digit months', () => {
      wrapper = mount(SummaryPanel, {
        props: { summary: mockSummary, currentMonth: '2024-12' },
      })
      expect(wrapper.find('.month-title').text()).toBe('2024年12月')
    })
  })

  describe('收支汇总卡片', () => {
    it('should display income card', () => {
      wrapper = mount(SummaryPanel, {
        props: { summary: mockSummary, currentMonth: '2024-01' },
      })
      const incomeCard = wrapper.findAll('.summary-card')[0]
      expect(incomeCard.find('.card-label').text()).toBe('收入')
      expect(incomeCard.find('.card-amount').text()).toContain('8,000.00')
    })

    it('should display expense card', () => {
      wrapper = mount(SummaryPanel, {
        props: { summary: mockSummary, currentMonth: '2024-01' },
      })
      const expenseCard = wrapper.findAll('.summary-card')[1]
      expect(expenseCard.find('.card-label').text()).toBe('支出')
      expect(expenseCard.find('.card-amount').text()).toContain('3,500.00')
    })

    it('should display balance card', () => {
      wrapper = mount(SummaryPanel, {
        props: { summary: mockSummary, currentMonth: '2024-01' },
      })
      const balanceCard = wrapper.findAll('.summary-card')[2]
      expect(balanceCard.find('.card-label').text()).toBe('结余')
      expect(balanceCard.find('.card-amount').text()).toContain('4,500.00')
    })

    it('should show negative class when balance is negative', () => {
      const negativeSummary: MonthlySummary = {
        totalIncome: 1000,
        totalExpense: 2000,
        balance: -1000,
        categoryBreakdown: {},
      }
      wrapper = mount(SummaryPanel, {
        props: { summary: negativeSummary, currentMonth: '2024-01' },
      })
      const balanceCard = wrapper.findAll('.summary-card')[2]
      expect(balanceCard.classes()).toContain('negative')
    })
  })

  describe('类别分布', () => {
    it('should display category breakdown section', () => {
      wrapper = mount(SummaryPanel, {
        props: { summary: mockSummary, currentMonth: '2024-01' },
      })
      expect(wrapper.find('.category-breakdown h4').text()).toBe('类别分布')
    })

    it('should show no data message when empty', () => {
      const emptySummary: MonthlySummary = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categoryBreakdown: {},
      }
      wrapper = mount(SummaryPanel, {
        props: { summary: emptySummary, currentMonth: '2024-01' },
      })
      expect(wrapper.find('.no-data').text()).toBe('暂无数据')
    })

    it('should display breakdown items sorted by amount', () => {
      wrapper = mount(SummaryPanel, {
        props: { summary: mockSummary, currentMonth: '2024-01' },
      })
      const items = wrapper.findAll('.breakdown-item')
      expect(items.length).toBe(5)
      expect(items[0].find('.breakdown-amount').text()).toContain('5,000.00')
    })

    it('should limit to top 6 categories', () => {
      const manyCategories: MonthlySummary = {
        totalIncome: 1000,
        totalExpense: 1000,
        balance: 0,
        categoryBreakdown: {
          'expense-catering': 100,
          'expense-transport': 200,
          'expense-shopping': 300,
          'expense-entertainment': 400,
          'expense-other': 500,
          'income-salary': 600,
          'income-bonus': 700,
        },
      }
      wrapper = mount(SummaryPanel, {
        props: { summary: manyCategories, currentMonth: '2024-01' },
      })
      const items = wrapper.findAll('.breakdown-item')
      expect(items.length).toBe(6)
    })

    it('should show correct category icon and label', () => {
      wrapper = mount(SummaryPanel, {
        props: { summary: mockSummary, currentMonth: '2024-01' },
      })
      const items = wrapper.findAll('.breakdown-item')
      expect(items[0].find('.breakdown-icon').text()).toBe('💰')
      expect(items[0].find('.breakdown-label').text()).toBe('工资')
    })

    it('should show + for income categories', () => {
      wrapper = mount(SummaryPanel, {
        props: { summary: mockSummary, currentMonth: '2024-01' },
      })
      const items = wrapper.findAll('.breakdown-item')
      expect(items[0].find('.breakdown-amount').text()).toContain('+')
      expect(items[0].find('.breakdown-amount').classes()).toContain('income')
    })

    it('should show - for expense categories', () => {
      wrapper = mount(SummaryPanel, {
        props: { summary: mockSummary, currentMonth: '2024-01' },
      })
      const items = wrapper.findAll('.breakdown-item')
      expect(items[2].find('.breakdown-amount').text()).toContain('-')
      expect(items[2].find('.breakdown-amount').classes()).toContain('expense')
    })
  })

  describe('金额格式化', () => {
    it('should format large numbers correctly', () => {
      const largeSummary: MonthlySummary = {
        totalIncome: 1234567.89,
        totalExpense: 0,
        balance: 1234567.89,
        categoryBreakdown: { 'income-salary': 1234567.89 },
      }
      wrapper = mount(SummaryPanel, {
        props: { summary: largeSummary, currentMonth: '2024-01' },
      })
      expect(wrapper.find('.summary-card.income .card-amount').text()).toContain('1,234,567.89')
    })

    it('should handle zero values', () => {
      const zeroSummary: MonthlySummary = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categoryBreakdown: {},
      }
      wrapper = mount(SummaryPanel, {
        props: { summary: zeroSummary, currentMonth: '2024-01' },
      })
      const cards = wrapper.findAll('.summary-card')
      expect(cards[0].find('.card-amount').text()).toContain('0.00')
      expect(cards[1].find('.card-amount').text()).toContain('0.00')
      expect(cards[2].find('.card-amount').text()).toContain('0.00')
    })
  })
})
