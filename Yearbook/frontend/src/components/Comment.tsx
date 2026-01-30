import { useState } from "react";
import { Link } from "react-router-dom";
import type { Comment as CommentType } from "../types";
import { commentsApi, reportsApi } from "../api/endpoints";
import { useAuth } from "../contexts/AuthContext";

interface CommentProps {
  comment: CommentType;
  onDelete?: (commentId: number) => void;
}

export function Comment({ comment, onDelete }: CommentProps) {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [currentComment, setCurrentComment] = useState(comment);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const isOwner = user?.id === comment.author.id;

  const handleEdit = async () => {
    try {
      const updated = await commentsApi.update(comment.post_id, comment.id, {
        content: editContent,
      });
      setCurrentComment(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await commentsApi.delete(comment.post_id, comment.id);
      onDelete?.(comment.id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleReport = async () => {
    if (reportReason.length < 10) {
      alert("Please provide a more detailed reason (at least 10 characters)");
      return;
    }
    try {
      await reportsApi.create({ comment_id: comment.id, reason: reportReason });
      setShowReportModal(false);
      setReportReason("");
      alert("Report submitted successfully");
    } catch (error) {
      console.error("Failed to report comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex space-x-3 py-3 border-b last:border-b-0">
      <Link to={`/user/${comment.author.id}`}>
        {comment.author.profile_picture_url ? (
          <img
            src={comment.author.profile_picture_url}
            alt={comment.author.full_name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 text-sm font-medium">
              {comment.author.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              to={`/user/${comment.author.id}`}
              className="font-medium text-gray-900 hover:text-orange-600 text-sm"
            >
              {comment.author.full_name}
            </Link>
            <span className="text-xs text-gray-500">
              {formatDate(currentComment.created_at)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✏️
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 text-xs"
                >
                  🗑️
                </button>
              </>
            )}
            {isAuthenticated && !isOwner && (
              <button
                onClick={() => setShowReportModal(true)}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Report
              </button>
            )}
          </div>
        </div>
        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={2}
            />
            <div className="flex justify-end space-x-2 mt-1">
              <button
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 text-sm mt-1">{currentComment.content}</p>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Report Comment</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please describe why you're reporting this comment..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
