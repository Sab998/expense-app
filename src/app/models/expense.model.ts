export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  notes?: string;
}

export type ExpenseCategory = 'Food' | 'Transportation' | 'Housing' | 'Utilities' | 'Entertainment' | 'Shopping' | 'Healthcare' | 'Other';

export interface ExpenseSummary {
  totalAmount: number;
  categoryBreakdown: { [key in ExpenseCategory]?: number };
  recentExpenses: Expense[];
} 