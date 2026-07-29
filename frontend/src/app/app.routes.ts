import { Routes } from '@angular/router';

import { ArticlePage } from './pages/article-page/article-page.component';
import { HomePage } from './pages/home-page/home-page.component';
import { NotFoundPage } from './pages/not-found-page/not-found-page.component';

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
    path: '**',
    component: NotFoundPage
  }
];