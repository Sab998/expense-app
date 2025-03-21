import { Component } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BudgetComponent } from './components/budget/budget.component';
import { ExpenseService } from './services/expense.service';
import { Expense } from './models/expense.model';
import { FiscalYearSelectorComponent } from './components/fiscal-year-selector/fiscal-year-selector.component';
import localeGb from '@angular/common/locales/en-GB';

// Register the locale data for British Pound
registerLocaleData(localeGb, 'en-GB');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ExpenseFormComponent,
    ExpenseListComponent,
    DashboardComponent,
    BudgetComponent,
    FiscalYearSelectorComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold text-gray-900">Expense Tracker</h1>
            <app-fiscal-year-selector></app-fiscal-year-selector>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Budget Overview -->
            <div class="lg:col-span-1">
              <app-budget></app-budget>
            </div>

            <!-- Dashboard -->
            <div class="lg:col-span-2">
              <app-dashboard></app-dashboard>
            </div>

            <!-- Expense Form -->
            <div class="lg:col-span-1">
              <app-expense-form
                [expense]="editingExpense"
                (submitExpense)="onSubmitExpense($event)"
              ></app-expense-form>
            </div>

            <!-- Expense List -->
            <div class="lg:col-span-2">
              <app-expense-list
                (editExpense)="onEditExpense($event)"
              ></app-expense-list>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {
  editingExpense: Expense | undefined;

  constructor(private expenseService: ExpenseService) {}

  onSubmitExpense(expense: Omit<Expense, 'id'>): void {
    if (this.editingExpense) {
      this.expenseService.updateExpense(this.editingExpense.id, expense);
    } else {
      this.expenseService.addExpense(expense);
    }
    this.editingExpense = undefined;
  }

  onEditExpense(expense: Expense): void {
    this.editingExpense = expense;
  }
}
