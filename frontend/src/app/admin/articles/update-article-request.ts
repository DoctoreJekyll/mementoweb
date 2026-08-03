export interface UpdateArticleRequest {
  title: string;
  pretitle: string | null;
  excerpt: string | null;
  body: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
}