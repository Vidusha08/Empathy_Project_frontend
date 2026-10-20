// src/components/assessment/RegistrationResultModal.jsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ModalShell, primaryBtn } from "./TestParts";

const COPY = {
  green: {
    title: "You're all set",
    body: "Your registration is complete and this program looks like a good fit for you. Let's start learning.",
  },
  amber: {
    title: "Thanks for being honest with us",
    body: "Your registration is complete. You can use this program, but we recommend talking to a counselor as well. The chatbot teaches skills and is not a replacement for professional support.",
  },
};

export default function RegistrationResultModal({ result }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const copy = COPY[result?.tier] || COPY.green;

  const handleContinue = () => {
    if (result?.access_token) {
      localStorage.setItem("token", result.access_token);
      setAuth(result.student, result.access_token);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <ModalShell
      title={copy.title}
      scrollKey="result"
      footer={
        <button type="button" className={`${primaryBtn} w-full`} onClick={handleContinue}>
          Go to dashboard
        </button>
      }
    >
      <p className="text-sm text-gray-600 leading-relaxed">{copy.body}</p>
    </ModalShell>
  );
}