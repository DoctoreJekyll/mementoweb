import { Routes } from '@angular/router';

import { ArticlePage } from './pages/article-page/article-page.component';
import { HomePage } from './pages/home-page/home-page.component';
import { NotFoundPage } from './pages/not-found-page/not-found-page.component';
import { AdminArticleListPage } from './admin/pages/admin-article-list-page/admin-article-list-page.component';
import { AdminArticleCreatePage } from './admin/pages/admin-article-create-page/admin-article-create-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'articulos/:slug',
    component: ArticlePage
  },
  {
  path: 'admin/articulos/nuevo',
  component: AdminArticleCreatePage
  },
  {
    path: 'admin/articulos',
    component: AdminArticleListPage
  },
  {
    path: '**',
    component: NotFoundPage
  }
];