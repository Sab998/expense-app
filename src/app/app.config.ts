import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ExpenseService } from './services/expense.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    ExpenseService
  ]
};
