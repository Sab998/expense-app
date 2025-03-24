import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseSummary, Expense } from '../../models/expense.model';
import { Observable, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget.model';
import { SafePipe } from '../../pipes/safe.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SafePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <!-- Budget Overview -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Budget Overview</h2>
        @if (budget$ | async; as budget) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Total Budget -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-gray-500">Total Budget</h3>
              <p class="mt-1 text-2xl font-bold text-gray-900">{{ budget.totalBudget | currency:'GBP':'symbol':'1.2-2' }}</p>
            </div>
            
            <!-- Remaining Budget -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-gray-500">Remaining Budget</h3>
              <p class="mt-1 text-2xl font-bold"
                 [class.text-green-600]="(remainingBudget$ | async) ?? 0 >= 0"
                 [class.text-red-600]="(remainingBudget$ | async) ?? 0 < 0">
                {{ remainingBudget$ | async | currency:'GBP':'symbol':'1.2-2' }}
              </p>
            </div>

            <!-- Budget Usage -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-gray-500">Budget Usage</h3>
              <div class="mt-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium"
                        [class.text-green-600]="(budgetUsagePercentage$ | async) ?? 0 < 80"
                        [class.text-yellow-600]="(budgetUsagePercentage$ | async) ?? 0 >= 80 && (budgetUsagePercentage$ | async) ?? 0 < 100"
                        [class.text-red-600]="(budgetUsagePercentage$ | async) ?? 0 >= 100">
                    {{ budgetUsagePercentage$ | async | number:'1.0-1' }}%
                  </span>
                </div>
                <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full transition-all duration-500"
                       [class.bg-green-500]="(budgetUsagePercentage$ | async) ?? 0 < 80"
                       [class.bg-yellow-500]="(budgetUsagePercentage$ | async) ?? 0 >= 80 && (budgetUsagePercentage$ | async) ?? 0 < 100"
                       [class.bg-red-500]="(budgetUsagePercentage$ | async) ?? 0 >= 100"
                       [style.width.%]="budgetUsagePercentage$ | async">
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <div class="text-center py-4 text-gray-500">
            No budget data available. Please set up your budget first.
          </div>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Expenses Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform hover:scale-105 transition-transform duration-200 h-[300px] flex flex-col">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Total Expenses</h3>
            <div class="p-2 bg-blue-50 rounded-lg">
              <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="flex-grow flex flex-col justify-center">
            <div class="text-center">
              <p class="text-sm text-gray-500 mb-2">Total Amount</p>
              <p class="text-4xl font-bold text-blue-600">
                {{(summary$ | async)?.totalAmount | currency:'GBP':'symbol':'1.2-2':'en-GB'}}
              </p>
            </div>
          </div>
        </div>

        <!-- Recent Activity Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2 h-[300px] flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div class="p-2 bg-green-50 rounded-lg">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div class="flex-grow overflow-y-auto custom-scrollbar">
            @if (paginatedExpenses$ | async; as expenses) {
              <div class="space-y-3">
                @for (expense of expenses; track expense.id) {
                  <div class="flex justify-between items-center p-1 rounded-lg hover:bg-gray-50 transition-colors duration-150 animate-fade-in"
                       [style.animation-delay]="$index * 100 + 'ms'">
                    <div>
                      <p class="font-medium text-gray-900">{{expense.description}}</p>
                      <p class="text-sm text-gray-500">{{expense.date | date:'MMM d, y'}}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-medium text-blue-600">{{expense.amount | currency:'GBP':'symbol':'1.2-2':'en-GB'}}</p>
                      <p class="text-sm text-gray-500">{{expense.category}}</p>
                    </div>
                  </div>
                }
              </div>

              @if (totalPages$ | async; as totalPages) {
                @if (totalPages > 1) {
                  <div class="flex justify-center items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      (click)="previousPage()"
                      [disabled]="currentPage === 0"
                      class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span class="text-sm text-gray-600">
                      Page {{currentPage + 1}} of {{totalPages}}
                    </span>
                    <button 
                      (click)="nextPage()"
                      [disabled]="currentPage === totalPages - 1"
                      class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                }
              }
            }
          </div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">Expenses by Category</h3>
          <div class="flex items-center space-x-2">
            <div class="p-2 bg-purple-50 rounded-lg">
              <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button 
                (click)="setViewMode('bar')"
                [class.bg-white]="viewMode === 'bar'"
                [class.text-gray-900]="viewMode === 'bar'"
                [class.text-gray-500]="viewMode !== 'bar'"
                class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              <button 
                (click)="setViewMode('pie')"
                [class.bg-white]="viewMode === 'pie'"
                [class.text-gray-900]="viewMode === 'pie'"
                [class.text-gray-500]="viewMode !== 'pie'"
                class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        @if (paginatedCategories$ | async; as categories) {
          @if (viewMode === 'bar') {
            <div class="space-y-4">
              @for (category of categories; track category.name) {
                <div class="relative animate-fade-in"
                     [style.animation-delay]="$index * 100 + 'ms'">
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-gray-900">{{category.name}}</span>
                    <span class="text-sm font-medium text-gray-900">{{category.amount | currency:'GBP':'symbol':'1.2-2':'en-GB'}}</span>
                  </div>
                  <div class="overflow-hidden h-3 text-xs flex rounded-full bg-gray-100">
                    <div
                      class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                      [ngStyle]="{
                        'width': category.percentage + '%',
                        'background-color': getCategoryColor(category.name)
                      }"
                    ></div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              @for (category of categories; track category.name) {
                <div class="relative animate-fade-in p-4 rounded-lg"
                     [style.animation-delay]="$index * 100 + 'ms'"
                     [style.backgroundColor]="getCategoryColor(category.name) + '20'">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center"
                         [style.backgroundColor]="getCategoryColor(category.name)">
                      <span class="text-white font-medium">{{category.percentage | number:'1.0-0'}}%</span>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">{{category.name}}</h4>
                      <p class="text-sm text-gray-600">{{category.amount | currency:'GBP':'symbol':'1.2-2':'en-GB'}}</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          @if (categoryTotalPages$ | async; as totalPages) {
            @if (totalPages > 1) {
              <div class="flex justify-center items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                <button 
                  (click)="previousCategoryPage()"
                  [disabled]="categoryPage === 0"
                  class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span class="text-sm text-gray-600">
                  Page {{categoryPage + 1}} of {{totalPages}}
                </span>
                <button 
                  (click)="nextCategoryPage()"
                  [disabled]="categoryPage === totalPages - 1"
                  class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            }
          }
        }
      </div>
    </div>

    <!-- Receipt Preview Modal -->
    @if (selectedReceipt) {
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Receipt Preview</h3>
            <button
              (click)="closeReceiptPreview()"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="aspect-w-16 aspect-h-9">
            <iframe
              [src]="selectedReceipt | safe"
              class="w-full h-full rounded-lg"
              frameborder="0"
            ></iframe>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
      opacity: 0;
    }

    .recent-activity-item {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.5);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(156, 163, 175, 0.7);
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private currentPageSubject = new BehaviorSubject<number>(0);
  private categoryPageSubject = new BehaviorSubject<number>(0);
  
  summary$: Observable<ExpenseSummary>;
  paginatedExpenses$: Observable<Expense[]>;
  paginatedCategories$: Observable<Array<{ name: string; amount: number; percentage: number }>>;
  totalPages$: Observable<number>;
  categoryTotalPages$: Observable<number>;
  itemsPerPage = 3;
  budget$: Observable<Budget | null>;
  remainingBudget$: Observable<number>;
  budgetUsagePercentage$: Observable<number>;
  selectedReceipt: string | null = null;
  viewMode: 'bar' | 'pie' = 'bar';

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService
  ) {
    // Get and share the summary stream
    this.summary$ = this.expenseService.getExpenseSummary().pipe(
      distinctUntilChanged((prev: ExpenseSummary, curr: ExpenseSummary) => 
        JSON.stringify(prev.recentExpenses) === JSON.stringify(curr.recentExpenses)
      ),
      shareReplay(1)
    );

    // Calculate total pages for expenses
    this.totalPages$ = this.summary$.pipe(
      map(summary => Math.ceil((summary.recentExpenses?.length || 0) / this.itemsPerPage)),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    // Calculate total pages for categories
    this.categoryTotalPages$ = this.summary$.pipe(
      map(summary => {
        const categoriesCount = Object.keys(summary?.categoryBreakdown || {}).length;
        return Math.ceil(categoriesCount / this.itemsPerPage);
      }),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    // Create paginated expenses stream
    this.paginatedExpenses$ = combineLatest([
      this.summary$,
      this.currentPageSubject.pipe(distinctUntilChanged())
    ]).pipe(
      map(([summary, page]) => {
        if (!summary?.recentExpenses?.length) return [];
        const start = page * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return summary.recentExpenses.slice(start, end);
      }),
      takeUntil(this.destroy$)
    );

    // Create paginated categories stream
    this.paginatedCategories$ = combineLatest([
      this.summary$,
      this.categoryPageSubject.pipe(distinctUntilChanged())
    ]).pipe(
      map(([summary, page]) => {
        if (!summary) return [];
        const categories = this.getCategories(summary);
        const start = page * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return categories.slice(start, end);
      }),
      takeUntil(this.destroy$)
    );

    // Reset expense page when data changes
    this.summary$.pipe(
      distinctUntilChanged((prev, curr) => 
        prev.recentExpenses.length === curr.recentExpenses.length
      ),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.currentPage !== 0) {
        this.currentPageSubject.next(0);
      }
    });

    // Reset category page when data changes
    this.summary$.pipe(
      distinctUntilChanged((prev, curr) => 
        Object.keys(prev.categoryBreakdown).length === Object.keys(curr.categoryBreakdown).length
      ),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.categoryPage !== 0) {
        this.categoryPageSubject.next(0);
      }
    });

    this.budget$ = this.budgetService.getBudget();
    this.remainingBudget$ = this.budgetService.getRemainingBudget();
    this.budgetUsagePercentage$ = this.budgetService.getBudgetUsagePercentage();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentPage(): number {
    return this.currentPageSubject.value;
  }

  get categoryPage(): number {
    return this.categoryPageSubject.value;
  }

  nextPage(): void {
    this.currentPageSubject.next(this.currentPage + 1);
  }

  previousPage(): void {
    this.currentPageSubject.next(this.currentPage - 1);
  }

  nextCategoryPage(): void {
    this.categoryPageSubject.next(this.categoryPage + 1);
  }

  previousCategoryPage(): void {
    this.categoryPageSubject.next(this.categoryPage - 1);
  }

  getCategories(summary: ExpenseSummary | null): Array<{ name: string; amount: number; percentage: number }> {
    if (!summary) return [];

    const total = summary.totalAmount;
    return Object.entries(summary.categoryBreakdown)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / total) * 100
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      Food: '#10B981',
      Transportation: '#3B82F6',
      Housing: '#8B5CF6',
      Utilities: '#F59E0B',
      Entertainment: '#EC4899',
      Shopping: '#6366F1',
      Healthcare: '#EF4444',
      Other: '#6B7280'
    };
    return colors[category] || colors['Other'];
  }

  viewReceipt(expense: Expense): void {
    if (expense.receipt) {
      this.selectedReceipt = expense.receipt.fileUrl;
    }
  }

  closeReceiptPreview(): void {
    this.selectedReceipt = null;
  }

  setViewMode(mode: 'bar' | 'pie'): void {
    this.viewMode = mode;
  }
} 