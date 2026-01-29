import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { searchApi } from "../api/endpoints";
import type { UserSearchResult } from "../types";

export function Search() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const handleSearch = async (e?: React.FormEvent, reset = true) => {
    e?.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    const currentOffset = reset ? 0 : offset;

    try {
      const response = await searchApi.students({
        q: query || undefined,
        department: department || undefined,
        graduation_year: graduationYear ? parseInt(graduationYear) : undefined,
        limit,
        offset: currentOffset,
      });

      setResults((prev) =>
        reset ? response.items : [...prev, ...response.items],
      );
      setTotal(response.total);
      if (!reset) setOffset(currentOffset + limit);
      else setOffset(limit);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    handleSearch(undefined, false);
  };

  const hasMore = results.length < total;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Search Students
        </h1>

        {/* Search Form */}
        <form
          onSubmit={(e) => handleSearch(e, true)}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Computer Science"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graduation Year
              </label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g., 2025"
                min="1900"
                max="2100"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Results */}
        {hasSearched && (
          <div>
            <p className="text-gray-600 mb-4">
              {total} student{total !== 1 ? "s" : ""} found
            </p>

            {results.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">
                  No students found matching your criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((user) => (
                    <Link
                      key={user.id}
                      to={`/user/${user.id}`}
                      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow flex items-center space-x-4"
                    >
                      {user.profile_picture_url ? (
                        <img
                          src={user.profile_picture_url}
                          alt={user.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-2xl text-indigo-600 font-bold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {user.full_name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          @{user.username}
                        </p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <span className="truncate">{user.university}</span>
                          <span className="mx-2">•</span>
                          <span>Class of {user.graduation_year}</span>
                        </div>
                        {user.faculty && (
                          <p className="text-sm text-gray-500 truncate">
                            {user.faculty}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center py-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {isLoading ? "Loading..." : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
