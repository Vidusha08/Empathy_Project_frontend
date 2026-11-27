// src/theme/ambientSoundManager.js
/**
 * Singleton ambient sound manager.
 * Features:
 * - Low default volume (0.25)
 * - Smooth crossfade out of previous sound before / while playing new theme sound
 * - Never plays multiple sounds simultaneously
 * - Global mute/unmute control
 * - Graceful error handling (browser autoplay restrictions, missing assets)
 */
class AmbientSoundManager {
  constructor() {
    this.currentAudio = null;
    this.currentThemeId = null;
    this.muted = true;
    this.volume = 0.25; // Low default volume
    this.fadeDurationMs = 600;
    this.fadeIntervalMs = 30;
    this.fadeTimer = null;
    this.listeners = new Set();
    this.isAutoplayBlocked = false;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((l) => {
      try {
        l({
          muted: this.muted,
          isPlaying: Boolean(this.currentAudio && !this.currentAudio.paused),
          themeId: this.currentThemeId,
          isAutoplayBlocked: this.isAutoplayBlocked,
        });
      } catch (e) {
        console.error("AmbientSoundManager listener error:", e);
      }
    });
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.muted) {
      this.stop();
    } else {
      if (this.currentThemeId && this.currentAudioSrc) {
        this.play(this.currentThemeId, this.currentAudioSrc, true);
      }
    }
    this.notify();
  }

  toggleMute() {
    this.setMuted(!this.muted);
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio && !this.muted) {
      this.currentAudio.volume = this.volume;
    }
  }

  play(themeId, audioSrc, force = false) {
    this.currentThemeId = themeId;
    this.currentAudioSrc = audioSrc;

    if (!audioSrc) {
      this.stop();
      return;
    }

    if (this.muted && !force) {
      this.notify();
      return;
    }

    // If same sound is already playing
    if (
      this.currentAudio &&
      this.currentAudio.dataset.themeId === themeId &&
      !this.currentAudio.paused
    ) {
      return;
    }

    const prevAudio = this.currentAudio;
    this.currentAudio = null;

    if (prevAudio) {
      this.fadeOut(prevAudio, () => {
        prevAudio.pause();
        prevAudio.removeAttribute("src");
        prevAudio.load();
      });
    }

    try {
      const newAudio = new Audio(audioSrc);
      newAudio.dataset.themeId = themeId;
      newAudio.loop = true;
      newAudio.volume = 0; // Start at 0 for smooth fade-in
      this.currentAudio = newAudio;

      const playPromise = newAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isAutoplayBlocked = false;
            this.fadeIn(newAudio);
            this.notify();
          })
          .catch((err) => {
            // Autoplay blocked by browser until explicit user interaction
            console.warn("Ambient sound playback deferred or blocked:", err?.message || err);
            this.isAutoplayBlocked = true;
            this.notify();
          });
      }
    } catch (err) {
      console.warn("Ambient sound initialization failed:", err);
      this.notify();
    }
  }

  stop() {
    if (this.currentAudio) {
      const audio = this.currentAudio;
      this.currentAudio = null;
      this.fadeOut(audio, () => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      });
    }
    this.notify();
  }

  fadeOut(audio, onComplete) {
    if (!audio) {
      if (onComplete) onComplete();
      return;
    }

    const startVolume = audio.volume;
    const steps = Math.max(1, Math.floor(this.fadeDurationMs / this.fadeIntervalMs));
    const stepDec = startVolume / steps;
    let stepCount = 0;

    const interval = setInterval(() => {
      stepCount++;
      const nextVol = Math.max(0, audio.volume - stepDec);
      try {
        audio.volume = nextVol;
      } catch (e) {
        // audio might be detached
      }

      if (stepCount >= steps || nextVol <= 0.01) {
        clearInterval(interval);
        try {
          audio.volume = 0;
        } catch (e) {}
        if (onComplete) onComplete();
      }
    }, this.fadeIntervalMs);
  }

  fadeIn(audio) {
    if (!audio) return;
    const targetVolume = this.volume;
    const steps = Math.max(1, Math.floor(this.fadeDurationMs / this.fadeIntervalMs));
    const stepInc = targetVolume / steps;
    let stepCount = 0;

    const interval = setInterval(() => {
      if (audio !== this.currentAudio) {
        clearInterval(interval);
        return;
      }
      stepCount++;
      const nextVol = Math.min(targetVolume, audio.volume + stepInc);
      try {
        audio.volume = nextVol;
      } catch (e) {}

      if (stepCount >= steps || nextVol >= targetVolume - 0.01) {
        clearInterval(interval);
        try {
          audio.volume = targetVolume;
        } catch (e) {}
      }
    }, this.fadeIntervalMs);
  }
}

export const ambientSoundManager = new AmbientSoundManager();
