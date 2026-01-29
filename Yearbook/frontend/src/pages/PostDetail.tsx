import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Post } from "../components/Post";
import { Comment } from "../components/Comment";
import { postsApi, commentsApi } from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";
import type { Post as PostType, Comment as CommentType } from "../types";

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsOffset, setCommentsOffset] = useState(0);
  const commentsLimit = 20;

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!postId) return;

      try {
        const postData = await postsApi.getById(parseInt(postId));
        setPost(postData);

        const commentsData = await commentsApi.getByPost(
          parseInt(postId),
          commentsLimit,
          0,
        );
        setComments(commentsData.items);
        setCommentsTotal(commentsData.total);
        setCommentsOffset(commentsLimit);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [postId]);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId || !newComment.trim()) return;

    setIsCreatingComment(true);
    try {
      const comment = await commentsApi.create(parseInt(postId), {
        content: newComment,
      });
      setComments((prev) => [...prev, comment]);
      setNewComment("");
      setCommentsTotal((prev) => prev + 1);
      if (post) {
        setPost({ ...post, comments_count: post.comments_count + 1 });
      }
    } catch (err) {
      console.error("Failed to create comment:", err);
    } finally {
      setIsCreatingComment(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentsTotal((prev) => prev - 1);
    if (post) {
      setPost({ ...post, comments_count: post.comments_count - 1 });
    }
  };

  const loadMoreComments = async () => {
    if (!postId) return;
    try {
      const response = await commentsApi.getByPost(
        parseInt(postId),
        commentsLimit,
        commentsOffset,
      );
      setComments((prev) => [...prev, ...response.items]);
      setCommentsOffset((prev) => prev + commentsLimit);
    } catch (err) {
      console.error("Failed to load more comments:", err);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The post you are looking for does not exist."}
          </p>
          <Link to="/" className="text-indigo-600 hover:text-indigo-800">
            ← Back to Feed
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
        >
          ← Back to Feed
        </Link>

        <Post post={post} showFullContent />

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow mt-4">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              Comments ({commentsTotal})
            </h2>
          </div>

          {/* Add Comment Form */}
          {isAuthenticated && (
            <form onSubmit={handleCreateComment} className="p-4 border-b">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isCreatingComment || !newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isCreatingComment ? "Posting..." : "Comment"}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="p-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <>
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    onDelete={handleDeleteComment}
                  />
                ))}

                {comments.length < commentsTotal && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={loadMoreComments}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Load more comments
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
