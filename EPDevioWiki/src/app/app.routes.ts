import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
      {
        path: 'wiki/:projectId/:categoryId/:pageId',
        loadComponent: () => import('./pages/wiki-page/wiki-page.component').then((m) => m.WikiPageComponent),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  { path: '**', redirectTo: '' },
];
