import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ExpenseService } from './services/expense.service';
import { Expense } from './models/expense.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ExpenseFormComponent,
    ExpenseListComponent,
    DashboardComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Navigation -->
      <nav class="bg-white shadow-lg border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <div class="flex-shrink-0 flex items-center space-x-3">
                <div class="p-2 bg-primary-50 rounded-lg">
                  <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 class="text-xl font-bold text-gray-900">Expense Tracker</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 animate-fade-in">
        <div class="px-4 sm:px-0 space-y-8">
          <!-- Dashboard -->
          <app-dashboard></app-dashboard>

          <!-- Expense Management -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Add Expense Form -->
            <div class="card card-hover animate-slide-up" style="animation-delay: 100ms;">
              <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <svg class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New Expense</span>
              </h2>
              <app-expense-form
                (submitExpense)="onAddExpense($event)"
              ></app-expense-form>
            </div>

            <!-- Expense List -->
            <div class="card card-hover animate-slide-up" style="animation-delay: 200ms;">
              <app-expense-list></app-expense-list>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent {
  constructor(private expenseService: ExpenseService) {}

  onAddExpense(expense: Omit<Expense, 'id'>): void {
    this.expenseService.addExpense(expense);
  }
}
