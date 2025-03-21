import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiscalYear } from '../../models/fiscal-year.model';

@Component({
  selector: 'app-fiscal-year-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Add New Fiscal Year</h3>
          <button
            (click)="onClose()"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Fiscal Year Name</label>
            <input
              type="text"
              id="name"
              [(ngModel)]="name"
              placeholder="e.g., FY 2024"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              [(ngModel)]="startDate"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="endDate"
              [(ngModel)]="endDate"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div class="flex justify-end">
            <button
              (click)="onSubmit()"
              [disabled]="!isValid"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Fiscal Year
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FiscalYearDialogComponent {
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Omit<FiscalYear, 'id' | 'isActive'>>();

  name = '';
  startDate = new Date().toISOString().split('T')[0];
  endDate = '';

  constructor() {
    // Set default end date to one year from start date minus one day
    const defaultEndDate = new Date(this.startDate);
    defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
    defaultEndDate.setDate(defaultEndDate.getDate() - 1);
    this.endDate = defaultEndDate.toISOString().split('T')[0];
  }

  get isValid(): boolean {
    return (
      this.name.trim() !== '' &&
      this.startDate !== '' &&
      this.endDate !== '' &&
      new Date(this.endDate) > new Date(this.startDate)
    );
  }

  onSubmit(): void {
    if (!this.isValid) return;

    this.submit.emit({
      name: this.name.trim(),
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate)
    });

    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }
} 