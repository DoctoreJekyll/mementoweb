export interface ArticleDetail {
  slug: string;
  title: string;
  pretitle: string | null;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  publishedAt: string;
  recommendedAudioTitle: string | null;
  recommendedAudioAuthor: string | null;
  recommendedAudioUrl: string | null;
}
