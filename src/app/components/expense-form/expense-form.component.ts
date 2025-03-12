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
        <input
          type="text"
          id="description"
          formControlName="description"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Enter expense description"
        />
        @if (expenseForm.get('description')?.invalid && expenseForm.get('description')?.touched) {
          <p class="mt-1 text-sm text-red-600">Description is required</p>
        }
      </div>

      <div>
        <label for="amount" class="block text-sm font-medium text-gray-700">Amount (£)</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">£</span>
          </div>
          <input
            type="number"
            id="amount"
            formControlName="amount"
            class="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="0.00"
            step="0.01"
          />
        </div>
        @if (expenseForm.get('amount')?.invalid && expenseForm.get('amount')?.touched) {
          <p class="mt-1 text-sm text-red-600">Amount is required and must be a valid number</p>
        }
      </div>

      <div>
        <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          formControlName="category"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">Select a category</option>
          <option value="Income">Income</option>
          <option value="Food">Food</option>
          <option value="Transportation">Transportation</option>
          <option value="Housing">Housing</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Shopping">Shopping</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Other">Other</option>
        </select>
        @if (expenseForm.get('category')?.invalid && expenseForm.get('category')?.touched) {
          <p class="mt-1 text-sm text-red-600">Category is required</p>
        }
      </div>

      <div>
        <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          id="date"
          formControlName="date"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        @if (expenseForm.get('date')?.invalid && expenseForm.get('date')?.touched) {
          <p class="mt-1 text-sm text-red-600">Date is required</p>
        }
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          [disabled]="expenseForm.invalid || isSubmitting"
          class="flex items-center gap-2 px-6 py-2.5 text-white bg-primary-600 rounded-lg transition-all duration-200 transform hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          @if (isSubmitting) {
            <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          }
          @if (!isSubmitting) {
            <svg class="w-5 h-5 transition-transform duration-200 ease-out group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="expense ? 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'"/>
            </svg>
          }
          <span class="font-medium">{{ expense ? 'Update' : 'Add' }} Expense</span>
        </button>
      </div>
    </form>
  `,
  styles: [`
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }

    .ripple {
      position: absolute;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.4);
      transform: scale(0);
      animation: ripple 0.6s linear;
    }
  `]
})
export class ExpenseFormComponent implements OnInit {
  @Input() expense?: Expense;
  @Output() submitExpense = new EventEmitter<Omit<Expense, 'id'>>();

  expenseForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.expense) {
      // Format the date for HTML5 date input (YYYY-MM-DD)
      const date = new Date(this.expense.date);
      const formattedDate = date.toISOString().split('T')[0];
      
      this.expenseForm.patchValue({
        description: this.expense.description,
        amount: this.expense.amount,
        category: this.expense.category,
        date: formattedDate
      });
    } else {
      // Set today's date as default
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      this.expenseForm.patchValue({ date: formattedDate });
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      this.isSubmitting = true;
      
      // Simulate loading state for better UX
      setTimeout(() => {
        this.submitExpense.emit(this.expenseForm.value);
        if (!this.expense) {
          this.expenseForm.reset({
            date: this.expenseForm.get('date')?.value // Keep the date
          });
        }
        this.isSubmitting = false;
      }, 600);
    }
  }
} 