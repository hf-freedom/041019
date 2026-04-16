import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TransactionTimeline from '../components/TransactionTimeline.vue'
import type { DailySummary, Transaction } from '../types'

describe('TransactionTimeline 组件测试', () => {
  beforeEach(() => {
    vi.stubGlobal('confirm', vi.fn())
  })

  const createTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
    id: '1',
    type: 'expense',
    amount: 100,
    category: 'catering',
    date: '2024-01-15',
    note: '午餐',
    createdAt: 1705305600000,
    ...overrides,
  })

  const createDailySummary = (overrides: Partial<DailySummary> = {}): DailySummary => ({
    date: '2024-01-15',
    income: 0,
    expense: 100,
    transactions: [createTransaction()],
    ...overrides,
  })

  it('无数据时显示空状态', () => {
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries: [] },
    })
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-icon').text()).toBe('📊')
  })

  it('显示日期分组', () => {
    const dailySummaries: DailySummary[] = [
      createDailySummary({ date: '2024-01-15' }),
      createDailySummary({ date: '2024-01-14', transactions: [createTransaction({ id: '2', date: '2024-01-14' })] }),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    const dayGroups = wrapper.findAll('.day-group')
    expect(dayGroups).toHaveLength(2)
  })

  it('显示每日收入汇总', () => {
    const dailySummaries: DailySummary[] = [
      createDailySummary({
        income: 5000,
        transactions: [createTransaction({ type: 'income', amount: 5000, category: 'salary' })],
      }),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    expect(wrapper.find('.day-summary .income').text()).toContain('+¥5,000.00')
  })

  it('显示每日支出汇总', () => {
    const dailySummaries: DailySummary[] = [
      createDailySummary({ expense: 1500 }),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    expect(wrapper.find('.day-summary .expense').text()).toContain('-¥1,500.00')
  })

  it('显示交易记录详情', () => {
    const dailySummaries: DailySummary[] = [
      createDailySummary({
        transactions: [
          createTransaction({
            id: '1',
            type: 'expense',
            amount: 100,
            category: 'catering',
            note: '午餐',
          }),
        ],
      }),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    expect(wrapper.find('.transaction-category').text()).toBe('餐饮')
    expect(wrapper.find('.transaction-note').text()).toBe('午餐')
  })

  it('收入显示绿色金额', () => {
    const dailySummaries: DailySummary[] = [
      createDailySummary({
        transactions: [
          createTransaction({
            type: 'income',
            amount: 5000,
            category: 'salary',
          }),
        ],
      }),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    const amount = wrapper.find('.transaction-amount')
    expect(amount.classes()).toContain('income')
    expect(amount.text()).toContain('+')
  })

  it('支出显示红色金额', () => {
    const dailySummaries: DailySummary[] = [
      createDailySummary({
        transactions: [
          createTransaction({
            type: 'expense',
            amount: 100,
            category: 'catering',
          }),
        ],
      }),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    const amount = wrapper.find('.transaction-amount')
    expect(amount.classes()).toContain('expense')
    expect(amount.text()).toContain('-')
  })

  it('点击编辑按钮触发edit事件', async () => {
    const transaction = createTransaction()
    const dailySummaries: DailySummary[] = [
      createDailySummary({ transactions: [transaction] }),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    const editBtn = wrapper.find('.action-btn.edit')
    await editBtn.trigger('click')
    
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')![0][0]).toEqual(transaction)
  })

  it('点击删除按钮确认后触发delete事件', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    
    const transaction = createTransaction()
    const dailySummaries: DailySummary[] = [
      createDailySummary({ transactions: [transaction] }),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    const deleteBtn = wrapper.find('.action-btn.delete')
    await deleteBtn.trigger('click')
    
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0][0]).toBe('1')
  })

  it('取消删除确认不触发delete事件', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false))
    
    const dailySummaries: DailySummary[] = [
      createDailySummary(),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    const deleteBtn = wrapper.find('.action-btn.delete')
    await deleteBtn.trigger('click')
    
    expect(wrapper.emitted('delete')).toBeUndefined()
  })

  it('显示正确的类别图标', () => {
    const dailySummaries: DailySummary[] = [
      createDailySummary({
        transactions: [createTransaction({ category: 'catering' })],
      }),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    expect(wrapper.find('.transaction-icon').text()).toBe('🍜')
  })

  it('无备注时不显示备注区域', () => {
    const dailySummaries: DailySummary[] = [
      createDailySummary({
        transactions: [createTransaction({ note: '' })],
      }),
    ]
    
    const wrapper = mount(TransactionTimeline, {
      props: { dailySummaries },
    })
    
    expect(wrapper.find('.transaction-note').exists()).toBe(false)
  })
})
