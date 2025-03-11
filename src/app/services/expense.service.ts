import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Expense, ExpenseCategory, ExpenseSummary } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expenses = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expenses.asObservable();

  constructor() {
    // Load expenses from localStorage on initialization
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      this.expenses.next(JSON.parse(savedExpenses));
    }
  }

  private saveToLocalStorage(expenses: Expense[]): void {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }

  addExpense(expense: Omit<Expense, 'id'>): void {
    const newExpense = {
      ...expense,
      id: crypto.randomUUID()
    };
    const currentExpenses = this.expenses.value;
    const updatedExpenses = [...currentExpenses, newExpense];
    this.expenses.next(updatedExpenses);
    this.saveToLocalStorage(updatedExpenses);
  }

  updateExpense(expense: Expense): void {
    const currentExpenses = this.expenses.value;
    const updatedExpenses = currentExpenses.map(e => 
      e.id === expense.id ? expense : e
    );
    this.expenses.next(updatedExpenses);
    this.saveToLocalStorage(updatedExpenses);
  }

  deleteExpense(id: string): void {
    const currentExpenses = this.expenses.value;
    const updatedExpenses = currentExpenses.filter(e => e.id !== id);
    this.expenses.next(updatedExpenses);
    this.saveToLocalStorage(updatedExpenses);
  }

  getExpenseSummary(): Observable<ExpenseSummary> {
    return this.expenses$.pipe(
      map(expenses => {
        const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const categoryBreakdown = expenses.reduce((acc, exp) => {
          const category = exp.category as ExpenseCategory;
          acc[category] = (acc[category] || 0) + exp.amount;
          return acc;
        }, {} as { [key in ExpenseCategory]?: number });

        const recentExpenses = [...expenses]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        return {
          totalAmount,
          categoryBreakdown,
          recentExpenses
        };
      })
    );
  }

  getExpensesByCategory(category: ExpenseCategory): Observable<Expense[]> {
    return this.expenses$.pipe(
      map(expenses => expenses.filter(e => e.category === category))
    );
  }
} 