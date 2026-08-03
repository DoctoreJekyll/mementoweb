export interface ArticleSummary {
  slug: string;
  title: string;
  pretitle: string | null;
  excerpt: string;

  coverImageUrl: string | null;
  coverImageAlt: string | null;

  publishedAt: string;
}