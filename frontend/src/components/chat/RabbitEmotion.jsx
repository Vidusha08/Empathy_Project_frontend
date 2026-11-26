import "./RabbitEmotion.css";
import celebrating from "../../assets/images/robot_celebrating.png";
import comforting from "../../assets/images/robot_comforting.png";
import listening from "../../assets/images/robot_listening.png";
import relaxing from "../../assets/images/robot_relaxing.png";
import welcoming from "../../assets/images/robot_welcoming.png";

const expressions = {
  celebrating: { image: celebrating, label: "celebrating" },
  comforting: { image: comforting, label: "offering comfort" },
  listening: { image: listening, label: "listening" },
  relaxing: { image: relaxing, label: "helping you relax" },
  welcoming: { image: welcoming, label: "welcoming you" },
};

function getExpression(emotion, content) {
  const normalizedEmotion = String(emotion ?? "").trim().toLowerCase();
  const normalizedContent = String(content ?? "").toLowerCase();

  if (["welcome", "welcoming", "greeting"].includes(normalizedEmotion)) {
    return "welcoming";
  }

  if (/\b(great job|well done|congratulations|you did it|correct!|proud of you)\b/.test(normalizedContent)) {
    return "celebrating";
  }

  if (/\b(breath|breathe|relax|grounding|calm your|settle your)\b/.test(normalizedContent)) {
    return "relaxing";
  }

  if (["concerned", "sad", "sadness", "anxious", "anxiety", "afraid", "fear", "angry", "anger", "stress", "stressed", "distressed"].includes(normalizedEmotion)
    || /\b(i'm sorry|that sounds hard|that sounds difficult|you don't have to|it's okay|that's okay)\b/.test(normalizedContent)) {
    return "comforting";
  }

  if (["happy", "joy", "excited", "celebrating", "celebration"].includes(normalizedEmotion)) {
    return "celebrating";
  }

  if (["relaxed", "relaxing", "calm"].includes(normalizedEmotion)) {
    return "relaxing";
  }

  if (["listening", "neutral"].includes(normalizedEmotion)
    || /\b(i hear you|i'm here to listen|tell me more|share more)\b/.test(normalizedContent)) {
    return "listening";
  }

  return "listening";
}

export default function RabbitEmotion({ emotion, content }) {
  const expression = getExpression(emotion, content);
  const { image, label } = expressions[expression];

  return (
    <span
      className={`rabbit-emotion rabbit-emotion--${expression}`}
      role="img"
      aria-label={`Empathy Guide ${label}`}
    >
      <img src={image} alt="" />
    </span>
  );
}
