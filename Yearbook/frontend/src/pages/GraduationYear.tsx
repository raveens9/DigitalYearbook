import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { usersApi } from "../api/endpoints";
import type { UserSearchResult } from "../types";

export function GraduationYear() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [students, setStudents] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 24; // Display 24 students per load (4x6 grid)

  // Generate year options (from 1980 to current year + 10)
  const yearOptions = Array.from(
    { length: currentYear + 10 - 1980 + 1 },
    (_, i) => currentYear + 10 - i,
  );

  useEffect(() => {
    loadStudents(true);
  }, [selectedYear]);

  const loadStudents = async (reset = false) => {
    setIsLoading(true);
    const currentOffset = reset ? 0 : offset;

    try {
      const response = await usersApi.search({
        graduation_year: selectedYear,
        limit,
        offset: currentOffset,
      });

      setStudents((prev) =>
        reset ? response.items : [...prev, ...response.items],
      );
      setTotal(response.total);
      setOffset(reset ? limit : currentOffset + limit);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadStudents(false);
  };

  const hasMore = students.length < total;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header and Filter */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Students by Graduation Year
          </h1>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <label
                htmlFor="graduation-year"
                className="text-lg font-medium text-gray-700"
              >
                Select Year:
              </label>
              <select
                id="graduation-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 text-lg border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    Class of {year}
                  </option>
                ))}
              </select>
              <span className="text-gray-600">
                ({total} student{total !== 1 ? "s" : ""})
              </span>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        {isLoading && students.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 mt-4">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-gray-500 mt-4 text-lg">
              No students found graduating in {selectedYear}.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {students.map((student) => (
                <Link
                  key={student.id}
                  to={`/user/${student.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow duration-200 overflow-hidden group"
                >
                  {/* Profile Picture */}
                  <div className="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                    {student.profile_picture_url ? (
                      <img
                        src={student.profile_picture_url}
                        alt={student.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-20 h-20 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                      {student.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      @{student.username}
                    </p>
                    {student.yearbook_quote && (
                      <div className="mb-2 p-2 bg-indigo-50 rounded border-l-2 border-indigo-400">
                        <p className="text-xs text-gray-700 italic line-clamp-2">
                          "{student.yearbook_quote}"
                        </p>
                      </div>
                    )}
                    {student.faculty && (
                      <p className="text-sm text-gray-500 truncate">
                        {student.faculty}
                      </p>
                    )}
                    <p className="text-xs text-indigo-600 font-medium mt-2">
                      {student.university}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
