import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Expense, ExpenseCategory } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { FiscalYearService } from '../../services/fiscal-year.service';
import { FiscalYear } from '../../models/fiscal-year.model';
import { Subject, Observable, takeUntil } from 'rxjs';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-6">{{ isEditing ? 'Edit Expense' : 'Add New Expense' }}</h2>
      
      <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            id="description"
            formControlName="description"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter expense description"
          >
        </div>

        <!-- Amount -->
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              id="amount"
              formControlName="amount"
              class="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="0.00"
              step="0.01"
              min="0"
            >
          </div>
        </div>

        <!-- Date -->
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="date"
            formControlName="date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            [min]="fiscalYearStartDate"
            [max]="fiscalYearEndDate"
          >
          @if (expenseForm.get('date')?.errors?.['dateRange']) {
            <p class="mt-1 text-sm text-red-600">
              Please select a date within the current fiscal year ({{ fiscalYearStartDate | date:'mediumDate' }} - {{ fiscalYearEndDate | date:'mediumDate' }})
            </p>
          }
        </div>

        <!-- Category -->
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            formControlName="category"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            @for (category of categories$ | async; track category.id) {
              <option [value]="category.name">{{ category.name }}</option>
            }
          </select>
        </div>

        <!-- Receipt Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Receipt</label>
          <div
            class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
            [class.border-primary-500]="isDragging"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
          >
            <div class="space-y-1 text-center">
              @if (selectedFile) {
                <div class="flex items-center justify-center space-x-2">
                  <svg class="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-sm text-gray-600">{{ selectedFile.name }}</span>
                </div>
                <button
                  type="button"
                  (click)="removeFile()"
                  class="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              } @else {
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-gray-600">
                  <label class="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      class="sr-only"
                      (change)="onFileSelected($event)"
                      accept="image/*,.pdf"
                    >
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">
                  PNG, JPG, PDF up to 10MB
                </p>
              }
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            [disabled]="expenseForm.invalid || isSubmitting"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Expense' : 'Add Expense') }}
          </button>
        </div>
      </form>
    </div>
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
export class ExpenseFormComponent implements OnInit, OnDestroy {
  @Input() expense?: Expense;
  @Output() expenseAdded = new EventEmitter<Expense>();
  @Output() expenseUpdated = new EventEmitter<Expense>();
  @Output() formReset = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  expenseForm: FormGroup;
  categories$: Observable<Category[]>;
  isSubmitting = false;
  selectedFile: File | null = null;
  fiscalYearStartDate: string = '';
  fiscalYearEndDate: string = '';
  isDragging = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private fiscalYearService: FiscalYearService
  ) {
    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', [Validators.required]],
      category: ['', Validators.required]
    });

    this.categories$ = this.categoryService.getCategories();
  }

  ngOnInit(): void {
    // Get current fiscal year dates
    this.fiscalYearService.getCurrentFiscalYear().pipe(
      takeUntil(this.destroy$)
    ).subscribe(fiscalYear => {
      if (fiscalYear) {
        this.fiscalYearStartDate = new Date(fiscalYear.startDate).toISOString().split('T')[0];
        this.fiscalYearEndDate = new Date(fiscalYear.endDate).toISOString().split('T')[0];
        
        // Add date range validator
        this.expenseForm.get('date')?.setValidators([
          Validators.required,
          this.dateRangeValidator(fiscalYear)
        ]);
      }
    });

    if (this.expense) {
      this.expenseForm.patchValue({
        description: this.expense.description,
        amount: this.expense.amount,
        date: this.expense.date,
        category: this.expense.category
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dateRangeValidator(fiscalYear: FiscalYear) {
    return (control: any) => {
      const date = new Date(control.value);
      const startDate = new Date(fiscalYear.startDate);
      const endDate = new Date(fiscalYear.endDate);
      
      if (date < startDate || date > endDate) {
        return { dateRange: true };
      }
      return null;
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  async onSubmit(): Promise<void> {
    if (this.expenseForm.valid) {
      this.isSubmitting = true;
      try {
        const formData = this.expenseForm.value;
        let receiptUrl: string | null = null;

        if (this.selectedFile) {
          receiptUrl = await this.expenseService.uploadReceipt(this.selectedFile);
        }

        // Get current fiscal year ID
        const currentFiscalYear = await this.fiscalYearService.getCurrentFiscalYear().toPromise();
        if (!currentFiscalYear) {
          throw new Error('No active fiscal year found. Please select or create a fiscal year first.');
        }

        const expense: Expense = {
          id: this.expense?.id || Date.now().toString(),
          description: formData.description,
          amount: formData.amount,
          date: new Date(formData.date),
          category: formData.category,
          fiscalYearId: currentFiscalYear.id,
          receipt: receiptUrl ? {
            fileName: this.selectedFile?.name || '',
            fileUrl: receiptUrl,
            uploadDate: new Date()
          } : undefined
        };

        if (this.expense) {
          await this.expenseService.updateExpense(expense.id, expense);
          this.expenseUpdated.emit(expense);
        } else {
          await this.expenseService.addExpense(expense);
          this.expenseAdded.emit(expense);
        }

        this.expenseForm.reset();
        this.selectedFile = null;
        this.formReset.emit();
      } catch (error) {
        console.error('Error saving expense:', error);
        // Show error message to user
        alert(error instanceof Error ? error.message : 'An error occurred while saving the expense.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  get isEditing(): boolean {
    return !!this.expense;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (this.isValidFileType(file)) {
        this.selectedFile = file;
      } else {
        alert('Please upload a valid image or PDF file.');
      }
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  private isValidFileType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    return validTypes.includes(file.type);
  }
} 