import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Post } from "../components/Post";
import { usersApi, postsApi } from "../api/endpoints";
import type { UserPublic, Post as PostType } from "../types";
import buildingImage from "../assets/FOE-Mattegoda-1.jpg";

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [postsTotal, setPostsTotal] = useState(0);
  const [postsOffset, setPostsOffset] = useState(0);
  const postsLimit = 10;

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;

      try {
        const userData = await usersApi.getById(parseInt(userId));
        setUser(userData);

        const postsData = await postsApi.getUserPosts(
          parseInt(userId),
          postsLimit,
          0,
        );
        setPosts(postsData.items);
        setPostsTotal(postsData.total);
        setPostsOffset(postsLimit);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  const loadMorePosts = async () => {
    if (!userId) return;
    try {
      const response = await postsApi.getUserPosts(
        parseInt(userId),
        postsLimit,
        postsOffset,
      );
      setPosts((prev) => [...prev, ...response.items]);
      setPostsOffset((prev) => prev + postsLimit);
    } catch (err) {
      console.error("Failed to load more posts:", err);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url('${buildingImage}')`,
          }}
        />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url('${buildingImage}')`,
          }}
        />
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            User Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The user you are looking for does not exist."}
          </p>
          <Link to="/" className="text-orange-600 hover:text-orange-800">
            ← Back to Feed
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('${buildingImage}')`,
        }}
      />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/95 rounded-lg shadow overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-32"></div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={user.full_name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-orange-100 flex items-center justify-center">
                  <span className="text-4xl text-orange-600 font-bold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.full_name}
                </h1>
                <p className="text-gray-500">@{user.username}</p>
              </div>

              {user.bio && <p className="text-gray-700">{user.bio}</p>}

              {user.yearbook_quote && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <p className="text-gray-700 italic text-lg">
                    "{user.yearbook_quote}"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Yearbook Quote</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="mr-1">🎓</span>
                  {user.department}
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-1">📅</span>
                  {user.batch}
                  {user.batch === 1
                    ? "st"
                    : user.batch === 2
                      ? "nd"
                      : user.batch === 3
                        ? "rd"
                        : "th"}{" "}
                  Batch
                </div>
              </div>

              {user.interests && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Interests
                  </h3>
                  <p className="text-gray-600">{user.interests}</p>
                </div>
              )}

              {user.socials && Object.keys(user.socials).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Social Links
                  </h3>
                  <div className="flex space-x-4">
                    {Object.entries(user.socials).map(
                      ([platform, url]) =>
                        url && (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-800 capitalize"
                          >
                            {platform}
                          </a>
                        ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Posts ({postsTotal})
          </h2>

          {posts.length === 0 ? (
            <div className="bg-white/95 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No posts yet.</p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <Post key={post.id} post={post} />
              ))}

              {posts.length < postsTotal && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={loadMorePosts}
                    className="px-4 py-2 text-orange-600 hover:text-orange-800 font-medium"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
