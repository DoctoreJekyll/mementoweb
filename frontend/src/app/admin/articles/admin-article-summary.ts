import { ArticleStatus } from './article-status';

export interface AdminArticleSummary {
  id: number;
  title: string;
  pretitle: string | null;
  status: ArticleStatus;
  canBePublished: boolean;
  slug: string | null;
  publishedAt: string | null;
}