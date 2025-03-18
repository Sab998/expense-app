import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Expense, ExpenseSummary, ExpenseCategory } from '../models/expense.model';
import { BudgetService } from './budget.service';
import { v4 as uuidv4 } from 'uuid';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expenses = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expenses.asObservable();
  private readonly STORAGE_KEY = 'expenses';

  constructor(private budgetService: BudgetService) {
    this.loadExpenses();
    // Subscribe to expense changes to update budget
    this.expenses$.pipe(
      tap(() => this.updateBudgets())
    ).subscribe();
  }

  private loadExpenses(): void {
    try {
      const storedExpenses = localStorage.getItem(this.STORAGE_KEY);
      if (storedExpenses) {
        const expensesData = JSON.parse(storedExpenses);
        const parsedExpenses = expensesData.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
          amount: Number(expense.amount)
        }));
        this.expenses.next(parsedExpenses);
        console.log('Loaded expenses:', parsedExpenses);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      this.expenses.next([]);
    }
  }

  private saveExpenses(): void {
    try {
      const expensesToSave = this.expenses.value.map(expense => ({
        ...expense,
        date: expense.date.toISOString(),
        amount: Number(expense.amount)
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expensesToSave));
      console.log('Saved expenses:', expensesToSave);
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  }

  private updateBudgets(): void {
    // Update total budget
    const totalSpent = this.expenses.value.reduce((sum, expense) => sum + expense.amount, 0);
    this.budgetService.updateTotalSpent(totalSpent);

    // Update category budgets
    const categoryTotals = this.expenses.value.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key in ExpenseCategory]: number });

    Object.entries(categoryTotals).forEach(([category, amount]) => {
      this.budgetService.updateCategorySpent(category as ExpenseCategory, amount);
    });
  }

  getExpenseSummary(): Observable<ExpenseSummary> {
    return this.expenses$.pipe(
      map(expenses => {
        const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const categoryBreakdown = expenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {} as { [key in ExpenseCategory]?: number });

        const recentExpenses = [...expenses]
          .sort((a, b) => b.date.getTime() - a.date.getTime());

        return { totalAmount, categoryBreakdown, recentExpenses };
      })
    );
  }

  addExpense(expense: Omit<Expense, 'id'>): void {
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      amount: Number(expense.amount),
      date: expense.date instanceof Date ? expense.date : new Date(expense.date)
    };
    
    const currentExpenses = this.expenses.value;
    const updatedExpenses = [newExpense, ...currentExpenses];
    this.expenses.next(updatedExpenses);
    this.saveExpenses();
  }

  updateExpense(id: string, expense: Partial<Expense>): void {
    console.log('Updating expense:', { id, expense });
    const currentExpenses = this.expenses.value;
    const updatedExpenses = currentExpenses.map(e => 
      e.id === id ? { 
        ...e, 
        ...expense, 
        amount: Number(expense.amount),
        date: expense.date ? (expense.date instanceof Date ? expense.date : new Date(expense.date)) : e.date,
        receipt: expense.receipt || e.receipt
      } : e
    );
    
    console.log('Updated expenses:', updatedExpenses);
    this.expenses.next(updatedExpenses);
    this.saveExpenses();
  }

  deleteExpense(id: string): void {
    const currentExpenses = this.expenses.value;
    const updatedExpenses = currentExpenses.filter(e => e.id !== id);
    this.expenses.next(updatedExpenses);
    this.saveExpenses();
  }

  getExpenses(): Observable<Expense[]> {
    return this.expenses$.pipe(
      map(expenses => [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime()))
    );
  }

  getExpensesByCategory(category: string): Expense[] {
    return this.expenses.value.filter(expense => expense.category === category);
  }
} 