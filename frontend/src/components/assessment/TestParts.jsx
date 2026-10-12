// src/components/assessment/TestParts.jsx
import { useEffect, useRef } from "react";
import { CRISIS_RESOURCES } from "../../utils/screeningData";

export const Choice = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`flex-1 min-w-[110px] px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      selected
        ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
        : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
    }`}
  >
    {children}
  </button>
);

export const Question = ({ number, text, options, value, onChange, invalid, stacked = false }) => (
  <div className={`rounded-2xl border-2 p-4 transition-colors ${invalid ? "border-red-300 bg-red-50" : "border-gray-100"}`}>
    <p className="text-sm font-semibold text-gray-800 mb-3">
      {number != null && <span className="text-indigo-500 mr-1.5">{number}.</span>}
      {text}
    </p>
    <div className={stacked ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}>
      {options.map((o) => (
        <Choice key={String(o.value)} selected={value === o.value} onClick={() => onChange(o.value)}>
          <span className={stacked ? "block text-left" : ""}>{o.label}</span>
        </Choice>
      ))}
    </div>
    {invalid && <p className="text-red-500 text-xs mt-2">⚠ Please choose an answer</p>}
  </div>
);

export const CrisisPanel = () => (
  <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-5 text-left">
    <p className="text-sm font-semibold text-rose-800 mb-3">Please reach out to someone right now</p>
    <ul className="space-y-2">
      {CRISIS_RESOURCES.map((r) => (
        <li key={r.name} className="flex items-center justify-between gap-3 text-sm">
          <span className="text-gray-700">{r.name}</span>
          <a href={`tel:${r.contact.replace(/\s/g, "")}`} className="font-bold text-rose-700 hover:underline whitespace-nowrap">
            {r.contact}
          </a>
        </li>
      ))}
    </ul>
    <p className="text-xs text-gray-600 mt-3">
      If you are in immediate danger, call emergency services or go to the nearest hospital. You can also tell someone you trust to stay with you.
    </p>
  </div>
);

/**
 * Popup frame: gradient header, scrollable body, fixed footer.
 * `scrollKey` changes -> body scrolls back to the top (step / page change).
 */
export function ModalShell({ title, subtitle, progress, scrollKey, children, footer }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [scrollKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 md:px-10 pt-6 pb-5 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shrink-0">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-indigo-100 text-sm mt-1">{subtitle}</p>}
          {progress != null && (
            <div
              className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${Math.max(progress, 6)}%` }} />
            </div>
          )}
        </div>

        <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto px-6 md:px-10 py-6 space-y-5">
          {children}
        </div>

        {footer && <div className="shrink-0 border-t border-gray-100 px-6 md:px-10 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export const primaryBtn =
  "bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg";
export const ghostBtn =
  "px-5 py-3 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-0 transition-all";
export const plainBtn =
  "px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60 transition-all";