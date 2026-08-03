import { Routes } from '@angular/router';

import { adminAuthGuard } from './admin/auth/admin-auth.guard';
import { AdminLayout } from './admin/layout/admin-layout/admin-layout.component';
import { AdminArticleCreatePage } from './admin/pages/admin-article-create-page/admin-article-create-page.component';
import { AdminArticleEditPage } from './admin/pages/admin-article-edit-page/admin-article-edit-page.component';
import { AdminArticleListPage } from './admin/pages/admin-article-list-page/admin-article-list-page.component';
import { AdminLoginPage } from './admin/pages/admin-login-page/admin-login-page.component';
import { ArticlePage } from './pages/article-page/article-page.component';
import { HomePage } from './pages/home-page/home-page.component';
import { NotFoundPage } from './pages/not-found-page/not-found-page.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Memento vivere — Videojuegos, cultura y memoria',
    component: HomePage,
  },
  {
    path: 'articulos/:slug',
    title: 'Artículo | Memento vivere',
    component: ArticlePage,
  },
  {
    path: 'admin/login',
    title: 'Acceso | Memento vivere',
    component: AdminLoginPage,
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivateChild: [adminAuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'articulos',
      },
      {
        path: 'articulos/nuevo',
        title: 'Nuevo artículo | Memento vivere',
        component: AdminArticleCreatePage,
      },
      {
        path: 'articulos/:id/editar',
        title: 'Editar artículo | Memento vivere',
        component: AdminArticleEditPage,
      },
      {
        path: 'articulos',
        title: 'Artículos | Administración | Memento vivere',
        component: AdminArticleListPage,
      },
    ],
  },
  {
    path: '**',
    title: 'Página no encontrada | Memento vivere',
    component: NotFoundPage,
  },
];
