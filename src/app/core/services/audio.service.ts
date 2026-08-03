import { Injectable } from '@angular/core';
import { ADVENTURE_CONFIG } from '../../config/adventure.config';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly audio = typeof Audio === 'undefined' ? null : new Audio(ADVENTURE_CONFIG.musicUrl);
  private enabled = false;

  constructor() {
    if (this.audio) {
      this.audio.loop = true;
      this.audio.volume = 0.28;
    }
  }

  syncPreference(enabled: boolean): void {
    this.enabled = enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!this.audio || !ADVENTURE_CONFIG.musicUrl) return;
    if (enabled) void this.audio.play().catch(() => undefined);
    else this.audio.pause();
  }

  pauseForVideo(): void {
    this.audio?.pause();
  }

  resumeAfterVideo(): void {
    if (this.enabled && this.audio && ADVENTURE_CONFIG.musicUrl) {
      void this.audio.play().catch(() => undefined);
    }
  }
}
