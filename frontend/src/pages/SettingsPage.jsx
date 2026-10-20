import { Check, Headphones, Image, Moon, Palette, Sun, UserRound } from "lucide-react";
import { useSettingsStore, themeOptions } from "../store/settingsStore";
import "./SettingsPage.css";

const backgroundOptions = [
  { id: "none", label: "Default", description: "Use your selected background color." },
  { id: "beach", label: "Beach", description: "A calm beach scene." },
  { id: "forest", label: "Forest", description: "A peaceful forest scene." },
];

export default function SettingsPage() {
  const colorMode = useSettingsStore((state) => state.colorMode);
  const backgroundScene = useSettingsStore((state) => state.backgroundScene);
  const theme = useSettingsStore((state) => state.theme);
  const backgroundColor = useSettingsStore((state) => state.backgroundColor);
  const setColorMode = useSettingsStore((state) => state.setColorMode);
  const setBackgroundScene = useSettingsStore((state) => state.setBackgroundScene);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setBackgroundColor = useSettingsStore((state) => state.setBackgroundColor);

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <p className="settings-page__eyebrow">Personalize your space</p>
        <h1>Settings</h1>
        <p>Choose the look and feel that helps you feel comfortable.</p>
      </header>

      <section className="settings-card" aria-labelledby="appearance-title">
        <div className="settings-card__heading">
          <span className="settings-card__icon"><Sun size={19} /></span>
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

      <section className="settings-card" aria-labelledby="theme-title">
        <div className="settings-card__heading">
          <span className="settings-card__icon"><Palette size={19} /></span>
          <div>
            <h2 id="theme-title">Theme color</h2>
            <p>Choose an accent color for your app navigation.</p>
          </div>
        </div>
        <div className="settings-theme-options" role="group" aria-label="Theme color">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`settings-theme ${theme === option.id ? "is-selected" : ""}`}
              aria-pressed={theme === option.id}
              onClick={() => setTheme(option.id)}
            >
              <span className="settings-theme__swatch" style={{ backgroundColor: option.accent }}>
                {theme === option.id && <Check size={17} aria-hidden="true" />}
              </span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-card" aria-labelledby="background-title">
        <div className="settings-card__heading">
          <span className="settings-card__icon"><Image size={19} /></span>
          <div>
            <h2 id="background-title">Background</h2>
            <p>Select a scene or choose a background color.</p>
          </div>
        </div>
        <div className="settings-background-options" role="group" aria-label="Background scene">
          {backgroundOptions.map(({ id, label, description }) => (
            <button
              key={id}
              type="button"
              aria-pressed={backgroundScene === id}
              className={`settings-background ${backgroundScene === id ? "is-selected" : ""}`}
              onClick={() => setBackgroundScene(id)}
            >
              <span className={`settings-background__preview settings-background__preview--${id}`}>
                {backgroundScene === id && <Check size={18} aria-hidden="true" />}
              </span>
              <span className="settings-background__label">{label}</span>
              <span className="settings-background__description">{description}</span>
            </button>
          ))}
        </div>
        {/*<label className="settings-color-picker">
          <span>
            <strong>Background color</strong>
            <small>Used when the Default background is selected.</small>
          </span>
          <span className="settings-color-picker__control">
            <span>{backgroundColor.toUpperCase()}</span>
            <input
              type="color"
              value={backgroundColor}
              aria-label="Choose background color"
              onChange={(event) => setBackgroundColor(event.target.value)}
            />
          </span>
        </label>*/}
      </section>

      <section className="settings-card settings-card--future" aria-label="More settings coming soon">
        <div className="settings-card__heading">
          <span className="settings-card__icon"><UserRound size={19} /></span>
          <div>
            <h2>More ways to personalize</h2>
            <p>Character and more other options are planned for a future update.</p>
          </div>
        </div>
        <div className="settings-future-options">
          <span><UserRound size={17} /> Character <small>Coming soon</small></span>
          {/* <span><Headphones size={17} /> Sound <small>Coming soon</small></span> */}
        </div>
      </section>
    </div>
  );
}
