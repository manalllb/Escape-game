import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/welcome-page/welcome-page').then((m) => m.WelcomePage)
  },
  {
    path: 'admin-login',
    loadComponent: () =>
      import('./components/admin-login/admin-login').then((m) => m.AdminLogin)
  },
  {
    path: 'admin-dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard)
  },
  {
    path: 'join',
    loadComponent: () =>
      import('./components/join-session/join-session').then((m) => m.JoinSession)
  },
  {
    path: 'intro',
    loadComponent: () =>
      import('./components/game-intro/game-intro').then((m) => m.GameIntro)
  },
  {
    path: 'game',
    loadComponent: () =>
      import('./components/game-flow/game-flow').then((m) => m.GameFlow)
  },
  {
    path: 'victory',
    loadComponent: () =>
      import('./components/victory-page/victory-page').then((m) => m.VictoryPage)
  },
  {
    path: 'defeat',
    loadComponent: () =>
      import('./components/defeat-page/defeat-page').then((m) => m.DefeatPage)
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
