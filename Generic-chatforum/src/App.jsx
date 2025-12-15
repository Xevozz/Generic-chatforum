import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import CreateUserPage from "./pages/createUser";
import HomePage from "./pages/homePage";
import GroupPage from "./pages/groupPage";
import { useAuth } from "./context/AuthContext";
import MyProfile from "./pages/myProfile";
import "./App.css";

// Beskytter routes der kræver login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Indlæser...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Opret bruger */}
        <Route path="/create-user" element={<CreateUserPage />} />

        {/* Beskyttede routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups/:groupId"
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;