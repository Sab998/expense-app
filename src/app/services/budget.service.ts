import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, take } from 'rxjs';
import { Budget, CategoryBudget } from '../models/budget.model';
import { ExpenseCategory } from '../models/expense.model';
import { FiscalYearService } from './fiscal-year.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private budgets = new BehaviorSubject<Budget[]>([]);

  constructor(private fiscalYearService: FiscalYearService) {
    this.loadBudgets();
  }

  getBudget(): Observable<Budget | null> {
    return this.getCurrentBudget();
  }

  getCurrentBudget(): Observable<Budget | null> {
    return combineLatest([
      this.budgets,
      this.fiscalYearService.getCurrentFiscalYear()
    ]).pipe(
      map(([budgets, currentFiscalYear]) => {
        if (!currentFiscalYear) return null;
        return budgets.find(b => b.fiscalYearId === currentFiscalYear.id) || {
          id: crypto.randomUUID(),
          fiscalYearId: currentFiscalYear.id,
          totalBudget: 0,
          totalSpent: 0,
          lastUpdated: new Date(),
          categoryBudgets: []
        };
      })
    );
  }

  updateBudget(budget: Budget): void {
    const currentBudgets = this.budgets.value;
    const index = currentBudgets.findIndex(b => b.fiscalYearId === budget.fiscalYearId);
    
    if (index >= 0) {
      currentBudgets[index] = budget;
    } else {
      currentBudgets.push(budget);
    }
    
    this.budgets.next(currentBudgets);
    this.saveBudgets();
  }

  setCategoryBudget(category: ExpenseCategory, amount: number): void {
    this.getCurrentBudget().pipe(take(1)).subscribe(currentBudget => {
      if (!currentBudget) return;

      const updatedBudget = { ...currentBudget };
      const categoryIndex = updatedBudget.categoryBudgets.findIndex(
        cb => cb.category === category
      );

      if (categoryIndex >= 0) {
        updatedBudget.categoryBudgets[categoryIndex] = {
          ...updatedBudget.categoryBudgets[categoryIndex],
          budgetAmount: amount,
          lastUpdated: new Date()
        };
      } else {
        updatedBudget.categoryBudgets.push({
          category,
          budgetAmount: amount,
          spentAmount: 0,
          lastUpdated: new Date()
        });
      }

      updatedBudget.totalBudget = updatedBudget.categoryBudgets.reduce(
        (total, cb) => total + cb.budgetAmount,
        0
      );

      this.updateBudget(updatedBudget);
    });
  }

  updateSpentAmount(category: ExpenseCategory, amount: number): void {
    this.getCurrentBudget().pipe(take(1)).subscribe(currentBudget => {
      if (!currentBudget) return;

      const updatedBudget = { ...currentBudget };
      const categoryIndex = updatedBudget.categoryBudgets.findIndex(
        cb => cb.category === category
      );

      if (categoryIndex >= 0) {
        updatedBudget.categoryBudgets[categoryIndex] = {
          ...updatedBudget.categoryBudgets[categoryIndex],
          spentAmount: amount,
          lastUpdated: new Date()
        };
      } else {
        updatedBudget.categoryBudgets.push({
          category,
          budgetAmount: 0,
          spentAmount: amount,
          lastUpdated: new Date()
        });
      }

      updatedBudget.totalSpent = updatedBudget.categoryBudgets.reduce(
        (total, cb) => total + cb.spentAmount,
        0
      );

      this.updateBudget(updatedBudget);
    });
  }

  getRemainingBudget(): Observable<number> {
    return this.getCurrentBudget().pipe(
      map(budget => {
        if (!budget) return 0;
        return budget.totalBudget - budget.totalSpent;
      })
    );
  }

  getBudgetUsagePercentage(): Observable<number> {
    return this.getCurrentBudget().pipe(
      map(budget => {
        if (!budget || budget.totalBudget === 0) return 0;
        return (budget.totalSpent / budget.totalBudget) * 100;
      })
    );
  }

  private loadBudgets(): void {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      this.budgets.next(JSON.parse(savedBudgets));
    }
  }

  private saveBudgets(): void {
    localStorage.setItem('budgets', JSON.stringify(this.budgets.value));
  }
} 