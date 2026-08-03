import { ArticleStatus } from './article-status';

export interface AdminArticleDetail {
  id: number;
  title: string;
  pretitle: string | null;
  excerpt: string | null;
  body: string | null;
  status: ArticleStatus;
  canBePublished: boolean;
  slug: string | null;
  publishedAt: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
}