import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense, ExpenseCategory } from '../../models/expense.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Expenses</h2>
        <select
          (change)="filterByCategory($event)"
          class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option *ngFor="let category of categories" [value]="category">
            {{category}}
          </option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let expense of expenses$ | async">
              <td class="px-6 py-4 whitespace-nowrap">{{expense.date | date:'shortDate'}}</td>
              <td class="px-6 py-4">
                {{expense.description}}
                <p *ngIf="expense.notes" class="text-sm text-gray-500">{{expense.notes}}</p>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="getCategoryClass(expense.category)">
                  {{expense.category}}
                </span>
              </td>
              <td class="px-6 py-4">{{expense.amount | currency}}</td>
              <td class="px-6 py-4 space-x-2">
                <button
                  (click)="onEdit(expense)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button
                  (click)="onDelete(expense.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }
  `]
})
export class ExpenseListComponent implements OnInit {
  expenses$: Observable<Expense[]>;
  categories: ExpenseCategory[] = [
    'Food', 'Transportation', 'Housing', 'Utilities',
    'Entertainment', 'Shopping', 'Healthcare', 'Other'
  ];

  constructor(private expenseService: ExpenseService) {
    this.expenses$ = this.expenseService.expenses$;
  }

  ngOnInit(): void {}

  filterByCategory(event: Event): void {
    const category = (event.target as HTMLSelectElement).value as ExpenseCategory;
    this.expenses$ = category
      ? this.expenseService.getExpensesByCategory(category)
      : this.expenseService.expenses$;
  }

  onEdit(expense: Expense): void {
    // Implement edit logic in parent component
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id);
    }
  }

  getCategoryClass(category: string): string {
    const baseClasses = 'bg-opacity-10 ';
    switch (category) {
      case 'Food':
        return baseClasses + 'bg-green-500 text-green-800';
      case 'Transportation':
        return baseClasses + 'bg-blue-500 text-blue-800';
      case 'Housing':
        return baseClasses + 'bg-purple-500 text-purple-800';
      case 'Utilities':
        return baseClasses + 'bg-yellow-500 text-yellow-800';
      case 'Entertainment':
        return baseClasses + 'bg-pink-500 text-pink-800';
      case 'Shopping':
        return baseClasses + 'bg-indigo-500 text-indigo-800';
      case 'Healthcare':
        return baseClasses + 'bg-red-500 text-red-800';
      default:
        return baseClasses + 'bg-gray-500 text-gray-800';
    }
  }
} 