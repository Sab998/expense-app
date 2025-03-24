import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { ExpenseListComponent } from '../expense-list/expense-list.component';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expense-management',
  standalone: true,
  imports: [CommonModule, ExpenseFormComponent, ExpenseListComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Expense Form -->
        <div class="lg:col-span-1">
          <app-expense-form
            [expense]="selectedExpense"
            (expenseAdded)="onExpenseAdded($event)"
            (expenseUpdated)="onExpenseUpdated($event)"
            (formReset)="onFormReset()"
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
  `
})
export class ExpenseManagementComponent implements OnInit {
  selectedExpense: Expense | undefined;

  constructor() {}

  ngOnInit(): void {}

  onExpenseAdded(expense: Expense): void {
    // Handle expense added
    console.log('Expense added:', expense);
  }

  onExpenseUpdated(expense: Expense): void {
    // Handle expense updated
    console.log('Expense updated:', expense);
  }

  onEditExpense(expense: Expense): void {
    this.selectedExpense = expense;
  }

  onFormReset(): void {
    this.selectedExpense = undefined;
  }
} 