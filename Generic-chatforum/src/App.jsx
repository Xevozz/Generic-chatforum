import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import CreateUserPage from "./pages/createUser";
import HomePage from "./pages/homePage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Opret bruger */}
        <Route path="/create-user" element={<CreateUserPage />} />

        {/* Forside */}
        <Route path="/home" element={<HomePage />} />

        {/* Standard route → redirect til login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;