import { Component } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BudgetComponent } from './components/budget/budget.component';
import { FiscalYearSelectorComponent } from './components/fiscal-year-selector/fiscal-year-selector.component';
import localeGb from '@angular/common/locales/en-GB';
import { NavigationComponent } from './components/navigation/navigation.component';

// Register the locale data for British Pound
registerLocaleData(localeGb, 'en-GB');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DashboardComponent,
    BudgetComponent,
    FiscalYearSelectorComponent,
    NavigationComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navigation></app-navigation>
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {}
