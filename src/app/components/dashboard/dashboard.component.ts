import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseSummary } from '../../models/expense.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Expenses Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform hover:scale-105 transition-transform duration-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Total Expenses</h3>
            <div class="p-2 bg-blue-50 rounded-lg">
              <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-bold text-blue-600">
            {{(summary$ | async)?.totalAmount | currency}}
          </p>
        </div>

        <!-- Recent Activity Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div class="p-2 bg-green-50 rounded-lg">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div class="space-y-3">
            <div *ngFor="let expense of (summary$ | async)?.recentExpenses; let i = index"
                 class="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                 [style.animation-delay]="i * 100 + 'ms'">
              <div>
                <p class="font-medium text-gray-900">{{expense.description}}</p>
                <p class="text-sm text-gray-500">{{expense.date | date:'MMM d, y'}}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-blue-600">{{expense.amount | currency}}</p>
                <p class="text-sm text-gray-500">{{expense.category}}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">Expenses by Category</h3>
          <div class="p-2 bg-purple-50 rounded-lg">
            <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
        </div>
        <div class="space-y-4">
          <div *ngFor="let category of getCategories(summary$ | async); let i = index"
               class="relative animate-fade-in"
               [style.animation-delay]="i * 100 + 'ms'">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-gray-900">{{category.name}}</span>
              <span class="text-sm font-medium text-gray-900">{{category.amount | currency}}</span>
            </div>
            <div class="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
              <div
                class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                [ngStyle]="{
                  'width': category.percentage + '%',
                  'background-color': getCategoryColor(category.name)
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  `]
})
export class DashboardComponent implements OnInit {
  summary$: Observable<ExpenseSummary>;

  constructor(private expenseService: ExpenseService) {
    this.summary$ = this.expenseService.getExpenseSummary();
  }

  ngOnInit(): void {}

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
} 