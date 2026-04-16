import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import TransactionTimeline from '../src/components/TransactionTimeline.vue'
import type { DailySummary, Transaction } from '../src/types'

describe('TransactionTimeline', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  const mockDailySummaries: DailySummary[] = [
    {
      date: '2024-01-15',
      income: 5000,
      expense: 150,
      transactions: [
        {
          id: '1',
          type: 'income',
          amount: 5000,
          category: 'salary',
          date: '2024-01-15',
          note: 'Monthly salary',
          createdAt: 1705315200000,
        },
        {
          id: '2',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: '2024-01-15',
          note: 'Lunch',
          createdAt: 1705315300000,
        },
        {
          id: '3',
          type: 'expense',
          amount: 50,
          category: 'transport',
          date: '2024-01-15',
          note: 'Bus',
          createdAt: 1705315400000,
        },
      ],
    },
    {
      date: '2024-01-14',
      income: 0,
      expense: 200,
      transactions: [
        {
          id: '4',
          type: 'expense',
          amount: 200,
          category: 'shopping',
          date: '2024-01-14',
          note: 'Groceries',
          createdAt: 1705228800000,
        },
      ],
    },
  ]

  describe('显示功能', () => {
    it('should render empty state when no data', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: [] },
      })
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无记录')
    })

    it('should render day groups correctly', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const dayGroups = wrapper.findAll('.day-group')
      expect(dayGroups).toHaveLength(2)
    })

    it('should display correct date header', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const dayHeaders = wrapper.findAll('.day-date')
      expect(dayHeaders[0].text()).toContain('2024-01-15')
      expect(dayHeaders[1].text()).toContain('2024-01-14')
    })

    it('should display daily summary with income and expense', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const firstDaySummary = wrapper.findAll('.day-summary')[0]
      expect(firstDaySummary.text()).toContain('收入')
      expect(firstDaySummary.text()).toContain('支出')
    })

    it('should render all transactions in a day', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const firstDayTransactions = wrapper.findAll('.day-group')[0].findAll('.transaction-item')
      expect(firstDayTransactions).toHaveLength(3)
    })
  })

  describe('交易记录显示', () => {
    it('should display transaction category with icon', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const firstTransaction = wrapper.find('.transaction-item')
      expect(firstTransaction.find('.transaction-icon').exists()).toBe(true)
      expect(firstTransaction.find('.transaction-category').exists()).toBe(true)
    })

    it('should display transaction note when present', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const firstTransaction = wrapper.find('.transaction-item')
      expect(firstTransaction.find('.transaction-note').text()).toBe('Monthly salary')
    })

    it('should show correct amount with + for income', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const amounts = wrapper.findAll('.transaction-amount')
      expect(amounts[0].text()).toContain('+')
      expect(amounts[0].classes()).toContain('income')
    })

    it('should show correct amount with - for expense', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const amounts = wrapper.findAll('.transaction-amount')
      expect(amounts[1].text()).toContain('-')
      expect(amounts[1].classes()).toContain('expense')
    })

    it('should format money correctly', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const amounts = wrapper.findAll('.transaction-amount')
      expect(amounts[0].text()).toContain('5,000.00')
    })
  })

  describe('编辑功能', () => {
    it('should emit edit event when edit button clicked', async () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const editBtn = wrapper.find('.action-btn.edit')
      await editBtn.trigger('click')
      expect(wrapper.emitted('edit')).toBeTruthy()
      const emittedTransaction = wrapper.emitted('edit')![0][0] as Transaction
      expect(emittedTransaction.id).toBe('1')
    })

    it('should pass correct transaction data in edit event', async () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const editBtns = wrapper.findAll('.action-btn.edit')
      await editBtns[1].trigger('click')
      const emittedTransaction = wrapper.emitted('edit')![0][0] as Transaction
      expect(emittedTransaction.category).toBe('catering')
      expect(emittedTransaction.amount).toBe(100)
    })
  })

  describe('删除功能', () => {
    it('should emit delete event when delete confirmed', async () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const deleteBtn = wrapper.find('.action-btn.delete')
      await deleteBtn.trigger('click')
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')![0][0]).toBe('1')
    })

    it('should not emit delete when user cancels', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const deleteBtn = wrapper.find('.action-btn.delete')
      await deleteBtn.trigger('click')
      expect(wrapper.emitted('delete')).toBeFalsy()
    })

    it('should show confirmation dialog before delete', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const deleteBtn = wrapper.find('.action-btn.delete')
      await deleteBtn.trigger('click')
      expect(confirmSpy).toHaveBeenCalledWith('确定要删除这条记录吗？')
    })
  })

  describe('分类显示', () => {
    it('should show correct category label', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const categories = wrapper.findAll('.transaction-category')
      expect(categories[0].text()).toBe('工资')
      expect(categories[1].text()).toBe('餐饮')
    })

    it('should show correct category icon', () => {
      wrapper = mount(TransactionTimeline, {
        props: { dailySummaries: mockDailySummaries },
      })
      const icons = wrapper.findAll('.transaction-icon')
      expect(icons[0].text()).toBe('💰')
      expect(icons[1].text()).toBe('🍜')
    })
  })
})
