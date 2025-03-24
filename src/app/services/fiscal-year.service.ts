import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FiscalYear, FiscalYearBudget } from '../models/fiscal-year.model';

@Injectable({
  providedIn: 'root'
})
export class FiscalYearService {
  private currentFiscalYear = new BehaviorSubject<FiscalYear | null>(null);
  private fiscalYears = new BehaviorSubject<FiscalYear[]>([]);
  private fiscalYearBudgets = new BehaviorSubject<FiscalYearBudget[]>([]);

  constructor() {
    this.loadFiscalYears();
  }

  getCurrentFiscalYear(): Observable<FiscalYear | null> {
    return this.currentFiscalYear.asObservable();
  }

  getFiscalYears(): Observable<FiscalYear[]> {
    return this.fiscalYears.asObservable();
  }

  getFiscalYearBudget(fiscalYearId: string): FiscalYearBudget | null {
    return this.fiscalYearBudgets.value.find(b => b.fiscalYearId === fiscalYearId) || null;
  }

  createFiscalYear(fiscalYear: Omit<FiscalYear, 'id'>): void {
    const newFiscalYear: FiscalYear = {
      ...fiscalYear,
      id: crypto.randomUUID()
    };

    const years = [...this.fiscalYears.value, newFiscalYear];
    this.fiscalYears.next(years);
    this.saveFiscalYears();

    // Create empty budget for the new fiscal year
    const newBudget: FiscalYearBudget = {
      id: crypto.randomUUID(),
      fiscalYearId: newFiscalYear.id,
      totalBudget: 0,
      totalSpent: 0,
      lastUpdated: new Date(),
      categoryBudgets: []
    };

    this.fiscalYearBudgets.next([...this.fiscalYearBudgets.value, newBudget]);
    this.saveFiscalYearBudgets();

    // Set the new fiscal year as active
    this.setActiveFiscalYear(newFiscalYear.id);
  }

  setActiveFiscalYear(fiscalYearId: string): void {
    const years = this.fiscalYears.value.map(year => ({
      ...year,
      isActive: year.id === fiscalYearId
    }));
    
    this.fiscalYears.next(years);
    this.currentFiscalYear.next(years.find(y => y.id === fiscalYearId) || null);
    this.saveFiscalYears();
  }

  private loadFiscalYears(): void {
    const savedYears = localStorage.getItem('fiscalYears');
    const savedBudgets = localStorage.getItem('fiscalYearBudgets');

    if (savedYears) {
      const years = JSON.parse(savedYears);
      this.fiscalYears.next(years);
      const activeYear = years.find((y: FiscalYear) => y.isActive);
      if (activeYear) {
        this.currentFiscalYear.next(activeYear);
      }
    }

    if (savedBudgets) {
      this.fiscalYearBudgets.next(JSON.parse(savedBudgets));
    }
  }

  private saveFiscalYears(): void {
    localStorage.setItem('fiscalYears', JSON.stringify(this.fiscalYears.value));
  }

  private saveFiscalYearBudgets(): void {
    localStorage.setItem('fiscalYearBudgets', JSON.stringify(this.fiscalYearBudgets.value));
  }

  updateFiscalYear(id: string, data: Partial<FiscalYear>): void {
    const fiscalYears = this.fiscalYears.value;
    const index = fiscalYears.findIndex(fy => fy.id === id);
    
    if (index !== -1) {
      const updatedFiscalYear = { ...fiscalYears[index], ...data };
      fiscalYears[index] = updatedFiscalYear;
      
      // If this fiscal year is being set as active, update the current fiscal year
      if (data.isActive) {
        this.currentFiscalYear.next(updatedFiscalYear);
      }
      
      localStorage.setItem('fiscalYears', JSON.stringify(fiscalYears));
      this.fiscalYears.next(fiscalYears);
    }
  }

  deleteFiscalYear(id: string): void {
    const fiscalYears = this.fiscalYears.value;
    const filteredFiscalYears = fiscalYears.filter(fy => fy.id !== id);
    
    // Delete associated budget
    const budgets = this.fiscalYearBudgets.value;
    const filteredBudgets = budgets.filter(b => b.fiscalYearId !== id);
    this.fiscalYearBudgets.next(filteredBudgets);
    this.saveFiscalYearBudgets();
    
    // Update fiscal years
    localStorage.setItem('fiscalYears', JSON.stringify(filteredFiscalYears));
    this.fiscalYears.next(filteredFiscalYears);
    
    // If the deleted fiscal year was active, set the first available fiscal year as active
    const currentFiscalYear = this.currentFiscalYear.value;
    if (currentFiscalYear?.id === id && filteredFiscalYears.length > 0) {
      this.setActiveFiscalYear(filteredFiscalYears[0].id);
    } else if (filteredFiscalYears.length === 0) {
      this.currentFiscalYear.next(null);
    }
  }
} 