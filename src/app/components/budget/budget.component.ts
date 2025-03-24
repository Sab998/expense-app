import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { Budget, CategoryBudget } from '../../models/budget.model';
import { ExpenseCategory } from '../../models/expense.model';
import { Observable, map } from 'rxjs';
import { FiscalYearService } from '../../services/fiscal-year.service';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-900">Budget Overview</h3>
        <button
          (click)="showCategoryBudgetForm = true"
          [disabled]="!hasFiscalYear"
          class="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category Budget
        </button>
      </div>

      @if (!hasFiscalYear) {
        <div class="text-center py-8 bg-gray-50 rounded-lg">
          <p class="text-gray-600 mb-2">No Fiscal Year Selected</p>
          <p class="text-sm text-gray-500">Please select or add a fiscal year first to manage budgets.</p>
        </div>
      } @else {
        @if (budget$ | async; as budget) {
          <div class="space-y-6">
            <!-- Overall Budget -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-900">Overall Budget</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <!-- Total Budget -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600">Total Budget</p>
                  <p class="text-2xl font-bold text-gray-900">{{ budget.totalBudget | currency:'GBP':'symbol':'1.2-2':'en-GB' }}</p>
                </div>

                <!-- Remaining -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm text-gray-600">Remaining</p>
                  @if (remainingBudget$ | async; as remaining) {
                    <p class="text-2xl font-bold" 
                       [class.text-green-600]="remaining >= 0" 
                       [class.text-red-600]="remaining < 0">
                      {{ remaining | currency:'GBP':'symbol':'1.2-2':'en-GB' }}
                    </p>
                  }
                </div>
              </div>

              <!-- Overall Progress Bar -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Overall Budget Usage</span>
                  @if (budgetUsagePercentage$ | async; as usagePercentage) {
                    <span class="text-gray-900">{{ usagePercentage | number:'1.0-1' }}%</span>
                  }
                </div>
                @if (budgetUsagePercentage$ | async; as usagePercentage) {
                  <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-500"
                         [class.bg-green-500]="usagePercentage < 80"
                         [class.bg-yellow-500]="usagePercentage >= 80 && usagePercentage < 100"
                         [class.bg-red-500]="usagePercentage >= 100"
                         [style.width.%]="Math.min(usagePercentage, 100)">
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Category Budgets -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-900">Category Budgets</h4>

              @if (budget.categoryBudgets.length > 0) {
                <div class="h-[500px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  @for (categoryBudget of budget.categoryBudgets; track categoryBudget.category) {
                    <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-900">{{ categoryBudget.category }}</span>
                        <button
                          (click)="editCategoryBudget(categoryBudget)"
                          class="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </button>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <p class="text-sm text-gray-600">Budget</p>
                          <p class="text-lg font-semibold text-gray-900">
                            {{ categoryBudget.budgetAmount | currency:'GBP':'symbol':'1.2-2':'en-GB' }}
                          </p>
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Spent</p>
                          <p class="text-lg font-semibold text-gray-900">
                            {{ categoryBudget.spentAmount | currency:'GBP':'symbol':'1.2-2':'en-GB' }}
                          </p>
                        </div>
                      </div>
                      <div class="space-y-1">
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Usage</span>
                          <span class="text-gray-900">
                            {{ (categoryBudget.spentAmount / categoryBudget.budgetAmount * 100) | number:'1.0-1' }}%
                          </span>
                        </div>
                        <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div class="h-full transition-all duration-500"
                               [class.bg-green-500]="categoryBudget.spentAmount / categoryBudget.budgetAmount < 0.8"
                               [class.bg-yellow-500]="categoryBudget.spentAmount / categoryBudget.budgetAmount >= 0.8 && categoryBudget.spentAmount / categoryBudget.budgetAmount < 1"
                               [class.bg-red-500]="categoryBudget.spentAmount / categoryBudget.budgetAmount >= 1"
                               [style.width.%]="Math.min((categoryBudget.spentAmount / categoryBudget.budgetAmount * 100), 100)">
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-8 bg-gray-50 rounded-lg">
                  <p class="text-gray-600 mb-4">No category budgets set yet</p>
                  <button
                    (click)="showCategoryBudgetForm = true"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    Add Your First Category Budget
                  </button>
                </div>
              }
            </div>
          </div>
        }
      }

      <!-- Category Budget Form -->
      @if (showCategoryBudgetForm) {
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">
                {{ editingCategoryBudget ? 'Edit' : 'Add' }} Category Budget
              </h3>
              <button
                (click)="closeCategoryBudgetForm()"
                class="text-gray-400 hover:text-gray-500"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                <select
                  id="category"
                  [(ngModel)]="selectedCategory"
                  [disabled]="!!editingCategoryBudget"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select a category</option>
                  @for (category of availableCategories; track category) {
                    <option [value]="category">{{ category }}</option>
                  }
                </select>
              </div>
              <div>
                <label for="categoryBudget" class="block text-sm font-medium text-gray-700">Budget Amount</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">£</span>
                  </div>
                  <input
                    type="number"
                    id="categoryBudget"
                    [(ngModel)]="categoryBudgetAmount"
                    class="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div class="flex justify-end">
                <button
                  (click)="saveCategoryBudget()"
                  [disabled]="!canSaveCategoryBudget"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ editingCategoryBudget ? 'Update' : 'Add' }} Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #CBD5E1 transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #CBD5E1;
      border-radius: 3px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #94A3B8;
    }
  `]
})
export class BudgetComponent implements OnInit {
  protected readonly Math = Math;
  budget$: Observable<Budget | null>;
  remainingBudget$: Observable<number>;
  budgetUsagePercentage$: Observable<number>;
  showCategoryBudgetForm = false;
  selectedCategory: ExpenseCategory | '' = '';
  categoryBudgetAmount: number | null = null;
  editingCategoryBudget: CategoryBudget | null = null;
  private currentBudget: Budget | null = null;
  hasFiscalYear = false;

  constructor(
    private budgetService: BudgetService,
    private fiscalYearService: FiscalYearService
  ) {
    this.budget$ = this.budgetService.getBudget();
    this.remainingBudget$ = this.budgetService.getRemainingBudget();
    this.budgetUsagePercentage$ = this.budgetService.getBudgetUsagePercentage();
    
    this.budget$.subscribe(budget => {
      this.currentBudget = budget;
    });

    this.fiscalYearService.getCurrentFiscalYear().subscribe(fiscalYear => {
      this.hasFiscalYear = !!fiscalYear;
    });
  }

  ngOnInit(): void {}

  get availableCategories(): ExpenseCategory[] {
    if (!this.currentBudget) return Object.values(ExpenseCategory);
    
    const usedCategories = new Set(this.currentBudget.categoryBudgets.map(cb => cb.category));
    return Object.values(ExpenseCategory).filter(category => !usedCategories.has(category));
  }

  get canSaveCategoryBudget(): boolean {
    return (
      this.hasFiscalYear &&
      (!!this.selectedCategory || !!this.editingCategoryBudget) &&
      this.categoryBudgetAmount !== null &&
      this.categoryBudgetAmount > 0
    );
  }

  editCategoryBudget(categoryBudget: CategoryBudget): void {
    this.editingCategoryBudget = categoryBudget;
    this.selectedCategory = categoryBudget.category;
    this.categoryBudgetAmount = categoryBudget.budgetAmount;
    this.showCategoryBudgetForm = true;
  }

  saveCategoryBudget(): void {
    if (!this.canSaveCategoryBudget) return;

    const category = this.editingCategoryBudget?.category || this.selectedCategory as ExpenseCategory;
    this.budgetService.setCategoryBudget(category, this.categoryBudgetAmount!);
    this.closeCategoryBudgetForm();
  }

  closeCategoryBudgetForm(): void {
    this.showCategoryBudgetForm = false;
    this.selectedCategory = '';
    this.categoryBudgetAmount = null;
    this.editingCategoryBudget = null;
  }
} 