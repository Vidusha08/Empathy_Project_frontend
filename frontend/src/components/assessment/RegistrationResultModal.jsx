// src/components/assessment/RegistrationResultModal.jsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { CrisisPanel, ModalShell, primaryBtn } from "./TestParts";

const COPY = {
  green: {
    title: "You're all set",
    body: "Your registration is complete and this program looks like a good fit for you. Let's start learning.",
  },
  amber: {
    title: "Thanks for being honest with us",
    body: "Your registration is complete. You can use this program, but we recommend talking to a counselor as well. The chatbot teaches skills and is not a replacement for professional support.",
  },
  red: {
    title: "Let's connect you with a counselor first",
    body: "Your registration is saved. Based on your answers, we'd like you to speak with a counselor before using the learning program, so your account is on hold until then. This is not a judgement; it's about making sure you get the right kind of support.",
  },
};

export default function RegistrationResultModal({ result }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const tier = result?.tier;
  const copy = COPY[tier] || COPY.green;
  const canEnter = tier !== "red" && !!result?.access_token;

  const handleContinue = () => {
    if (canEnter) {
      localStorage.setItem("token", result.access_token);
      setAuth(result.student, result.access_token);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", {
        state: { message: "Your account is on hold until you've spoken with a counselor." },
      });
    }
  };

  return (
    <ModalShell
      title={copy.title}
      scrollKey="result"
      footer={
        <button type="button" className={`${primaryBtn} w-full`} onClick={handleContinue}>
          {canEnter ? "Go to dashboard" : "Back to sign in"}
        </button>
      }
    >
      {tier === "red" && <CrisisPanel />}
      <p className="text-sm text-gray-600 leading-relaxed">{copy.body}</p>
    </ModalShell>
  );
}