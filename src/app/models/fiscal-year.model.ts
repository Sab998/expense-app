import { Budget } from './budget.model';

export interface FiscalYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface FiscalYearBudget extends Budget {
  fiscalYearId: string;
} 