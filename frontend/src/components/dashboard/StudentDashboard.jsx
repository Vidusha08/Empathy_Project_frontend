// src/components/dashboard/StudentDashboard.jsx
import { useAuthStore } from "../../store/authStore";

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h1>
      <div className="p-4">Student Dashboard Page</div>
      {/* TODO: skill progress cards, recent chats, etc. */}
    </div>
  );
}