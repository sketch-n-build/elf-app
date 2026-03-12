export interface BlogAuthor {
  id:    string;
  name:  string;
  email: string;
  image?: string | null;
}

export interface BlogPost {
  id:          string;
  title:       string;
  slug:        string;
  excerpt:     string | null;
  content:     string;
  coverImage:  string | null;
  isPublished: boolean;
  authorId:    string;
  author:      BlogAuthor;
  publishedAt: Date | string | null;
  createdAt:   Date | string;
  updatedAt:   Date | string;
}

export type BlogPostCard = Pick<
  BlogPost,
  "id" | "title" | "slug" | "excerpt" | "coverImage" | "publishedAt" | "author"
>;