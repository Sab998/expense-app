import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeUrlPipe],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <svg class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Expense List</span>
        </h2>
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Search expenses..."
            class="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
          <svg
            class="absolute left-2 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (expense of filteredExpenses$ | async; track expense.id) {
              <tr class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ expense.date | date:'mediumDate' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ expense.description }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [style.backgroundColor]="getCategoryBgColor(expense.category)"
                        [style.color]="getCategoryTextColor(expense.category)">
                    {{ expense.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ expense.amount | currency:'GBP':'symbol':'1.2-2':'en-GB' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  @if (expense.receipt) {
                    <button
                      (click)="viewReceipt(expense.receipt)"
                      class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      @if (expense.receipt.fileUrl.endsWith('.pdf')) {
                        <svg class="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      } @else {
                        <svg class="h-4 w-4 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      }
                      View
                    </button>
                  }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    (click)="onEdit(expense)"
                    class="text-primary-600 hover:text-primary-900 transition-colors duration-150"
                  >
                    Edit
                  </button>
                  <button
                    (click)="onDelete(expense.id)"
                    class="text-red-600 hover:text-red-900 transition-colors duration-150"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                  No expenses found
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Receipt Preview Modal -->
      @if (selectedReceipt) {
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Receipt Preview</h3>
              <button
                (click)="closeReceiptPreview()"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex justify-center">
              @if (selectedReceipt.fileUrl.endsWith('.pdf')) {
                <iframe [src]="selectedReceipt.fileUrl | safeUrl" class="w-full h-[600px]"></iframe>
              } @else {
                <img [src]="selectedReceipt.fileUrl" alt="Receipt" class="max-h-[600px] object-contain"/>
              }
            </div>
            <div class="mt-4 text-sm text-gray-500">
              <p>Uploaded on: {{ selectedReceipt.uploadDate | date:'medium' }}</p>
              <p>File name: {{ selectedReceipt.fileName }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ExpenseListComponent implements OnInit {
  searchTerm: string = '';
  filteredExpenses$;
  selectedReceipt: {
    fileUrl: string;
    fileName: string;
    uploadDate: Date;
  } | null = null;

  private readonly categoryColors: { [key: string]: string } = {
    Income: '#22C55E', // Green for income
    Food: '#10B981',
    Transportation: '#3B82F6',
    Housing: '#8B5CF6',
    Utilities: '#F59E0B',
    Entertainment: '#EC4899',
    Shopping: '#6366F1',
    Healthcare: '#EF4444',
    Other: '#6B7280'
  };

  constructor(private expenseService: ExpenseService) {
    this.filteredExpenses$ = this.expenseService.expenses$.pipe(
      map(expenses => 
        expenses.filter(expense =>
          expense.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          expense.category.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      )
    );
  }

  ngOnInit(): void {}

  getCategoryBgColor(category: string): string {
    const color = this.categoryColors[category] || this.categoryColors['Other'];
    return `${color}20`; // 20 is the hex value for 12% opacity
  }

  getCategoryTextColor(category: string): string {
    return this.categoryColors[category] || this.categoryColors['Other'];
  }

  viewReceipt(receipt: { fileUrl: string; fileName: string; uploadDate: Date }): void {
    this.selectedReceipt = receipt;
  }

  closeReceiptPreview(): void {
    this.selectedReceipt = null;
  }

  onDelete(id: string): void {
    this.expenseService.deleteExpense(id);
  }

  onEdit(expense: Expense): void {
    // Implementation for edit functionality
  }
} 