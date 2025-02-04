import { routes } from './app.routes';
import { provideZoneChangeDetection, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';



export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)
]
};
