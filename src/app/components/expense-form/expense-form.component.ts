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

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Receipt
          @if (!expense) {
            <span class="text-red-500">*</span>
          }
        </label>
        <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-500 transition-colors duration-200"
             [class.border-red-500]="showReceiptError && !hasReceipt"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)">
          <div class="space-y-1 text-center">
            @if (!previewUrl) {
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label
                  for="receipt"
                  class="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="receipt"
                    #fileInput
                    type="file"
                    class="sr-only"
                    accept="image/*,.pdf"
                    (change)="onFileSelected($event)"
                  />
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            } @else {
              <div class="relative">
                @if (previewUrl.endsWith('.pdf')) {
                  <div class="flex items-center justify-center">
                    <svg class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                } @else {
                  <img [src]="previewUrl" alt="Receipt preview" class="max-h-48 rounded-lg object-contain"/>
                }
                <button
                  type="button"
                  (click)="removeFile()"
                  class="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p class="text-sm text-gray-500 mt-2">{{selectedFile?.name}}</p>
            }
          </div>
        </div>
        @if (showReceiptError && !hasReceipt) {
          <p class="mt-1 text-sm text-red-600">Receipt is required</p>
        }
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          [disabled]="expenseForm.invalid || isSubmitting || (!hasReceipt && !expense)"
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

    :host {
      display: block;
    }
  `]
})
export class ExpenseFormComponent implements OnInit {
  @Input() set expense(value: Expense | undefined) {
    if (value) {
      const date = new Date(value.date);
      const formattedDate = date.toISOString().split('T')[0];
      
      this.expenseForm.patchValue({
        description: value.description,
        amount: value.amount,
        category: value.category,
        date: formattedDate
      });

      // If editing and there's an existing receipt
      if (value.receipt) {
        this.previewUrl = value.receipt.fileUrl;
        this.hasReceipt = true;
      } else {
        this.previewUrl = null;
        this.hasReceipt = false;
      }
    } else {
      // Reset form for new expense
      this.expenseForm.reset({
        date: new Date().toISOString().split('T')[0]
      });
      this.previewUrl = null;
      this.hasReceipt = false;
    }
  }

  @Output() submitExpense = new EventEmitter<Omit<Expense, 'id'>>();

  expenseForm: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  showReceiptError = false;
  hasReceipt = false;

  constructor(private fb: FormBuilder) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Set today's date as default for new expenses
    if (!this.expense) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      this.expenseForm.patchValue({ date: formattedDate });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10MB.');
      return;
    }

    // Check file type
    if (!file.type.match(/^image\/(jpeg|png|gif)$/) && file.type !== 'application/pdf') {
      alert('Invalid file type. Please upload an image (JPG, PNG, GIF) or PDF.');
      return;
    }

    this.selectedFile = file;
    this.hasReceipt = true;
    this.showReceiptError = false;

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, show a PDF icon instead
      this.previewUrl = 'pdf';
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.hasReceipt = false;
  }

  onSubmit(): void {
    this.showReceiptError = !this.hasReceipt && !this.expense;
    
    if (this.expenseForm.valid && (this.hasReceipt || this.expense)) {
      this.isSubmitting = true;

      // Create a new expense object with the form values and receipt info
      const formData = this.expenseForm.value;
      const expenseData = {
        ...formData,
        amount: Number(formData.amount),
        date: new Date(formData.date),
        receipt: this.selectedFile ? {
          fileName: this.selectedFile.name,
          fileUrl: this.previewUrl || '',
          uploadDate: new Date()
        } : this.expense?.receipt || null
      };

      console.log('Submitting expense data:', expenseData); // Debug log

      // Simulate loading state for better UX
      setTimeout(() => {
        this.submitExpense.emit(expenseData);
        
        // Reset form and state
        this.expenseForm.reset({
          date: this.expenseForm.get('date')?.value
        });
        this.removeFile();
        
        // Reset preview URL if we're editing
        if (this.expense?.receipt) {
          this.previewUrl = this.expense.receipt.fileUrl;
          this.hasReceipt = true;
        }
        
        this.isSubmitting = false;
      }, 600);
    }
  }
} 