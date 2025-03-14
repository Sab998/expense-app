import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-900">Budget Overview</h3>
        <div class="p-2 bg-indigo-50 rounded-lg">
          <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      @if (budget$ | async; as budget) {
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Total Budget -->
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Total Budget</p>
              <p class="text-2xl font-bold text-gray-900">{{ budget.totalBudget | currency:'GBP':'symbol':'1.2-2':'en-GB' }}</p>
            </div>

            <!-- Total Spent -->
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Total Spent</p>
              <p class="text-2xl font-bold text-gray-900">{{ budget.totalSpent | currency:'GBP':'symbol':'1.2-2':'en-GB' }}</p>
            </div>

            <!-- Remaining -->
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Remaining</p>
              <p class="text-2xl font-bold" [class.text-green-600]="getRemainingBudget() >= 0" [class.text-red-600]="getRemainingBudget() < 0">
                {{ getRemainingBudget() | currency:'GBP':'symbol':'1.2-2':'en-GB' }}
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Budget Usage</span>
              <span class="text-gray-900">{{ getBudgetUsagePercentage() | number:'1.0-1' }}%</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full transition-all duration-500"
                   [class.bg-green-500]="getBudgetUsagePercentage() < 80"
                   [class.bg-yellow-500]="getBudgetUsagePercentage() >= 80 && getBudgetUsagePercentage() < 100"
                   [class.bg-red-500]="getBudgetUsagePercentage() >= 100"
                   [style.width.%]="Math.min(getBudgetUsagePercentage(), 100)">
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-8">
          <p class="text-gray-600 mb-4">No budget set yet</p>
          <button
            (click)="setInitialBudget()"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Set Initial Budget
          </button>
        </div>
      }

      @if (showBudgetForm) {
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-medium text-gray-900">Set New Budget</h4>
            <button
              (click)="showBudgetForm = false"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex gap-4">
            <div class="flex-1">
              <label for="budget" class="block text-sm font-medium text-gray-700">Amount</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">£</span>
                </div>
                <input
                  type="number"
                  id="budget"
                  [(ngModel)]="newBudgetAmount"
                  class="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            <div class="flex items-end">
              <button
                (click)="updateBudget()"
                [disabled]="!newBudgetAmount || newBudgetAmount <= 0"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      } @else {
        <button
          (click)="showBudgetForm = true"
          class="mt-6 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Update Budget
        </button>
      }
    </div>
  `,
  styles: []
})
export class BudgetComponent implements OnInit {
  protected readonly Math = Math;
  budget$: Observable<Budget | null>;
  showBudgetForm = false;
  newBudgetAmount: number | null = null;
  private currentBudget: Budget | null = null;

  constructor(private budgetService: BudgetService) {
    this.budget$ = this.budgetService.getBudget();
    this.budget$.subscribe(budget => {
      this.currentBudget = budget;
    });
  }

  ngOnInit(): void {}

  setInitialBudget(): void {
    this.showBudgetForm = true;
  }

  updateBudget(): void {
    if (this.newBudgetAmount && this.newBudgetAmount > 0) {
      this.budgetService.setBudget(this.newBudgetAmount);
      this.showBudgetForm = false;
      this.newBudgetAmount = null;
    }
  }

  getRemainingBudget(): number {
    return this.budgetService.getRemainingBudget();
  }

  getBudgetUsagePercentage(): number {
    if (!this.currentBudget) return 0;
    return (this.currentBudget.totalSpent / this.currentBudget.totalBudget) * 100;
  }
} 