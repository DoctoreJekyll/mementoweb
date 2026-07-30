import { Routes } from '@angular/router';

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
    component: HomePage,
  },
  {
    path: 'articulos/:slug',
    component: ArticlePage,
  },
  {
    path: 'admin/login',
    component: AdminLoginPage,
  },
  {
    path: 'admin/articulos/nuevo',
    component: AdminArticleCreatePage,
  },
  {
    path: 'admin/articulos/:id/editar',
    component: AdminArticleEditPage,
  },
  {
    path: 'admin/articulos',
    component: AdminArticleListPage,
  },
  {
    path: '**',
    component: NotFoundPage,
  },
];
