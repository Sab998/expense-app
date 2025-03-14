import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Budget } from '../models/budget.model';
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
        this.budget.next({
          ...budgetData,
          lastUpdated: new Date(budgetData.lastUpdated)
        });
        console.log('Budget loaded:', budgetData); // Debug log
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
        console.log('Budget saved:', budgetToSave); // Debug log
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  }

  setBudget(totalBudget: number): void {
    const newBudget: Budget = {
      id: this.budget.value?.id || uuidv4(),
      totalBudget,
      totalSpent: this.budget.value?.totalSpent || 0,
      lastUpdated: new Date()
    };
    this.budget.next(newBudget);
    this.saveBudget();
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
} 