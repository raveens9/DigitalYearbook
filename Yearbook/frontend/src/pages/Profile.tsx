import { useState } from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { usersApi } from "../api/endpoints";
import type { UserUpdate } from "../types";

export function Profile() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<UserUpdate>({
    full_name: user?.full_name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    faculty: user?.faculty || "",
    interests: user?.interests || "",
    profile_picture_url: user?.profile_picture_url || "",
    socials: user?.socials || {},
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [platform]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await usersApi.updateMe(formData);
      await refreshUser();
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>

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
                <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center">
                  <span className="text-4xl text-indigo-600 font-bold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="ml-auto mt-16">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Faculty/Department
                    </label>
                    <input
                      type="text"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Picture URL
                    </label>
                    <input
                      type="url"
                      name="profile_picture_url"
                      value={formData.profile_picture_url}
                      onChange={handleChange}
                      className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Interests
                  </label>
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="e.g., Photography, Music, Sports"
                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Links
                  </label>
                  <div className="space-y-2">
                    {["twitter", "linkedin", "instagram", "github"].map(
                      (platform) => (
                        <div key={platform} className="flex items-center">
                          <span className="w-24 text-sm text-gray-600 capitalize">
                            {platform}
                          </span>
                          <input
                            type="url"
                            value={formData.socials?.[platform] || ""}
                            onChange={(e) =>
                              handleSocialChange(platform, e.target.value)
                            }
                            placeholder={`https://${platform}.com/...`}
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.full_name}
                  </h1>
                  <p className="text-gray-500">@{user.username}</p>
                </div>

                {user.bio && <p className="text-gray-700">{user.bio}</p>}

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="mr-1">🎓</span>
                    {user.university}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-1">📅</span>
                    Class of {user.graduation_year}
                  </div>
                  {user.faculty && (
                    <div className="flex items-center text-gray-600">
                      <span className="mr-1">🏛️</span>
                      {user.faculty}
                    </div>
                  )}
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
                              className="text-indigo-600 hover:text-indigo-800 capitalize"
                            >
                              {platform}
                            </a>
                          ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
