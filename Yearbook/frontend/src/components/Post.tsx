import { useState } from "react";
import { Link } from "react-router-dom";
import type { Post as PostType } from "../types";
import { postsApi, reportsApi } from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";

interface PostProps {
  post: PostType;
  onUpdate?: (post: PostType) => void;
  onDelete?: (postId: number) => void;
  showFullContent?: boolean;
}

export function Post({
  post,
  onUpdate,
  onDelete,
  showFullContent = false,
}: PostProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [currentPost, setCurrentPost] = useState(post);

  const isOwner = user?.id === post.author.id;

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;
    setIsLiking(true);
    try {
      if (currentPost.is_liked) {
        const result = await postsApi.unlike(currentPost.id);
        setCurrentPost({
          ...currentPost,
          is_liked: false,
          likes_count: result.likes_count,
        });
      } else {
        const result = await postsApi.like(currentPost.id);
        setCurrentPost({
          ...currentPost,
          is_liked: true,
          likes_count: result.likes_count,
        });
      }
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = async () => {
    try {
      const updated = await postsApi.update(post.id, { content: editContent });
      setCurrentPost(updated);
      setIsEditing(false);
      onUpdate?.(updated);
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await postsApi.delete(post.id);
      onDelete?.(post.id);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleReport = async () => {
    if (reportReason.length < 10) {
      alert("Please provide a more detailed reason (at least 10 characters)");
      return;
    }
    try {
      await reportsApi.create({ post_id: post.id, reason: reportReason });
      setShowReportModal(false);
      setReportReason("");
      alert("Report submitted successfully");
    } catch (error) {
      console.error("Failed to report post:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      {/* Author info */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/user/${post.author.id}`}
          className="flex items-center space-x-3"
        >
          {post.author.profile_picture_url ? (
            <img
              src={post.author.profile_picture_url}
              alt={post.author.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-medium">
                {post.author.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 hover:text-indigo-600">
              {post.author.full_name}
            </p>
            <p className="text-sm text-gray-500">@{post.author.username}</p>
          </div>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {formatDate(currentPost.created_at)}
          </span>
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`text-gray-800 mb-4 ${showFullContent ? "" : "line-clamp-5"}`}
        >
          {currentPost.content}
        </p>
      )}

      {/* Image */}
      {currentPost.image_url && (
        <img
          src={currentPost.image_url}
          alt="Post image"
          className="w-full rounded-lg mb-4 max-h-96 object-cover"
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated || isLiking}
            className={`flex items-center space-x-1 ${
              currentPost.is_liked
                ? "text-red-500"
                : "text-gray-500 hover:text-red-500"
            } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <span>{currentPost.is_liked ? "❤️" : "🤍"}</span>
            <span>{currentPost.likes_count}</span>
          </button>
          <Link
            to={`/post/${post.id}`}
            className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600"
          >
            <span>💬</span>
            <span>{currentPost.comments_count}</span>
          </Link>
        </div>
        {isAuthenticated && !isOwner && (
          <button
            onClick={() => setShowReportModal(true)}
            className="text-sm text-gray-400 hover:text-red-500"
          >
            Report
          </button>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Report Post</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please describe why you're reporting this post..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
