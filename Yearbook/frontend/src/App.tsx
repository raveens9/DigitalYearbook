import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Feed } from "./pages/Feed";
import { Profile } from "./pages/Profile";
import { UserProfile } from "./pages/UserProfile";
import { PostDetail } from "./pages/PostDetail";
import { Search } from "./pages/Search";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Semi-public routes (viewable by all, but some features need auth) */}
          <Route path="/" element={<Feed />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/user/:userId" element={<UserProfile />} />

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
