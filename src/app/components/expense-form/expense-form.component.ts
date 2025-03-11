import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Expense, ExpenseCategory } from '../../models/expense.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            id="description"
            formControlName="description"
            class="block w-full rounded-md border-gray-300 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            [class.border-red-300]="isFieldInvalid('description')"
            [class.focus:border-red-500]="isFieldInvalid('description')"
            [class.focus:ring-red-500]="isFieldInvalid('description')"
          />
          <div *ngIf="isFieldInvalid('description')" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p *ngIf="isFieldInvalid('description')" class="mt-1 text-sm text-red-600">Description is required</p>
      </div>

      <div>
        <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="amount"
            formControlName="amount"
            class="block w-full pl-7 rounded-md border-gray-300 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            [class.border-red-300]="isFieldInvalid('amount')"
            [class.focus:border-red-500]="isFieldInvalid('amount')"
            [class.focus:ring-red-500]="isFieldInvalid('amount')"
          />
          <div *ngIf="isFieldInvalid('amount')" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p *ngIf="isFieldInvalid('amount')" class="mt-1 text-sm text-red-600">Please enter a valid amount</p>
      </div>

      <div>
        <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
        <div class="mt-1">
          <input
            type="date"
            id="date"
            formControlName="date"
            class="block w-full rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            [class.border-red-300]="isFieldInvalid('date')"
          />
        </div>
        <p *ngIf="isFieldInvalid('date')" class="mt-1 text-sm text-red-600">Date is required</p>
      </div>

      <div>
        <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
        <div class="mt-1">
          <select
            id="category"
            formControlName="category"
            class="block w-full rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            [class.border-red-300]="isFieldInvalid('category')"
          >
            <option value="">Select a category</option>
            <option *ngFor="let category of categories" [value]="category">
              {{category}}
            </option>
          </select>
        </div>
        <p *ngIf="isFieldInvalid('category')" class="mt-1 text-sm text-red-600">Category is required</p>
      </div>

      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700">Notes (Optional)</label>
        <div class="mt-1">
          <textarea
            id="notes"
            formControlName="notes"
            rows="3"
            class="block w-full rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          [disabled]="!expenseForm.valid"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <svg *ngIf="!expense" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{expense ? 'Update' : 'Add'}} Expense
        </button>
      </div>
    </form>
  `,
  styles: [`
    :host {
      display: block;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type=number] {
      -moz-appearance: textfield;
    }

    .ng-touched.ng-invalid {
      @apply border-red-300;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    form {
      animation: fadeIn 0.5s ease-out;
    }
  `]
})
export class ExpenseFormComponent implements OnInit {
  @Input() expense?: Expense;
  @Output() submitExpense = new EventEmitter<Omit<Expense, 'id'>>();

  expenseForm: FormGroup;
  categories: ExpenseCategory[] = [
    'Food', 'Transportation', 'Housing', 'Utilities',
    'Entertainment', 'Shopping', 'Healthcare', 'Other'
  ];

  constructor(private fb: FormBuilder) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      category: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.expense) {
      this.expenseForm.patchValue({
        ...this.expense,
        date: new Date(this.expense.date).toISOString().split('T')[0]
      });
    } else {
      this.expenseForm.patchValue({
        date: new Date().toISOString().split('T')[0]
      });
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      this.submitExpense.emit({
        ...formValue,
        amount: Number(formValue.amount),
        date: new Date(formValue.date)
      });
      if (!this.expense) {
        this.expenseForm.reset({
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.expenseForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
} 