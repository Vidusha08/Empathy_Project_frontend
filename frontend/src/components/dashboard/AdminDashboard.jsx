// src/components/dashboard/AdminDashboard.jsx
import { useAuthStore } from "../../store/authStore";
import "./Dashboard.css";

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="admin-dashboard dashboard-page p-4 md:p-6">
      <header className="admin-dashboard__header dashboard-header mb-4">
        <p className="dashboard-eyebrow">Workspace overview</p>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.username}</h1>
        <p className="dashboard-subtitle">Manage the learning platform from one place.</p>
      </header>
      <div className="dashboard-card dashboard-empty p-5">Admin Dashboard Page</div>
      {/* TODO: user list (GET /api/users), evaluation summary (GET /api/evaluations/summary), etc. */}
    </div>
  );
}