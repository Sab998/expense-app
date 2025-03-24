import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ExpenseService } from './services/expense.service';
import { registerLocaleData } from '@angular/common';
import localeGb from '@angular/common/locales/en-GB';

registerLocaleData(localeGb);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    ExpenseService
  ]
};
