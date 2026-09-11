// src/components/dashboard/AdminDashboard.jsx
import { useAuthStore } from "../../store/authStore";

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h1>
      <div className="p-4">Admin Dashboard Page</div>
      {/* TODO: user list (GET /api/users), evaluation summary (GET /api/evaluations/summary), etc. */}
    </div>
  );
}