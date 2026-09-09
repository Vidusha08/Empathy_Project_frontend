// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import ContentPage from "./pages/ContentPage";
import AssessmentPage from "./pages/AssessmentPage";
import QuizPage from "./pages/QuizPage";
import ProgressPage from "./pages/ProgressPage";
import ChatHistoryPage from "./pages/ChatHistoryPage";
import Layout from "./components/common/Layout";
import PrivateRoute from "./components/common/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/history" element={<ChatHistoryPage />} />
          </Route>
        </Route>

        <Route path="/assessment" element={<AssessmentPage />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
