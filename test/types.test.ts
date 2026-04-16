import { describe, it, expect } from 'vitest'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from '../src/types'

describe('Types - 类别定义', () => {
  describe('支出类别', () => {
    it('should have correct expense categories', () => {
      expect(EXPENSE_CATEGORIES).toHaveLength(5)
      expect(EXPENSE_CATEGORIES.map(c => c.value)).toEqual([
        'catering',
        'transport',
        'shopping',
        'entertainment',
        'other',
      ])
    })

    it('should have correct expense category labels', () => {
      expect(EXPENSE_CATEGORIES[0].label).toBe('餐饮')
      expect(EXPENSE_CATEGORIES[1].label).toBe('交通')
      expect(EXPENSE_CATEGORIES[2].label).toBe('购物')
      expect(EXPENSE_CATEGORIES[3].label).toBe('娱乐')
      expect(EXPENSE_CATEGORIES[4].label).toBe('其他')
    })

    it('should have correct expense category icons', () => {
      expect(EXPENSE_CATEGORIES[0].icon).toBe('🍜')
      expect(EXPENSE_CATEGORIES[1].icon).toBe('🚗')
      expect(EXPENSE_CATEGORIES[2].icon).toBe('🛒')
      expect(EXPENSE_CATEGORIES[3].icon).toBe('🎮')
      expect(EXPENSE_CATEGORIES[4].icon).toBe('📦')
    })
  })

  describe('收入类别', () => {
    it('should have correct income categories', () => {
      expect(INCOME_CATEGORIES).toHaveLength(4)
      expect(INCOME_CATEGORIES.map(c => c.value)).toEqual([
        'salary',
        'investment',
        'bonus',
        'other',
      ])
    })

    it('should have correct income category labels', () => {
      expect(INCOME_CATEGORIES[0].label).toBe('工资')
      expect(INCOME_CATEGORIES[1].label).toBe('理财')
      expect(INCOME_CATEGORIES[2].label).toBe('奖金')
      expect(INCOME_CATEGORIES[3].label).toBe('其他')
    })

    it('should have correct income category icons', () => {
      expect(INCOME_CATEGORIES[0].icon).toBe('💰')
      expect(INCOME_CATEGORIES[1].icon).toBe('📈')
      expect(INCOME_CATEGORIES[2].icon).toBe('🎁')
      expect(INCOME_CATEGORIES[3].icon).toBe('💵')
    })
  })

  describe('类别标签映射', () => {
    it('should have all expense category labels', () => {
      expect(CATEGORY_LABELS.catering).toBe('餐饮')
      expect(CATEGORY_LABELS.transport).toBe('交通')
      expect(CATEGORY_LABELS.shopping).toBe('购物')
      expect(CATEGORY_LABELS.entertainment).toBe('娱乐')
      expect(CATEGORY_LABELS.other).toBe('其他')
    })

    it('should have all income category labels', () => {
      expect(CATEGORY_LABELS.salary).toBe('工资')
      expect(CATEGORY_LABELS.investment).toBe('理财')
      expect(CATEGORY_LABELS.bonus).toBe('奖金')
    })
  })

  describe('类别图标映射', () => {
    it('should have all expense category icons', () => {
      expect(CATEGORY_ICONS.catering).toBe('🍜')
      expect(CATEGORY_ICONS.transport).toBe('🚗')
      expect(CATEGORY_ICONS.shopping).toBe('🛒')
      expect(CATEGORY_ICONS.entertainment).toBe('🎮')
      expect(CATEGORY_ICONS.other).toBe('💵')
    })

    it('should have all income category icons', () => {
      expect(CATEGORY_ICONS.salary).toBe('💰')
      expect(CATEGORY_ICONS.investment).toBe('📈')
      expect(CATEGORY_ICONS.bonus).toBe('🎁')
    })
  })
})
