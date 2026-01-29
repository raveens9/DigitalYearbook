// User types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  university: string;
  graduation_year: number;
  bio?: string;
  faculty?: string;
  interests?: string;
  socials?: Record<string, string>;
  profile_picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  university: string;
  graduation_year: number;
  bio?: string;
  faculty?: string;
  interests?: string;
  socials?: Record<string, string>;
  profile_picture_url?: string;
  created_at: string;
}

export interface UserSearchResult {
  id: number;
  username: string;
  full_name: string;
  university: string;
  graduation_year: number;
  faculty?: string;
  profile_picture_url?: string;
}

export interface UserUpdate {
  full_name?: string;
  username?: string;
  bio?: string;
  faculty?: string;
  interests?: string;
  socials?: Record<string, string>;
  profile_picture_url?: string;
}

// Auth types
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  university: string;
  graduation_year: number;
}

// Post types
export interface PostAuthor {
  id: number;
  username: string;
  full_name: string;
  profile_picture_url?: string;
}

export interface Post {
  id: number;
  content: string;
  image_url?: string;
  author: PostAuthor;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostCreate {
  content: string;
  image_url?: string;
}

export interface PostUpdate {
  content?: string;
  image_url?: string;
}

export interface PostListResponse {
  items: Post[];
  total: number;
  limit: number;
  offset: number;
}

export interface LikeResponse {
  message: string;
  likes_count: number;
}

// Comment types
export interface CommentAuthor {
  id: number;
  username: string;
  full_name: string;
  profile_picture_url?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  content: string;
  author: CommentAuthor;
  created_at: string;
  updated_at: string;
}

export interface CommentCreate {
  content: string;
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
  limit: number;
  offset: number;
}

// Search types
export interface SearchParams {
  q?: string;
  department?: string;
  graduation_year?: number;
  limit?: number;
  offset?: number;
}

export interface SearchResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// Report types
export interface ReportCreate {
  post_id?: number;
  comment_id?: number;
  reason: string;
}

export interface Report {
  id: number;
  reporter_id: number;
  post_id?: number;
  comment_id?: number;
  reason: string;
  status: string;
  created_at: string;
}

// API Error
export interface APIError {
  detail: string;
}
