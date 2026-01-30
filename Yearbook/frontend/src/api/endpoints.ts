import { apiClient } from "./client";
import type {
  User,
  UserPublic,
  UserUpdate,
  UserSearchResult,
  Post,
  PostCreate,
  PostUpdate,
  PostListResponse,
  LikeResponse,
  Comment,
  CommentCreate,
  CommentListResponse,
  SearchResponse,
  ReportCreate,
  Report,
} from "../types";

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) => apiClient.login(email, password),
  register: (
    email: string,
    password: string,
    fullName: string,
    university: string,
    graduationYear: number,
    yearbookQuote?: string,
  ) =>
    apiClient.register(email, password, fullName, university, graduationYear, yearbookQuote),
  logout: () => apiClient.logout(),
  getMe: () => apiClient.request<User>("/api/v1/auth/me"),
};

// User endpoints
export const usersApi = {
  getMe: () => apiClient.request<User>("/api/v1/users/me"),
  updateMe: (data: UserUpdate) =>
    apiClient.request<User>("/api/v1/users/me", { method: "PUT", body: data }),
  getById: (id: number) =>
    apiClient.request<UserPublic>(`/api/v1/users/${id}`, {
      requireAuth: false,
    }),
  getByUsername: (username: string) =>
    apiClient.request<UserPublic>(`/api/v1/users/username/${username}`, {
      requireAuth: false,
    }),
  search: (params: {
    q?: string;
    department?: string;
    graduation_year?: number;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append("q", params.q);
    if (params.department) searchParams.append("department", params.department);
    if (params.graduation_year)
      searchParams.append("graduation_year", params.graduation_year.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    return apiClient.request<SearchResponse<UserSearchResult>>(
      `/api/v1/users/search?${searchParams}`,
    );
  },
};

// Post endpoints
export const postsApi = {
  getFeed: (limit = 20, offset = 0) =>
    apiClient.request<PostListResponse>(
      `/api/v1/posts?limit=${limit}&offset=${offset}`,
      { requireAuth: false },
    ),
  getRecent: (limit = 10) =>
    apiClient.request<PostListResponse>(`/api/v1/posts/recent?limit=${limit}`, {
      requireAuth: false,
    }),
  getById: (id: number) =>
    apiClient.request<Post>(`/api/v1/posts/${id}`, { requireAuth: false }),
  getUserPosts: (userId: number, limit = 20, offset = 0) =>
    apiClient.request<PostListResponse>(
      `/api/v1/posts/user/${userId}?limit=${limit}&offset=${offset}`,
      { requireAuth: false },
    ),
  create: (data: PostCreate) =>
    apiClient.request<Post>("/api/v1/posts", { method: "POST", body: data }),
  update: (id: number, data: PostUpdate) =>
    apiClient.request<Post>(`/api/v1/posts/${id}`, {
      method: "PUT",
      body: data,
    }),
  delete: (id: number) =>
    apiClient.request<void>(`/api/v1/posts/${id}`, { method: "DELETE" }),
  like: (id: number) =>
    apiClient.request<LikeResponse>(`/api/v1/posts/${id}/like`, {
      method: "POST",
    }),
  unlike: (id: number) =>
    apiClient.request<LikeResponse>(`/api/v1/posts/${id}/like`, {
      method: "DELETE",
    }),
};

// Comment endpoints
export const commentsApi = {
  getByPost: (postId: number, limit = 20, offset = 0) =>
    apiClient.request<CommentListResponse>(
      `/api/v1/posts/${postId}/comments?limit=${limit}&offset=${offset}`,
      { requireAuth: false },
    ),
  create: (postId: number, data: CommentCreate) =>
    apiClient.request<Comment>(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      body: data,
    }),
  update: (postId: number, commentId: number, data: CommentCreate) =>
    apiClient.request<Comment>(
      `/api/v1/posts/${postId}/comments/${commentId}`,
      { method: "PUT", body: data },
    ),
  delete: (postId: number, commentId: number) =>
    apiClient.request<void>(`/api/v1/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }),
};

// Search endpoints
export const searchApi = {
  students: (params: {
    q?: string;
    department?: string;
    graduation_year?: number;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append("q", params.q);
    if (params.department) searchParams.append("department", params.department);
    if (params.graduation_year)
      searchParams.append("graduation_year", params.graduation_year.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    return apiClient.request<SearchResponse<UserSearchResult>>(
      `/api/v1/search/students?${searchParams}`,
    );
  },
};

// Report endpoints
export const reportsApi = {
  create: (data: ReportCreate) =>
    apiClient.request<Report>("/api/v1/reports", {
      method: "POST",
      body: data,
    }),
};

// Upload endpoints
export const uploadApi = {
  uploadImage: async (
    file: File,
    imageType: "profile_picture" | "post_image" | "post_attachment",
    postId?: number,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("image_type", imageType);
    if (postId) formData.append("post_id", postId.toString());

    const token = localStorage.getItem("access_token");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const response = await fetch(
      `${API_URL}/api/v1/image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Upload failed");
    }

    return response.json();
  },
  deleteImage: (imageId: number) =>
    apiClient.request(`/api/v1/image/${imageId}`, { method: "DELETE" }),
};
