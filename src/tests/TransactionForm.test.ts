import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TransactionForm from '../components/TransactionForm.vue'
import type { Transaction } from '../types'

describe('TransactionForm 组件测试', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('alert', vi.fn())
  })

  it('正确渲染表单', () => {
    const wrapper = mount(TransactionForm)
    
    expect(wrapper.find('h3').text()).toBe('新增记录')
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.find('input[type="date"]').exists()).toBe(true)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('显示编辑模式标题', () => {
    const editTransaction: Transaction = {
      id: '1',
      type: 'expense',
      amount: 100,
      category: 'catering',
      date: '2024-01-15',
      note: '午餐',
      createdAt: 1705305600000,
    }
    
    const wrapper = mount(TransactionForm, {
      props: { editTransaction },
    })
    
    expect(wrapper.find('h3').text()).toBe('编辑记录')
  })

  it('默认选中支出类型', () => {
    const wrapper = mount(TransactionForm)
    
    const expenseTab = wrapper.findAll('.type-tab')[0]
    expect(expenseTab.classes()).toContain('active')
  })

  it('点击切换收入类型', async () => {
    const wrapper = mount(TransactionForm)
    
    const incomeTab = wrapper.findAll('.type-tab')[1]
    await incomeTab.trigger('click')
    
    expect(incomeTab.classes()).toContain('active')
  })

  it('切换类型时自动切换类别', async () => {
    const wrapper = mount(TransactionForm)
    
    const incomeTab = wrapper.findAll('.type-tab')[1]
    await incomeTab.trigger('click')
    
    const categoryBtns = wrapper.findAll('.category-btn')
    expect(categoryBtns[0].text()).toContain('工资')
  })

  it('提交时验证金额必须大于0', async () => {
    const wrapper = mount(TransactionForm)
    
    const submitBtn = wrapper.findAll('.form-actions button')[1]
    await submitBtn.trigger('click')
    
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('正确提交表单数据', async () => {
    const wrapper = mount(TransactionForm)
    
    await wrapper.find('input[type="number"]').setValue(100)
    await wrapper.find('input[type="date"]').setValue('2024-01-15')
    await wrapper.find('input[type="text"]').setValue('午餐')
    
    const submitBtn = wrapper.findAll('.form-actions button')[1]
    await submitBtn.trigger('click')
    
    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toMatchObject({
      type: 'expense',
      amount: 100,
      category: 'catering',
      date: '2024-01-15',
      note: '午餐',
    })
  })

  it('编辑模式下填充已有数据', async () => {
    const editTransaction: Transaction = {
      id: 'test-id',
      type: 'income',
      amount: 5000,
      category: 'salary',
      date: '2024-01-01',
      note: '工资',
      createdAt: 1704067200000,
    }
    
    const wrapper = mount(TransactionForm, {
      props: { editTransaction },
    })
    
    expect(wrapper.find('input[type="number"]').element.value).toBe('5000')
    expect(wrapper.find('input[type="date"]').element.value).toBe('2024-01-01')
    expect(wrapper.find('input[type="text"]').element.value).toBe('工资')
  })

  it('编辑模式下保留原ID和创建时间', async () => {
    const editTransaction: Transaction = {
      id: 'test-id',
      type: 'expense',
      amount: 100,
      category: 'catering',
      date: '2024-01-15',
      note: '午餐',
      createdAt: 1705305600000,
    }
    
    const wrapper = mount(TransactionForm, {
      props: { editTransaction },
    })
    
    const submitBtn = wrapper.findAll('.form-actions button')[1]
    await submitBtn.trigger('click')
    
    const emitted = wrapper.emitted('submit')
    expect(emitted![0][0].id).toBe('test-id')
    expect(emitted![0][0].createdAt).toBe(1705305600000)
  })

  it('取消按钮重置表单', async () => {
    const wrapper = mount(TransactionForm)
    
    await wrapper.find('input[type="number"]').setValue(100)
    
    const cancelBtn = wrapper.findAll('.form-actions button')[0]
    await cancelBtn.trigger('click')
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('选择不同类别', async () => {
    const wrapper = mount(TransactionForm)
    
    const categoryBtns = wrapper.findAll('.category-btn')
    await categoryBtns[1].trigger('click')
    
    expect(categoryBtns[1].classes()).toContain('active')
  })
})
