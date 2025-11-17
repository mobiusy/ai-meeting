import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="meetings" element={<div>会议管理页面 - 开发中</div>} />
          <Route path="rooms" element={<div>会议室页面 - 开发中</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
