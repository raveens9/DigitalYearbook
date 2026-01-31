import { useState, useEffect, useCallback } from "react";
import { Layout } from "../components/Layout";
import { Post } from "../components/Post";
import { postsApi, uploadApi } from "../api/endpoints";
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    setIsCreating(true);
    setError("");
    try {
      let imageUrl = newPost.image_url;

      // Upload image if one is selected
      if (selectedImage) {
        const uploadResult = await uploadApi.uploadImage(
          selectedImage,
          "post_image",
        );
        imageUrl = uploadResult.url;
      }

      const postData: PostCreate = {
        content: newPost.content,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      };
      const created = await postsApi.create(postData);
      setPosts((prev) => [created, ...prev]);
      setNewPost({ content: "", image_url: "" });
      setSelectedImage(null);
      setImagePreview(null);
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
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('${buildingImage}')`,
        }}
      />
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
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={3}
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <label className="flex items-center gap-2 px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 cursor-pointer">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {selectedImage ? "Change Image" : "Add Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isCreating || !newPost.content.trim()}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-200 disabled:cursor-not-allowed"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
                  className="px-4 py-2 text-orange-600 hover:text-orange-800 font-medium"
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
