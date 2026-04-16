import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import TransactionForm from '../src/components/TransactionForm.vue'
import type { Transaction } from '../src/types'

describe('TransactionForm', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('新增记录功能', () => {
    it('should render form with default values for new transaction', () => {
      wrapper = mount(TransactionForm)
      expect(wrapper.find('h3').text()).toBe('新增记录')
      expect(wrapper.find('.type-tab.active').text()).toBe('支出')
    })

    it('should switch between expense and income tabs', async () => {
      wrapper = mount(TransactionForm)
      const incomeTab = wrapper.findAll('.type-tab')[1]
      await incomeTab.trigger('click')
      expect(incomeTab.classes()).toContain('active')
    })

    it('should update category options when type changes', async () => {
      wrapper = mount(TransactionForm)
      const incomeTab = wrapper.findAll('.type-tab')[1]
      await incomeTab.trigger('click')
      const categoryBtns = wrapper.findAll('.category-btn')
      expect(categoryBtns.length).toBe(4)
    })

    it('should validate amount is greater than 0', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      wrapper = mount(TransactionForm)
      await wrapper.find('.btn-submit').trigger('click')
      expect(alertSpy).toHaveBeenCalledWith('请输入有效金额')
    })

    it('should emit submit event with correct transaction data', async () => {
      wrapper = mount(TransactionForm)
      await wrapper.find('input[type="number"]').setValue(100)
      await wrapper.findAll('.category-btn')[0].trigger('click')
      await wrapper.find('.btn-submit').trigger('click')
      expect(wrapper.emitted('submit')).toBeTruthy()
      const emittedTransaction = wrapper.emitted('submit')![0][0] as Transaction
      expect(emittedTransaction.type).toBe('expense')
      expect(emittedTransaction.amount).toBe(100)
      expect(emittedTransaction.category).toBe('catering')
    })

    it('should include note in submitted transaction', async () => {
      wrapper = mount(TransactionForm)
      await wrapper.find('input[type="number"]').setValue(50)
      const noteInput = wrapper.findAll('input[type="text"]')[0]
      await noteInput.setValue('Test note')
      await wrapper.find('.btn-submit').trigger('click')
      const emittedTransaction = wrapper.emitted('submit')![0][0] as Transaction
      expect(emittedTransaction.note).toBe('Test note')
    })

    it('should emit cancel event when cancel button clicked', async () => {
      wrapper = mount(TransactionForm)
      await wrapper.find('.btn-cancel').trigger('click')
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('编辑记录功能', () => {
    it('should render form with edit title when editTransaction provided', () => {
      const editTransaction: Transaction = {
        id: '123',
        type: 'income',
        amount: 5000,
        category: 'salary',
        date: '2024-01-15',
        note: 'Test',
        createdAt: 1705315200000,
      }
      wrapper = mount(TransactionForm, {
        props: { editTransaction },
      })
      expect(wrapper.find('h3').text()).toBe('编辑记录')
    })

    it('should populate form with edit transaction data', () => {
      const editTransaction: Transaction = {
        id: '123',
        type: 'income',
        amount: 5000,
        category: 'salary',
        date: '2024-01-15',
        note: 'Monthly salary',
        createdAt: 1705315200000,
      }
      wrapper = mount(TransactionForm, {
        props: { editTransaction },
      })
      const amountInput = wrapper.find('input[type="number"]')
      expect(amountInput.element.value).toBe('5000')
    })

    it('should preserve id and createdAt when editing', async () => {
      const editTransaction: Transaction = {
        id: 'existing-id',
        type: 'expense',
        amount: 100,
        category: 'catering',
        date: '2024-01-15',
        note: '',
        createdAt: 1234567890,
      }
      wrapper = mount(TransactionForm, {
        props: { editTransaction },
      })
      await wrapper.find('input[type="number"]').setValue(200)
      await wrapper.find('.btn-submit').trigger('click')
      const emittedTransaction = wrapper.emitted('submit')![0][0] as Transaction
      expect(emittedTransaction.id).toBe('existing-id')
      expect(emittedTransaction.createdAt).toBe(1234567890)
      expect(emittedTransaction.amount).toBe(200)
    })

    it('should show save button when editing', () => {
      const editTransaction: Transaction = {
        id: '123',
        type: 'expense',
        amount: 100,
        category: 'catering',
        date: '2024-01-15',
        note: '',
        createdAt: 1,
      }
      wrapper = mount(TransactionForm, {
        props: { editTransaction },
      })
      expect(wrapper.find('.btn-submit').text()).toBe('保存')
    })
  })

  describe('类别选择功能', () => {
    it('should select expense category', async () => {
      wrapper = mount(TransactionForm)
      const categoryBtns = wrapper.findAll('.category-btn')
      await categoryBtns[1].trigger('click')
      expect(categoryBtns[1].classes()).toContain('active')
    })

    it('should have correct expense categories', () => {
      wrapper = mount(TransactionForm)
      const categoryBtns = wrapper.findAll('.category-btn')
      expect(categoryBtns.length).toBe(5)
    })

    it('should have correct income categories when switched', async () => {
      wrapper = mount(TransactionForm)
      const incomeTab = wrapper.findAll('.type-tab')[1]
      await incomeTab.trigger('click')
      const categoryBtns = wrapper.findAll('.category-btn')
      expect(categoryBtns.length).toBe(4)
    })
  })

  describe('日期选择功能', () => {
    it('should have date input', () => {
      wrapper = mount(TransactionForm)
      const dateInput = wrapper.find('input[type="date"]')
      expect(dateInput.exists()).toBe(true)
    })

    it('should update date value', async () => {
      wrapper = mount(TransactionForm)
      const dateInput = wrapper.find('input[type="date"]')
      await dateInput.setValue('2024-03-15')
      await wrapper.find('input[type="number"]').setValue(100)
      await wrapper.find('.btn-submit').trigger('click')
      const emittedTransaction = wrapper.emitted('submit')![0][0] as Transaction
      expect(emittedTransaction.date).toBe('2024-03-15')
    })
  })
})
