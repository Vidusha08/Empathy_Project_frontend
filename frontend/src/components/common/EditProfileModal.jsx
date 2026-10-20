import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const MAX_IMAGE_SIZE = 1024 * 1024;
const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];

export default function EditProfileModal({ user, onClose }) {
  const updateUser = useAuthStore((state) => state.updateUser);
  const fileInputRef = useRef(null);
  const [username, setUsername] = useState(user?.username ?? "");
  const [gender, setGender] = useState(user?.gender ?? "Prefer not to say");
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Choose an image smaller than 1 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
        setError("");
        setSaved(false);
      }
    };
    reader.onerror = () => setError("The image could not be read. Please try another file.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setError("Username is required.");
      return;
    }
    if ((newPassword || confirmPassword) && newPassword !== confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }

    updateUser({ username: cleanUsername, gender, profileImage });
    setUsername(cleanUsername);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSaved(true);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 id="edit-profile-title" className="text-xl font-bold text-gray-900">Edit profile</h2>
            <p className="mt-1 text-sm text-gray-500">Update your profile details on this device.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit profile"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-orange-600">
              {profileImage
                ? <img src={profileImage} alt="Profile preview" className="h-full w-full object-cover" />
                : <span className="text-xl font-semibold">{username.trim().charAt(0).toUpperCase() || "?"}</span>}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
                aria-label="Choose profile image"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Camera size={16} /> Change photo
              </button>
              <p className="mt-1.5 text-xs text-gray-500">Image files up to 1 MB</p>
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => { setUsername(event.target.value); setSaved(false); }}
              autoComplete="username"
              required
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Gender</span>
            <select
              value={gender}
              onChange={(event) => { setGender(event.target.value); setSaved(false); }}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {GENDERS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-800">Change password</h3>
            <p className="mt-1 text-xs text-gray-500">
              Password changes aren’t connected yet and won’t be saved.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-gray-700">New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => { setNewPassword(event.target.value); setSaved(false); }}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => { setConfirmPassword(event.target.value); setSaved(false); }}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>
          </div>

          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          {saved && (
            <p role="status" className="text-sm font-medium text-green-700">
              Profile saved on this device. Password changes are not saved.
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Save profile
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}
