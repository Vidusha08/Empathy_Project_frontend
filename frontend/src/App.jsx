// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import ContentPage from "./pages/ContentPage";
import AssessmentPage from "./pages/AssessmentPage";
import QuizPage from "./pages/QuizPage";
import ProgressReportPage from "./pages/ProgressReportPage";
import Layout from "./components/common/Layout";

// NOTE: PrivateRoute is bypassed for now since the backend isn't connected.
// Once auth is wired up, swap the <Layout /> route back to wrap it in <PrivateRoute />.

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Temporarily unprotected while backend isn't connected */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/progress" element={<ProgressReportPage />} />
        </Route>

        <Route path="/assessment" element={<AssessmentPage />} />

        {/* Land straight on chat instead of login */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
/*import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import AssessmentPage from "./pages/AssessmentPage";
import QuizPage from "./pages/QuizPage";
import ProgressReportPage from "./pages/ProgressReportPage";
import PrivateRoute from "./components/common/PrivateRoute";
import Layout from "./components/common/Layout";  

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no sidebar }
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Protected routes — sidebar shown via Layout }
        <Route element={<PrivateRoute />}>
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route element={<Layout />}>        
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/progress" element={<ProgressReportPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
*/