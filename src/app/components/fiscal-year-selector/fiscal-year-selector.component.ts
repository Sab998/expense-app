import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiscalYearService } from '../../services/fiscal-year.service';
import { FiscalYear } from '../../models/fiscal-year.model';
import { FiscalYearDialogComponent } from '../fiscal-year-dialog/fiscal-year-dialog.component';

@Component({
  selector: 'app-fiscal-year-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, FiscalYearDialogComponent],
  template: `
    <div class="flex items-center space-x-4">
      <select
        [ngModel]="selectedFiscalYearId"
        (ngModelChange)="onFiscalYearChange($event)"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
      >
        <option [value]="null" disabled>Select Fiscal Year</option>
        @for (year of fiscalYears; track year.id) {
          <option [value]="year.id">
            {{ year.name }}
          </option>
        }
      </select>
      <button
        (click)="showNewFiscalYearDialog = true"
        class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
      >
        New Fiscal Year
      </button>
    </div>

    @if (showNewFiscalYearDialog) {
      <app-fiscal-year-dialog
        (close)="showNewFiscalYearDialog = false"
        (submit)="onCreateFiscalYear($event)"
      ></app-fiscal-year-dialog>
    }
  `,
})
export class FiscalYearSelectorComponent implements OnInit {
  fiscalYears: FiscalYear[] = [];
  selectedFiscalYearId: string | null = null;
  showNewFiscalYearDialog = false;

  constructor(private fiscalYearService: FiscalYearService) {}

  ngOnInit(): void {
    this.fiscalYearService.getFiscalYears().subscribe(years => {
      this.fiscalYears = years;
      const activeYear = years.find(y => y.isActive);
      if (activeYear) {
        this.selectedFiscalYearId = activeYear.id;
      }
    });
  }

  onFiscalYearChange(fiscalYearId: string): void {
    this.fiscalYearService.setActiveFiscalYear(fiscalYearId);
  }

  onCreateFiscalYear(fiscalYear: Omit<FiscalYear, 'id' | 'isActive'>): void {
    this.fiscalYearService.createFiscalYear({
      ...fiscalYear,
      isActive: this.fiscalYears.length === 0
    });
  }
} 