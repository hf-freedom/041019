export type TransactionType = 'income' | 'expense'

export type ExpenseCategory = 'catering' | 'transport' | 'shopping' | 'entertainment' | 'other'
export type IncomeCategory = 'salary' | 'investment' | 'bonus' | 'other'

export type Category = ExpenseCategory | IncomeCategory

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: Category
  date: string
  note: string
  createdAt: number
}

export interface DailySummary {
  date: string
  income: number
  expense: number
  transactions: Transaction[]
}

export interface MonthlySummary {
  totalIncome: number
  totalExpense: number
  balance: number
  categoryBreakdown: Record<string, number>
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'catering', label: '餐饮', icon: '🍜' },
  { value: 'transport', label: '交通', icon: '🚗' },
  { value: 'shopping', label: '购物', icon: '🛒' },
  { value: 'entertainment', label: '娱乐', icon: '🎮' },
  { value: 'other', label: '其他', icon: '📦' },
]

export const INCOME_CATEGORIES: { value: IncomeCategory; label: string; icon: string }[] = [
  { value: 'salary', label: '工资', icon: '💰' },
  { value: 'investment', label: '理财', icon: '📈' },
  { value: 'bonus', label: '奖金', icon: '🎁' },
  { value: 'other', label: '其他', icon: '💵' },
]

export const CATEGORY_LABELS: Record<Category, string> = {
  catering: '餐饮',
  transport: '交通',
  shopping: '购物',
  entertainment: '娱乐',
  salary: '工资',
  investment: '理财',
  bonus: '奖金',
  other: '其他',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  catering: '🍜',
  transport: '🚗',
  shopping: '🛒',
  entertainment: '🎮',
  salary: '💰',
  investment: '📈',
  bonus: '🎁',
  other: '💵',
}
