// src/pages/DashboardPage.jsx
import { useAuthStore } from "../store/authStore";
import StudentDashboard from "../components/dashboard/StudentDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return user?.role === "admin" ? <AdminDashboard /> : <StudentDashboard />;
}
/*export default function DashboardPage() {
  return <div className="p-4">Dashboard Page</div>;
}*/