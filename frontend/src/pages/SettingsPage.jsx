// src/pages/SettingsPage.jsx
import { Check, Moon, Palette, Sun, Volume2, VolumeX, Music } from "lucide-react";
import { useSettingsStore } from "../store/settingsStore";
import { THEME_CONFIGS, getThemeConfig } from "../theme/themeConfig";
import { ambientSoundManager } from "../theme/ambientSoundManager";
import "./SettingsPage.css";

export default function SettingsPage() {
  const colorMode = useSettingsStore((state) => state.colorMode);
  const theme = useSettingsStore((state) => state.theme);
  const isMuted = useSettingsStore((state) => state.isMuted);
  const setColorMode = useSettingsStore((state) => state.setColorMode);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const toggleMute = useSettingsStore((state) => state.toggleMute);

  const activeThemeConfig = getThemeConfig(theme);

  const handleSelectTheme = (themeId) => {
    setTheme(themeId);
    const config = getThemeConfig(themeId);
    // If sound is unmuted, immediately switch to the new theme sound with smooth crossfade
    if (!isMuted && config.ambientSound) {
      ambientSoundManager.play(config.themeId, config.ambientSound);
    }
  };

  const handleToggleSound = () => {
    toggleMute();
    if (isMuted) {
      ambientSoundManager.setMuted(false);
      ambientSoundManager.play(activeThemeConfig.themeId, activeThemeConfig.ambientSound, true);
    } else {
      ambientSoundManager.setMuted(true);
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <p className="settings-page__eyebrow">Personalize your space</p>
        <h1>Settings</h1>
        <p>Choose an immersive theme that combines your background, accent colour, and ambient sound together.</p>
      </header>

      {/* Complete Theme System Gallery */}
      <section className="settings-card" aria-labelledby="theme-gallery-title">
        <div className="settings-card__heading">
          <span className="settings-card__icon"><Palette size={20} /></span>
          <div>
            <h2 id="theme-gallery-title">Theme Experience</h2>
            <p>Selecting a theme instantly bundles its unique background image, single accent colour, and soothing ambient sound.</p>
          </div>
        </div>

        <div className="settings-theme-gallery" role="group" aria-label="Theme selection">
          {THEME_CONFIGS.map((option) => {
            const isSelected = theme === option.themeId;
            return (
              <button
                key={option.themeId}
                type="button"
                className={`settings-theme-card ${isSelected ? "is-selected" : ""}`}
                aria-pressed={isSelected}
                onClick={() => handleSelectTheme(option.themeId)}
                data-theme-id={option.themeId}
              >
                {/* Visual Background Image Preview */}
                <div
                  className={`settings-theme-card__preview ${option.isDefault ? "settings-theme-card__preview--default" : ""}`}
                  style={{
                    backgroundImage: option.backgroundImage ? `url("${option.backgroundImage}")` : "none",
                  }}
                >
                  <div className="settings-theme-card__preview-overlay" />
                  {isSelected && (
                    <span className="settings-theme-card__badge" aria-label="Active theme">
                      <Check size={16} strokeWidth={2.8} />
                    </span>
                  )}
                </div>

                {/* Theme Details Row */}
                <div className="settings-theme-card__body">
                  <div className="settings-theme-card__header">
                    <span
                      className="settings-theme-card__swatch"
                      style={{ backgroundColor: option.accentColor }}
                      title={`Primary colour: ${option.accentColor}`}
                      aria-label={`Primary colour: ${option.accentColor}`}
                    />
                    <h3 className="settings-theme-card__name">{option.themeName}</h3>
                  </div>

                  <div className="settings-theme-card__meta">
                    <span className="settings-theme-card__sound">
                      <Music size={13} />
                      <span className="truncate">{option.soundLabel}</span>
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Ambient Sound Settings & Global Mute Control */}
      <section className="settings-card" aria-labelledby="sound-title">
        <div className="settings-card__heading">
          <span className="settings-card__icon">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </span>
          <div>
            <h2 id="sound-title">Ambient Sound Control</h2>
            <p>Active audio: <strong>{activeThemeConfig.soundLabel}</strong></p>
          </div>
        </div>
        <div className="settings-sound-row">
          <button
            type="button"
            className={`settings-choice ${!isMuted ? "is-selected" : ""}`}
            onClick={handleToggleSound}
            aria-pressed={!isMuted}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{isMuted ? "Sound Muted (Click to Unmute)" : "Sound Playing (Click to Mute)"}</span>
            {!isMuted && <Check className="settings-choice__check" size={17} />}
          </button>
        </div>
      </section>

      {/* Appearance / Light & Dark Mode */}
      <section className="settings-card" aria-labelledby="appearance-title">
        <div className="settings-card__heading">
          <span className="settings-card__icon"><Sun size={20} /></span>
          <div>
            <h2 id="appearance-title">Appearance</h2>
            <p>Switch between light and dark mode.</p>
          </div>
        </div>
        <div className="settings-choice-row" role="group" aria-label="Color mode">
          {[
            { id: "light", label: "Light mode", Icon: Sun },
            { id: "dark", label: "Dark mode", Icon: Moon },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={colorMode === id}
              className={`settings-choice ${colorMode === id ? "is-selected" : ""}`}
              onClick={() => setColorMode(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {colorMode === id && <Check className="settings-choice__check" size={17} />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
