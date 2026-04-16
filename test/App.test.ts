import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, VueWrapper } from '@vue/test-utils'
import App from '../src/App.vue'
import type { Transaction } from '../src/types'

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('App - 预算管理流程', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('添加预算/收支流程', () => {
    it('should add new expense transaction with correct data', async () => {
      wrapper = mount(App)
      await flushPromises()

      await wrapper.find('.add-btn').trigger('click')
      await flushPromises()

      const form = wrapper.findComponent({ name: 'TransactionForm' })
      await form.find('input[type="number"]').setValue(100)
      await form.findAll('.category-btn')[0].trigger('click')
      const noteInput = form.findAll('input[type="text"]')[0]
      await noteInput.setValue('午餐')
      await form.find('.btn-submit').trigger('click')
      await flushPromises()

      const transactionItem = wrapper.find('.transaction-item')
      expect(transactionItem.exists()).toBe(true)
      expect(transactionItem.find('.transaction-category').text()).toBe('餐饮')
      expect(transactionItem.find('.transaction-amount').text()).toContain('100')
      expect(transactionItem.find('.transaction-amount').text()).toContain('-')
      expect(transactionItem.find('.transaction-note').text()).toBe('午餐')
    })

    it('should add new income transaction with correct data', async () => {
      wrapper = mount(App)
      await flushPromises()

      await wrapper.find('.add-btn').trigger('click')
      await flushPromises()

      const form = wrapper.findComponent({ name: 'TransactionForm' })
      await form.findAll('.type-tab')[1].trigger('click')
      await form.find('input[type="number"]').setValue(5000)
      await form.findAll('.category-btn')[0].trigger('click')
      await form.find('.btn-submit').trigger('click')
      await flushPromises()

      const amounts = wrapper.findAll('.transaction-amount')
      expect(amounts[0].text()).toContain('+')
      expect(amounts[0].text()).toContain('5,000.00')
      expect(amounts[0].classes()).toContain('income')
    })

    it('should save transaction to localStorage with correct structure', async () => {
      wrapper = mount(App)
      await flushPromises()

      await wrapper.find('.add-btn').trigger('click')
      await flushPromises()

      const form = wrapper.findComponent({ name: 'TransactionForm' })
      await form.find('input[type="number"]').setValue(200)
      await form.find('.btn-submit').trigger('click')
      await flushPromises()

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'finance_transactions',
        expect.any(String)
      )
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData).toHaveLength(1)
      expect(savedData[0].amount).toBe(200)
      expect(savedData[0].type).toBe('expense')
      expect(savedData[0].category).toBe('catering')
      expect(savedData[0].id).toBeDefined()
      expect(savedData[0].createdAt).toBeDefined()
      expect(savedData[0].date).toBeDefined()
    })

    it('should load transactions from localStorage on mount and display them', async () => {
      const today = new Date().toISOString().split('T')[0]
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: today,
          note: 'Test Note',
          createdAt: Date.now(),
        },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('finance_transactions')
      expect(wrapper.find('.transaction-item').exists()).toBe(true)
      expect(wrapper.find('.transaction-note').text()).toBe('Test Note')
    })
  })

  describe('编辑收支流程', () => {
    it('should open edit form with pre-filled data when edit button clicked', async () => {
      const today = new Date().toISOString().split('T')[0]
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: today,
          note: 'Original Note',
          createdAt: Date.now(),
        },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      await wrapper.find('.action-btn.edit').trigger('click')
      await flushPromises()

      expect(wrapper.find('.modal').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('编辑记录')
      
      const form = wrapper.findComponent({ name: 'TransactionForm' })
      const amountInput = form.find('input[type="number"]')
      expect(amountInput.element.value).toBe('100')
    })

    it('should update transaction and reflect changes in UI', async () => {
      const today = new Date().toISOString().split('T')[0]
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: today,
          note: 'Test',
          createdAt: Date.now(),
        },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      await wrapper.find('.action-btn.edit').trigger('click')
      await flushPromises()

      const form = wrapper.findComponent({ name: 'TransactionForm' })
      await form.find('input[type="number"]').setValue(250)
      await form.find('.btn-submit').trigger('click')
      await flushPromises()

      const amounts = wrapper.findAll('.transaction-amount')
      expect(amounts[0].text()).toContain('250')
      expect(amounts[0].text()).not.toContain('100')
      
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1])
      expect(savedData[0].amount).toBe(250)
    })
  })

  describe('删除收支流程', () => {
    it('should remove transaction from UI and localStorage when delete confirmed', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const today = new Date().toISOString().split('T')[0]
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'expense',
          amount: 100,
          category: 'catering',
          date: today,
          note: 'Test',
          createdAt: Date.now(),
        },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      expect(wrapper.find('.transaction-item').exists()).toBe(true)
      
      await wrapper.find('.action-btn.delete').trigger('click')
      await flushPromises()

      expect(wrapper.find('.transaction-item').exists()).toBe(false)
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1])
      expect(savedData).toHaveLength(0)
    })
  })
})

describe('App - 数据统计流程', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('月度统计计算', () => {
    it('should calculate correct monthly summary after adding income', async () => {
      wrapper = mount(App)
      await flushPromises()

      await wrapper.find('.add-btn').trigger('click')
      await flushPromises()

      const form = wrapper.findComponent({ name: 'TransactionForm' })
      await form.findAll('.type-tab')[1].trigger('click')
      await form.find('input[type="number"]').setValue(5000)
      await form.find('.btn-submit').trigger('click')
      await flushPromises()

      const incomeCard = wrapper.find('.summary-card.income')
      expect(incomeCard.find('.card-amount').text()).toContain('5,000.00')
      
      const balanceCard = wrapper.find('.summary-card.balance')
      expect(balanceCard.find('.card-amount').text()).toContain('5,000.00')
      expect(balanceCard.classes()).not.toContain('negative')
    })

    it('should update balance correctly after adding expense', async () => {
      wrapper = mount(App)
      await flushPromises()

      await wrapper.find('.add-btn').trigger('click')
      await flushPromises()

      const form = wrapper.findComponent({ name: 'TransactionForm' })
      await form.find('input[type="number"]').setValue(1000)
      await form.find('.btn-submit').trigger('click')
      await flushPromises()

      const expenseCard = wrapper.find('.summary-card.expense')
      expect(expenseCard.find('.card-amount').text()).toContain('1,000.00')
      
      const balanceCard = wrapper.find('.summary-card.balance')
      expect(balanceCard.find('.card-amount').text()).toContain('1,000.00')
      expect(balanceCard.classes()).toContain('negative')
    })

    it('should show correct category breakdown with amounts', async () => {
      wrapper = mount(App)
      await flushPromises()

      await wrapper.find('.add-btn').trigger('click')
      await flushPromises()

      const form = wrapper.findComponent({ name: 'TransactionForm' })
      await form.find('input[type="number"]').setValue(150)
      await form.find('.btn-submit').trigger('click')
      await flushPromises()

      const breakdownItems = wrapper.findAll('.breakdown-item')
      expect(breakdownItems.length).toBe(1)
      expect(breakdownItems[0].find('.breakdown-label').text()).toBe('餐饮')
      expect(breakdownItems[0].find('.breakdown-amount').text()).toContain('150.00')
    })

    it('should calculate balance correctly with both income and expense', async () => {
      const today = new Date().toISOString().split('T')[0]
      const mockTransactions: Transaction[] = [
        { id: '1', type: 'income', amount: 8000, category: 'salary', date: today, note: '', createdAt: 1 },
        { id: '2', type: 'expense', amount: 3000, category: 'catering', date: today, note: '', createdAt: 2 },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      const incomeCard = wrapper.find('.summary-card.income')
      expect(incomeCard.find('.card-amount').text()).toContain('8,000.00')
      
      const expenseCard = wrapper.find('.summary-card.expense')
      expect(expenseCard.find('.card-amount').text()).toContain('3,000.00')
      
      const balanceCard = wrapper.find('.summary-card.balance')
      expect(balanceCard.find('.card-amount').text()).toContain('5,000.00')
    })
  })

  describe('按日期分组统计', () => {
    it('should group transactions by date and show daily totals', async () => {
      const today = new Date().toISOString().split('T')[0]
      const mockTransactions: Transaction[] = [
        { id: '1', type: 'expense', amount: 100, category: 'catering', date: today, note: '', createdAt: 1 },
        { id: '2', type: 'expense', amount: 200, category: 'transport', date: today, note: '', createdAt: 2 },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      const dayGroup = wrapper.find('.day-group')
      expect(dayGroup.exists()).toBe(true)

      const transactions = dayGroup.findAll('.transaction-item')
      expect(transactions.length).toBe(2)
      
      const daySummary = wrapper.find('.day-summary')
      expect(daySummary.text()).toContain('300')
    })

    it('should calculate daily totals correctly with mixed income and expense', async () => {
      const today = new Date().toISOString().split('T')[0]
      const mockTransactions: Transaction[] = [
        { id: '1', type: 'income', amount: 5000, category: 'salary', date: today, note: '', createdAt: 1 },
        { id: '2', type: 'expense', amount: 100, category: 'catering', date: today, note: '', createdAt: 2 },
        { id: '3', type: 'expense', amount: 50, category: 'transport', date: today, note: '', createdAt: 3 },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      const daySummary = wrapper.find('.day-summary')
      expect(daySummary.text()).toContain('5,000.00')
      expect(daySummary.text()).toContain('150.00')
    })
  })
})

describe('App - 智能搜索/筛选流程', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('月份导航', () => {
    it('should navigate to previous month and update display', async () => {
      wrapper = mount(App)
      await flushPromises()

      const currentMonth = wrapper.find('.current-month').text()
      expect(currentMonth).toMatch(/^\d{4}-\d{2}$/)
      
      await wrapper.findAll('.nav-btn')[0].trigger('click')
      await flushPromises()

      const newMonth = wrapper.find('.current-month').text()
      expect(newMonth).not.toBe(currentMonth)
      
      const [year, month] = currentMonth.split('-').map(Number)
      const expectedPrevMonth = month === 1 
        ? `${year - 1}-12` 
        : `${year}-${String(month - 1).padStart(2, '0')}`
      expect(newMonth).toBe(expectedPrevMonth)
    })

    it('should navigate to next month and update display', async () => {
      wrapper = mount(App)
      await flushPromises()

      const currentMonth = wrapper.find('.current-month').text()
      
      await wrapper.findAll('.nav-btn')[1].trigger('click')
      await flushPromises()

      const newMonth = wrapper.find('.current-month').text()
      expect(newMonth).not.toBe(currentMonth)
      
      const [year, month] = currentMonth.split('-').map(Number)
      const expectedNextMonth = month === 12 
        ? `${year + 1}-01` 
        : `${year}-${String(month + 1).padStart(2, '0')}`
      expect(newMonth).toBe(expectedNextMonth)
    })

    it('should return to current month when clicking today button', async () => {
      wrapper = mount(App)
      await flushPromises()

      await wrapper.findAll('.nav-btn')[0].trigger('click')
      await wrapper.findAll('.nav-btn')[0].trigger('click')
      await flushPromises()

      const navigatedMonth = wrapper.find('.current-month').text()
      expect(navigatedMonth).not.toBe(new Date().toISOString().slice(0, 7))

      await wrapper.find('.today-btn').trigger('click')
      await flushPromises()

      const currentMonth = new Date().toISOString().slice(0, 7)
      expect(wrapper.find('.current-month').text()).toBe(currentMonth)
    })
  })

  describe('按月份筛选交易', () => {
    it('should only show transactions for selected month', async () => {
      const mockTransactions: Transaction[] = [
        { id: '1', type: 'expense', amount: 100, category: 'catering', date: '2024-01-15', note: '', createdAt: 1 },
        { id: '2', type: 'expense', amount: 200, category: 'transport', date: '2024-02-15', note: '', createdAt: 2 },
        { id: '3', type: 'income', amount: 5000, category: 'salary', date: '2024-01-20', note: '', createdAt: 3 },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      wrapper.vm.currentMonth = '2024-01'
      await flushPromises()

      const transactions = wrapper.findAll('.transaction-item')
      expect(transactions.length).toBe(2)
      
      const amounts = wrapper.findAll('.transaction-amount')
      const has100 = amounts.some(el => el.text().includes('100'))
      const has5000 = amounts.some(el => el.text().includes('5,000'))
      expect(has100).toBe(true)
      expect(has5000).toBe(true)
      
      const has200 = amounts.some(el => el.text().includes('200'))
      expect(has200).toBe(false)
    })

    it('should update summary when month changes', async () => {
      const mockTransactions: Transaction[] = [
        { id: '1', type: 'income', amount: 5000, category: 'salary', date: '2024-01-01', note: '', createdAt: 1 },
        { id: '2', type: 'income', amount: 3000, category: 'bonus', date: '2024-02-01', note: '', createdAt: 2 },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      wrapper.vm.currentMonth = '2024-01'
      await flushPromises()

      let incomeCard = wrapper.find('.summary-card.income')
      expect(incomeCard.find('.card-amount').text()).toContain('5,000.00')

      wrapper.vm.currentMonth = '2024-02'
      await flushPromises()

      incomeCard = wrapper.find('.summary-card.income')
      expect(incomeCard.find('.card-amount').text()).toContain('3,000.00')
    })

    it('should show correct category breakdown for selected month', async () => {
      const mockTransactions: Transaction[] = [
        { id: '1', type: 'expense', amount: 100, category: 'catering', date: '2024-01-15', note: '', createdAt: 1 },
        { id: '2', type: 'expense', amount: 200, category: 'transport', date: '2024-02-15', note: '', createdAt: 2 },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      wrapper.vm.currentMonth = '2024-01'
      await flushPromises()

      let breakdownItems = wrapper.findAll('.breakdown-item')
      expect(breakdownItems.length).toBe(1)
      expect(breakdownItems[0].find('.breakdown-label').text()).toBe('餐饮')

      wrapper.vm.currentMonth = '2024-02'
      await flushPromises()

      breakdownItems = wrapper.findAll('.breakdown-item')
      expect(breakdownItems.length).toBe(1)
      expect(breakdownItems[0].find('.breakdown-label').text()).toBe('交通')
    })
  })

  describe('空状态处理', () => {
    it('should show empty state when no transactions for selected month', async () => {
      const mockTransactions: Transaction[] = [
        { id: '1', type: 'expense', amount: 100, category: 'catering', date: '2024-01-15', note: '', createdAt: 1 },
      ]
      mockLocalStorage.setItem('finance_transactions', JSON.stringify(mockTransactions))

      wrapper = mount(App)
      await flushPromises()

      wrapper.vm.currentMonth = '2023-06'
      await flushPromises()

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state').text()).toContain('暂无记录')
      
      const summaryCards = wrapper.findAll('.summary-card')
      summaryCards.forEach(card => {
        expect(card.find('.card-amount').text()).toContain('0.00')
      })
    })
  })
})
