import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Budget, CategoryBudget } from '../models/budget.model';
import { ExpenseCategory } from '../models/expense.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private budget = new BehaviorSubject<Budget | null>(null);
  budget$ = this.budget.asObservable();
  private readonly STORAGE_KEY = 'budget';

  constructor() {
    this.loadBudget();
  }

  private loadBudget(): void {
    try {
      const storedBudget = localStorage.getItem(this.STORAGE_KEY);
      if (storedBudget) {
        const budgetData = JSON.parse(storedBudget);
        const categoryBudgets = budgetData.categoryBudgets?.map((cb: any) => ({
          ...cb,
          lastUpdated: new Date(cb.lastUpdated)
        })) || [];

        const totalBudget = this.calculateTotalBudget(categoryBudgets);

        this.budget.next({
          ...budgetData,
          totalBudget,
          lastUpdated: new Date(budgetData.lastUpdated),
          categoryBudgets
        });
        console.log('Budget loaded:', budgetData);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      this.budget.next(null);
    }
  }

  private saveBudget(): void {
    try {
      if (this.budget.value) {
        const budgetToSave = {
          ...this.budget.value,
          lastUpdated: new Date()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(budgetToSave));
        console.log('Budget saved:', budgetToSave);
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  }

  private calculateTotalBudget(categoryBudgets: CategoryBudget[]): number {
    return categoryBudgets.reduce((total, cb) => total + cb.budgetAmount, 0);
  }

  private initializeBudgetIfNeeded(): void {
    if (!this.budget.value) {
      const newBudget: Budget = {
        id: uuidv4(),
        totalBudget: 0,
        totalSpent: 0,
        lastUpdated: new Date(),
        categoryBudgets: []
      };
      this.budget.next(newBudget);
    }
  }

  setCategoryBudget(category: ExpenseCategory, budgetAmount: number): void {
    this.initializeBudgetIfNeeded();
    if (!this.budget.value) return;

    const currentBudget = this.budget.value;
    const existingCategoryIndex = currentBudget.categoryBudgets.findIndex(
      cb => cb.category === category
    );

    const categoryBudget: CategoryBudget = {
      category,
      budgetAmount,
      spentAmount: existingCategoryIndex >= 0 
        ? currentBudget.categoryBudgets[existingCategoryIndex].spentAmount 
        : 0,
      lastUpdated: new Date()
    };

    const updatedCategoryBudgets = [...currentBudget.categoryBudgets];
    if (existingCategoryIndex >= 0) {
      updatedCategoryBudgets[existingCategoryIndex] = categoryBudget;
    } else {
      updatedCategoryBudgets.push(categoryBudget);
    }

    const totalBudget = this.calculateTotalBudget(updatedCategoryBudgets);

    const updatedBudget: Budget = {
      ...currentBudget,
      totalBudget,
      categoryBudgets: updatedCategoryBudgets,
      lastUpdated: new Date()
    };

    this.budget.next(updatedBudget);
    this.saveBudget();
  }

  updateCategorySpent(category: ExpenseCategory, amount: number): void {
    if (!this.budget.value) return;

    const currentBudget = this.budget.value;
    const categoryIndex = currentBudget.categoryBudgets.findIndex(
      cb => cb.category === category
    );

    if (categoryIndex >= 0) {
      const updatedCategoryBudgets = [...currentBudget.categoryBudgets];
      updatedCategoryBudgets[categoryIndex] = {
        ...updatedCategoryBudgets[categoryIndex],
        spentAmount: amount,
        lastUpdated: new Date()
      };

      const updatedBudget: Budget = {
        ...currentBudget,
        categoryBudgets: updatedCategoryBudgets,
        lastUpdated: new Date()
      };

      this.budget.next(updatedBudget);
      this.saveBudget();
    }
  }

  updateTotalSpent(totalSpent: number): void {
    if (this.budget.value) {
      const updatedBudget: Budget = {
        ...this.budget.value,
        totalSpent,
        lastUpdated: new Date()
      };
      this.budget.next(updatedBudget);
      this.saveBudget();
    }
  }

  getBudget(): Observable<Budget | null> {
    return this.budget$;
  }

  getRemainingBudget(): number {
    const currentBudget = this.budget.value;
    if (!currentBudget) return 0;
    return currentBudget.totalBudget - currentBudget.totalSpent;
  }

  getCategoryBudget(category: ExpenseCategory): CategoryBudget | null {
    return this.budget.value?.categoryBudgets.find(cb => cb.category === category) || null;
  }

  getCategoryRemainingBudget(category: ExpenseCategory): number {
    const categoryBudget = this.getCategoryBudget(category);
    if (!categoryBudget) return 0;
    return categoryBudget.budgetAmount - categoryBudget.spentAmount;
  }
} 