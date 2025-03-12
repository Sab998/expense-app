export type ExpenseCategory = 
  | 'Income'
  | 'Food'
  | 'Transportation'
  | 'Housing'
  | 'Utilities'
  | 'Entertainment'
  | 'Shopping'
  | 'Healthcare'
  | 'Other';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  notes?: string;
  receipt: {
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