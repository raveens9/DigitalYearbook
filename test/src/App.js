import { Homepage } from "./pages/Homepage";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider,useAuth } from "./APIs/AuthContext";
import { LoginSignup } from "./pages/LoginSignup";


function App() {

  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<LoginSignup />} />
            <Route path="/home" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

export default App;
