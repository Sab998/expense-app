import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Expense, ExpenseCategory, ExpenseSummary } from '../models/expense.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expenses = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expenses.asObservable();
  private summarySubject = new BehaviorSubject<ExpenseSummary>({ totalAmount: 0, categoryBreakdown: {}, recentExpenses: [] });
  private readonly STORAGE_KEY = 'expenses';

  constructor() {
    this.loadExpenses();
    // Initialize summary when expenses change
    this.expenses$.subscribe(expenses => {
      this.updateSummary(expenses);
    });
  }

  private loadExpenses(): void {
    const storedExpenses = localStorage.getItem(this.STORAGE_KEY);
    if (storedExpenses) {
      this.expenses.next(JSON.parse(storedExpenses).map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
        amount: Number(expense.amount) // Ensure amount is a number
      })));
    }
  }

  private saveExpenses(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.expenses.value));
  }

  private updateSummary(expenses: Expense[]): void {
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryBreakdown = expenses.reduce((acc, exp) => {
      const category = exp.category as ExpenseCategory;
      acc[category] = (acc[category] || 0) + exp.amount;
      return acc;
    }, {} as { [key in ExpenseCategory]?: number });

    const recentExpenses = [...expenses]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10); // Keep more items for pagination

    this.summarySubject.next({
      totalAmount,
      categoryBreakdown,
      recentExpenses
    });
  }

  getExpenseSummary(): Observable<ExpenseSummary> {
    return this.summarySubject.asObservable();
  }

  addExpense(expense: Omit<Expense, 'id'>): void {
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      amount: Number(expense.amount), // Ensure amount is a number
      date: new Date(expense.date)
    };
    const currentExpenses = this.expenses.value;
    const updatedExpenses = [...currentExpenses, newExpense];
    this.expenses.next(updatedExpenses);
    this.saveExpenses();
  }

  updateExpense(expense: Expense): void {
    const currentExpenses = this.expenses.value;
    const updatedExpenses = currentExpenses.map(e => 
      e.id === expense.id ? { ...expense, date: new Date(expense.date) } : e
    );
    this.expenses.next(updatedExpenses);
    this.saveExpenses();
  }

  deleteExpense(id: string): void {
    const currentExpenses = this.expenses.value;
    const updatedExpenses = currentExpenses.filter(e => e.id !== id);
    this.expenses.next(updatedExpenses);
    this.saveExpenses();
  }

  getExpensesByCategory(category?: ExpenseCategory): Observable<Expense[]> | { category: string; amount: number }[] {
    if (category) {
      // Return filtered expenses as Observable when category is provided
      return this.expenses$.pipe(
        map(expenses => expenses.filter(e => e.category === category))
      );
    } else {
      // Return category summary when no category is provided
      const categoryMap = new Map<string, number>();
      
      this.expenses.value
        .filter(expense => expense.category !== 'Income')
        .forEach(expense => {
          const currentAmount = categoryMap.get(expense.category) || 0;
          categoryMap.set(expense.category, currentAmount + expense.amount);
        });

      return Array.from(categoryMap.entries()).map(([category, amount]) => ({
        category,
        amount
      }));
    }
  }

  // Helper methods for calculations
  getTotalIncome(): number {
    return this.expenses.value
      .filter(expense => expense.category === 'Income')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getTotalExpenses(): number {
    return this.expenses.value
      .filter(expense => expense.category !== 'Income')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }
} 