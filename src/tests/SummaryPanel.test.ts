import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SummaryPanel from '../components/SummaryPanel.vue'
import type { MonthlySummary } from '../types'

describe('SummaryPanel 组件测试', () => {
  const createSummary = (overrides: Partial<MonthlySummary> = {}): MonthlySummary => ({
    totalIncome: 5000,
    totalExpense: 3000,
    balance: 2000,
    categoryBreakdown: {
      'income-salary': 5000,
      'expense-catering': 1500,
      'expense-transport': 1000,
      'expense-shopping': 500,
    },
    ...overrides,
  })

  it('正确渲染月度标题', () => {
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: createSummary(),
        currentMonth: '2024-01',
      },
    })
    
    expect(wrapper.find('.month-title').text()).toBe('2024年1月')
  })

  it('正确显示收入金额', () => {
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: createSummary({ totalIncome: 10000 }),
        currentMonth: '2024-01',
      },
    })
    
    const incomeCard = wrapper.findAll('.summary-card')[0]
    expect(incomeCard.find('.card-amount').text()).toBe('¥10,000.00')
  })

  it('正确显示支出金额', () => {
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: createSummary({ totalExpense: 5000 }),
        currentMonth: '2024-01',
      },
    })
    
    const expenseCard = wrapper.findAll('.summary-card')[1]
    expect(expenseCard.find('.card-amount').text()).toBe('¥5,000.00')
  })

  it('正确显示结余金额', () => {
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: createSummary({ balance: 5000 }),
        currentMonth: '2024-01',
      },
    })
    
    const balanceCard = wrapper.findAll('.summary-card')[2]
    expect(balanceCard.find('.card-amount').text()).toBe('¥5,000.00')
  })

  it('负结余显示正确样式', () => {
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: createSummary({ balance: -1000 }),
        currentMonth: '2024-01',
      },
    })
    
    const balanceCard = wrapper.findAll('.summary-card')[2]
    expect(balanceCard.classes()).toContain('negative')
  })

  it('显示类别分布列表', () => {
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: createSummary(),
        currentMonth: '2024-01',
      },
    })
    
    const breakdownItems = wrapper.findAll('.breakdown-item')
    expect(breakdownItems.length).toBeGreaterThan(0)
  })

  it('类别分布按金额降序排列', () => {
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: createSummary(),
        currentMonth: '2024-01',
      },
    })
    
    const breakdownItems = wrapper.findAll('.breakdown-item')
    expect(breakdownItems.length).toBe(4)
    expect(breakdownItems[0].text()).toContain('工资')
  })

  it('无数据时显示提示', () => {
    const emptySummary: MonthlySummary = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      categoryBreakdown: {},
    }
    
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: emptySummary,
        currentMonth: '2024-01',
      },
    })
    
    expect(wrapper.find('.no-data').exists()).toBe(true)
    expect(wrapper.find('.no-data').text()).toBe('暂无数据')
  })

  it('收入类别显示绿色', () => {
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: createSummary(),
        currentMonth: '2024-01',
      },
    })
    
    const incomeItem = wrapper.findAll('.breakdown-item')[0]
    const amount = incomeItem.find('.breakdown-amount')
    expect(amount.classes()).toContain('income')
  })

  it('支出类别显示红色', () => {
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: createSummary(),
        currentMonth: '2024-01',
      },
    })
    
    const expenseItem = wrapper.findAll('.breakdown-item')[1]
    const amount = expenseItem.find('.breakdown-amount')
    expect(amount.classes()).toContain('expense')
  })

  it('最多显示6个类别', () => {
    const summaryWithManyCategories: MonthlySummary = {
      totalIncome: 10000,
      totalExpense: 8000,
      balance: 2000,
      categoryBreakdown: {
        'income-salary': 5000,
        'income-bonus': 3000,
        'income-investment': 2000,
        'expense-catering': 3000,
        'expense-transport': 2000,
        'expense-shopping': 1500,
        'expense-entertainment': 1000,
        'expense-other': 500,
      },
    }
    
    const wrapper = mount(SummaryPanel, {
      props: {
        summary: summaryWithManyCategories,
        currentMonth: '2024-01',
      },
    })
    
    const breakdownItems = wrapper.findAll('.breakdown-item')
    expect(breakdownItems.length).toBe(6)
  })
})
