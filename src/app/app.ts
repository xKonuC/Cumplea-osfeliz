import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AudioService } from './core/services/audio.service';
import { AdventureStateService } from './core/services/adventure-state.service';
import { GlobalErrorHandler } from './core/services/global-error-handler.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  readonly state = inject(AdventureStateService);
  readonly audio = inject(AudioService);
  readonly errors = inject(GlobalErrorHandler);
  readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  readonly immersiveFinal = signal(false);
  private readonly router = inject(Router);

  constructor() {
    effect(() => this.audio.syncPreference(this.state.progress().musicEnabled));
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.immersiveFinal.set(event.urlAfterRedirects.startsWith('/final'));
    });
  }

  toggleMusic(): void {
    const enabled = !this.state.progress().musicEnabled;
    this.state.setMusic(enabled);
    this.audio.setEnabled(enabled);
  }

  @HostListener('window:online')
  onOnline(): void {
    this.online.set(true);
  }

  @HostListener('window:offline')
  onOffline(): void {
    this.online.set(false);
  }
}
