import { ExpenseCategory } from './expense.model';

export interface CategoryBudget {
  category: ExpenseCategory;
  budgetAmount: number;
  spentAmount: number;
  lastUpdated: Date;
}

export interface Budget {
  id: string;
  fiscalYearId: string;
  totalBudget: number;
  totalSpent: number;
  lastUpdated: Date;
  categoryBudgets: CategoryBudget[];
} 