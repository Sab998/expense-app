export enum ExpenseCategory {
  Income = 'Income',
  Food = 'Food',
  Transportation = 'Transportation',
  Housing = 'Housing',
  Utilities = 'Utilities',
  Entertainment = 'Entertainment',
  Shopping = 'Shopping',
  Healthcare = 'Healthcare',
  Other = 'Other'
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  notes?: string;
  fiscalYearId: string;
  receipt?: {
    fileName: string;
    fileUrl: string;
    uploadDate: Date;
  };
}

export interface ExpenseSummary {
  totalAmount: number;
  categoryBreakdown: { [key in ExpenseCategory]?: number };
  recentExpenses: Expense[];
} 