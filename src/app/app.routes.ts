import { Routes } from '@angular/router';
import { stageAccessGuard } from './core/guards/stage-access.guard';
import { videoAccessGuard } from './core/guards/video-access.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'bienvenida' },
  {
    path: 'bienvenida',
    loadComponent: () => import('./features/welcome/welcome.component').then((m) => m.WelcomeComponent),
    title: 'Nuestra aventura',
  },
  {
    path: 'capitulos',
    loadComponent: () => import('./features/chapters/chapters.component').then((m) => m.ChaptersComponent),
    title: 'Capítulos · Nuestra aventura',
  },
  {
    path: 'etapa/:id',
    canActivate: [stageAccessGuard],
    loadComponent: () => import('./features/stage/stage.component').then((m) => m.StageComponent),
    title: 'Tu siguiente pista · Nuestra aventura',
  },
  {
    path: 'escanear/:id',
    canActivate: [stageAccessGuard],
    loadComponent: () => import('./features/scanner/scanner.component').then((m) => m.ScannerComponent),
    title: 'Escanear señal · Nuestra aventura',
  },
  {
    path: 'recuerdo/:id',
    canActivate: [videoAccessGuard],
    loadComponent: () => import('./features/memory/memory.component').then((m) => m.MemoryComponent),
    title: 'Recuerdo desbloqueado · Nuestra aventura',
  },
  {
    path: 'mochila',
    loadComponent: () => import('./features/backpack/backpack.component').then((m) => m.BackpackComponent),
    title: 'Mi mochila · Nuestra aventura',
  },
  {
    path: 'epilogo',
    loadComponent: () => import('./features/epilogue/epilogue.component').then((m) => m.EpilogueComponent),
    title: 'La última señal · Nuestra aventura',
  },
  {
    path: 'final',
    loadComponent: () => import('./features/final/final.component').then((m) => m.FinalComponent),
    title: 'Nuestro final · Nuestra aventura',
  },
  {
    path: 'admin-secreto',
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
    title: 'Panel secreto',
  },
  { path: '**', redirectTo: 'bienvenida' },
];
