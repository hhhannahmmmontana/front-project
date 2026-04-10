import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../environments/environment';
import { InMemoryCache } from '@apollo/client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      
      return {
        link: httpLink.create({
          uri: environment.apiDomain + '/graphql'
        }),
        cache: new InMemoryCache()
      };
    })
  ]
};
