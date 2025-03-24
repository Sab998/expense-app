import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BudgetComponent } from './components/budget/budget.component';
import { FiscalYearManagementComponent } from './components/fiscal-year-management/fiscal-year-management.component';
import { ExpenseManagementComponent } from './components/expense-management/expense-management.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'expenses', component: ExpenseManagementComponent },
  { path: 'budget', component: BudgetComponent },
  { path: 'fiscal-years', component: FiscalYearManagementComponent }
];
