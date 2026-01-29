import { useState, useEffect, useCallback } from "react";
import { Layout } from "../components/Layout";
import { Post } from "../components/Post";
import { postsApi } from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";
import type { Post as PostType, PostCreate } from "../types";

export function Feed() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [newPost, setNewPost] = useState<PostCreate>({
    content: "",
    image_url: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const { isAuthenticated } = useAuth();

  const loadPosts = useCallback(
    async (reset = false) => {
      try {
        const currentOffset = reset ? 0 : offset;
        const response = await postsApi.getFeed(limit, currentOffset);
        setPosts((prev) =>
          reset ? response.items : [...prev, ...response.items],
        );
        setTotal(response.total);
        if (!reset) setOffset(currentOffset + limit);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    },
    [offset],
  );

  useEffect(() => {
    loadPosts(true);
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    setIsCreating(true);
    try {
      const postData: PostCreate = {
        content: newPost.content,
        ...(newPost.image_url ? { image_url: newPost.image_url } : {}),
      };
      const created = await postsApi.create(postData);
      setPosts((prev) => [created, ...prev]);
      setNewPost({ content: "", image_url: "" });
      setTotal((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePost = (updatedPost: PostType) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
    );
  };

  const handleDeletePost = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setTotal((prev) => prev - 1);
  };

  const hasMore = posts.length < total;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Feed</h1>

        {/* Create Post Form */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handleCreatePost}>
              <textarea
                value={newPost.content}
                onChange={(e) =>
                  setNewPost((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="What's on your mind?"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="mt-3">
                <input
                  type="url"
                  value={newPost.image_url || ""}
                  onChange={(e) =>
                    setNewPost((prev) => ({
                      ...prev,
                      image_url: e.target.value,
                    }))
                  }
                  placeholder="Image URL (optional)"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={isCreating || !newPost.content.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onUpdate={handleUpdatePost}
                onDelete={handleDeletePost}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center py-6">
                <button
                  onClick={() => loadPosts()}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
