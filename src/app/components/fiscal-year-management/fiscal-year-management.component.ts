import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiscalYearService } from '../../services/fiscal-year.service';
import { FiscalYear } from '../../models/fiscal-year.model';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-fiscal-year-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="flex h-full">
      <!-- Sidebar -->
      <div class="w-64 bg-white border-r border-gray-200 p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Fiscal Years</h2>
          <button
            (click)="showNewFiscalYearDialog = true"
            class="p-2 text-primary-600 hover:text-primary-700 rounded-full hover:bg-gray-100"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        <div class="space-y-2">
          @for (fiscalYear of fiscalYears$ | async; track fiscalYear.id) {
            <button
              (click)="selectFiscalYear(fiscalYear)"
              class="w-full text-left px-4 py-2 rounded-lg transition-colors duration-200"
              [class.bg-primary-50]="selectedFiscalYear?.id === fiscalYear.id"
              [class.text-primary-700]="selectedFiscalYear?.id === fiscalYear.id"
              [class.hover:bg-gray-50]="selectedFiscalYear?.id !== fiscalYear.id"
            >
              <div class="font-medium">{{ fiscalYear.name }}</div>
              <div class="text-sm text-gray-500">
                {{ fiscalYear.startDate | date:'MMM d, y' }} - {{ fiscalYear.endDate | date:'MMM d, y' }}
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-6">
        @if (selectedFiscalYear) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">{{ selectedFiscalYear.name }}</h2>
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 rounded-full text-sm"
                      [class.bg-green-100]="selectedFiscalYear.isActive"
                      [class.text-green-700]="selectedFiscalYear.isActive"
                      [class.bg-gray-100]="!selectedFiscalYear.isActive"
                      [class.text-gray-700]="!selectedFiscalYear.isActive">
                  {{ selectedFiscalYear.isActive ? 'Active' : 'Inactive' }}
                </span>
                <button
                  (click)="editFiscalYear(selectedFiscalYear)"
                  class="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6 mb-6">
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-500">Start Date</h3>
                <p class="mt-1 text-lg font-semibold text-gray-900">
                  {{ selectedFiscalYear.startDate | date:'MMMM d, y' }}
                </p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-500">End Date</h3>
                <p class="mt-1 text-lg font-semibold text-gray-900">
                  {{ selectedFiscalYear.endDate | date:'MMMM d, y' }}
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">Actions</h3>
              <div class="flex gap-4">
                @if (!selectedFiscalYear.isActive) {
                  <button
                    (click)="activateFiscalYear(selectedFiscalYear)"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    Set as Active
                  </button>
                }
                <button
                  (click)="deleteFiscalYear(selectedFiscalYear)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        } @else {
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No fiscal year selected</h3>
            <p class="mt-1 text-sm text-gray-500">Select a fiscal year from the sidebar to view its details.</p>
          </div>
        }
      </div>
    </div>

    <!-- New Fiscal Year Dialog -->
    @if (showNewFiscalYearDialog) {
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ editingFiscalYear ? 'Edit' : 'New' }} Fiscal Year
            </h3>
            <button
              (click)="closeFiscalYearDialog()"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                [(ngModel)]="fiscalYearName"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., FY 2024"
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
                (click)="saveFiscalYear()"
                [disabled]="!canSaveFiscalYear"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ editingFiscalYear ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class FiscalYearManagementComponent implements OnInit {
  fiscalYears$: Observable<FiscalYear[]>;
  selectedFiscalYear: FiscalYear | null = null;
  showNewFiscalYearDialog = false;
  editingFiscalYear: FiscalYear | null = null;
  fiscalYearName = '';
  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

  constructor(private fiscalYearService: FiscalYearService) {
    this.fiscalYears$ = this.fiscalYearService.getFiscalYears();
  }

  ngOnInit(): void {}

  get canSaveFiscalYear(): boolean {
    return (
      !!this.fiscalYearName &&
      !!this.startDate &&
      !!this.endDate &&
      new Date(this.endDate) > new Date(this.startDate)
    );
  }

  selectFiscalYear(fiscalYear: FiscalYear): void {
    this.selectedFiscalYear = fiscalYear;
  }

  editFiscalYear(fiscalYear: FiscalYear): void {
    this.editingFiscalYear = fiscalYear;
    this.fiscalYearName = fiscalYear.name;
    this.startDate = fiscalYear.startDate.toISOString().split('T')[0];
    this.endDate = fiscalYear.endDate.toISOString().split('T')[0];
    this.showNewFiscalYearDialog = true;
  }

  saveFiscalYear(): void {
    if (!this.canSaveFiscalYear) return;

    const fiscalYearData = {
      name: this.fiscalYearName,
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate),
      isActive: this.editingFiscalYear?.isActive || false
    };

    if (this.editingFiscalYear) {
      this.fiscalYearService.updateFiscalYear(this.editingFiscalYear.id, fiscalYearData);
    } else {
      this.fiscalYearService.createFiscalYear(fiscalYearData);
    }

    this.closeFiscalYearDialog();
  }

  closeFiscalYearDialog(): void {
    this.showNewFiscalYearDialog = false;
    this.editingFiscalYear = null;
    this.fiscalYearName = '';
    this.startDate = new Date().toISOString().split('T')[0];
    this.endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  }

  activateFiscalYear(fiscalYear: FiscalYear): void {
    if (confirm('Are you sure you want to set this fiscal year as active? This will deactivate the current active fiscal year.')) {
      this.fiscalYearService.setActiveFiscalYear(fiscalYear.id);
    }
  }

  deleteFiscalYear(fiscalYear: FiscalYear): void {
    if (confirm('Are you sure you want to delete this fiscal year? This action cannot be undone and will also delete all associated budgets.')) {
      this.fiscalYearService.deleteFiscalYear(fiscalYear.id);
      if (this.selectedFiscalYear?.id === fiscalYear.id) {
        this.selectedFiscalYear = null;
      }
    }
  }
} 