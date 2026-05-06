import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/profile-form.component').then(m => m.ProfileFormComponent),
  },
  {
    path: 'steps/:stepId',
    canActivate: [authGuard],
    loadComponent: () => import('./steps/step-detail.component').then(m => m.StepDetailComponent),
  },
  {
    path: 'letters/:letterId',
    canActivate: [authGuard],
    loadComponent: () => import('./letters/letter-preview.component').then(m => m.LetterPreviewComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
