import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page.component';
import { ArticlePage } from './pages/article-page/article-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'articulos/:slug',
    component: ArticlePage
  }
];