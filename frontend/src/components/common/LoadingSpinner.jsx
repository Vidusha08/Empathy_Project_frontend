import "./LoadingSpinner.css";

export default function LoadingSpinner({ label = "Loading", compact = false }) {
	return (
		<span className={`loading-spinner ${compact ? "loading-spinner--compact" : ""}`} role="status" aria-label={label}>
			<span className="loading-spinner__ring" aria-hidden="true" />
			<span className="loading-spinner__label">{label}</span>
		</span>
	);
}
