import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Navbar } from "../components/Navbar";

export function Welcome() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2940')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/85 to-indigo-800/90 dark:from-gray-900/95 dark:via-indigo-950/90 dark:to-gray-900/95 transition-colors duration-300"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <span className="text-8xl">📚</span>
                <div className="absolute -inset-4 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full blur-xl animate-pulse"></div>
              </div>
            </div>

            <h1 className="text-6xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Digital Yearbook
              </span>
            </h1>

            <p className="text-xl text-gray-100 dark:text-gray-200 max-w-2xl mx-auto mb-8">
              Connect with fellow students, share memories, and build your
              university community. Your digital yearbook journey starts here.
            </p>

            {!isAuthenticated ? (
              <div className="flex justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <Link
                to="/feed"
                className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Go to Feed
              </Link>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 dark:border-gray-700">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Connect with Peers
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Find and connect with students from your university, faculty,
                and graduation year.
              </p>
            </div>

            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 dark:border-gray-700">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Share Memories
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Post photos, updates, and memorable moments from your university
                life.
              </p>
            </div>

            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 dark:border-gray-700">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Discover People
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Search for students by name, university, interests, or
                graduation year.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">
              Join Our Growing Community
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-gray-200 font-medium">Active Students</div>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold text-white mb-2">50+</div>
                <div className="text-gray-200 font-medium">Universities</div>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold text-white mb-2">100K+</div>
                <div className="text-gray-200 font-medium">Memories Shared</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
