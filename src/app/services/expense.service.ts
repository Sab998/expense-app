import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, take } from 'rxjs';
import { Expense, ExpenseCategory, ExpenseSummary } from '../models/expense.model';
import { BudgetService } from './budget.service';
import { FiscalYearService } from './fiscal-year.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expenses = new BehaviorSubject<Expense[]>([]);
  private readonly STORAGE_KEY = 'expenses';

  constructor(
    private budgetService: BudgetService,
    private fiscalYearService: FiscalYearService
  ) {
    this.loadExpenses();
  }

  getExpenses(): Observable<Expense[]> {
    return combineLatest([
      this.expenses,
      this.fiscalYearService.getCurrentFiscalYear()
    ]).pipe(
      map(([expenses, currentFiscalYear]) => {
        if (!currentFiscalYear) return [];
        return expenses.filter(expense => expense.fiscalYearId === currentFiscalYear.id);
      })
    );
  }

  addExpense(expense: Omit<Expense, 'id'>): void {
    this.fiscalYearService.getCurrentFiscalYear().pipe(take(1)).subscribe(currentFiscalYear => {
      if (!currentFiscalYear) return;

      const newExpense: Expense = {
        ...expense,
        id: crypto.randomUUID(),
        fiscalYearId: currentFiscalYear.id
      };

      const updatedExpenses = [...this.expenses.value, newExpense];
      this.expenses.next(updatedExpenses);
      this.saveExpenses();
      this.updateBudgetSpentAmount(newExpense.category);
    });
  }

  updateExpense(id: string, expense: Omit<Expense, 'id'>): void {
    this.fiscalYearService.getCurrentFiscalYear().pipe(take(1)).subscribe(currentFiscalYear => {
      if (!currentFiscalYear) return;

      const updatedExpenses = this.expenses.value.map(e =>
        e.id === id ? { ...expense, id, fiscalYearId: currentFiscalYear.id } : e
      );
      this.expenses.next(updatedExpenses);
      this.saveExpenses();
      this.updateBudgetSpentAmounts();
    });
  }

  deleteExpense(id: string): void {
    const updatedExpenses = this.expenses.value.filter(e => e.id !== id);
    this.expenses.next(updatedExpenses);
    this.saveExpenses();
    this.updateBudgetSpentAmounts();
  }

  getExpenseSummary(): Observable<ExpenseSummary> {
    return this.getExpenses().pipe(
      map(expenses => {
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const categoryBreakdown = expenses.reduce((breakdown, expense) => {
          const currentAmount = breakdown[expense.category] || 0;
          return {
            ...breakdown,
            [expense.category]: currentAmount + expense.amount
          };
        }, {} as { [key in ExpenseCategory]?: number });

        return {
          totalAmount,
          categoryBreakdown,
          recentExpenses: expenses.slice(-5)
        };
      })
    );
  }

  private updateBudgetSpentAmount(category: ExpenseCategory): void {
    this.getExpenses().subscribe(expenses => {
      const totalSpent = expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
      
      this.budgetService.updateSpentAmount(category, totalSpent);
    });
  }

  private updateBudgetSpentAmounts(): void {
    Object.values(ExpenseCategory).forEach(category => {
      this.updateBudgetSpentAmount(category);
    });
  }

  private loadExpenses(): void {
    const savedExpenses = localStorage.getItem(this.STORAGE_KEY);
    if (savedExpenses) {
      const expenses = JSON.parse(savedExpenses).map((e: any) => ({
        ...e,
        date: new Date(e.date)
      }));
      this.expenses.next(expenses);
      this.updateBudgetSpentAmounts();
    }
  }

  private saveExpenses(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.expenses.value));
  }
} 