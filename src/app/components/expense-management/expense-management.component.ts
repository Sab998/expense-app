import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { ExpenseListComponent } from '../expense-list/expense-list.component';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expense-management',
  standalone: true,
  imports: [CommonModule, ExpenseFormComponent, ExpenseListComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Expenses</h1>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Expense Form -->
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              {{ editingExpense ? 'Edit Expense' : 'Add New Expense' }}
            </h2>
            <app-expense-form
              [expense]="editingExpense"
              (submitExpense)="onSubmitExpense($event)"
            ></app-expense-form>
          </div>
        </div>

        <!-- Expense List -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg">
            <app-expense-list
              (editExpense)="onEditExpense($event)"
            ></app-expense-list>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ExpenseManagementComponent {
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