import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { AudioService } from '../../core/services/audio.service';

@Component({
  selector: 'app-welcome',
  imports: [DatePipe],
  template: `
    <section class="welcome-page page-enter">
      <div class="welcome-photo" [class.cinematic-exit]="leaving()" [style.background-image]="'url(' + state.config.coverImageUrl + ')'">
        <div class="welcome-shade"></div>
        <div class="welcome-copy">
          <p class="eyebrow">Una historia preparada para ti {{ state.config.recipientName }}</p>
          <h1>{{ state.config.experienceName }}</h1>
          <p class="event-date">
            <span class="event-date__label"><span aria-hidden="true">♡</span></span>
            <strong>{{ state.config.eventDate | date: "d 'de' MMMM 'de' y" }}</strong>
          </p>
          <p class="lead prologue-copy">{{ state.config.introText }}</p>
          <button class="primary-button glow" type="button" (click)="begin()">
            {{ leaving() ? 'Preparando el primer capítulo…' : (state.progress().started ? 'Continuar nuestra aventura' : 'Comenzar nuestra aventura') }}
          </button>
          <p class="permission-note"><span aria-hidden="true">◉</span> Más adelante pediremos permiso para usar la cámara. Siempre habrá una alternativa.</p>
          @if (leaving()) { <button class="text-button" type="button" (click)="continueNow()">Continuar sin animación</button> }
        </div>
      </div>

      @if (showIntroVideo()) {
        <div class="intro-video-overlay page-enter" role="dialog" aria-modal="true" aria-labelledby="intro-video-title">
          <div class="intro-video-content">
            <p class="eyebrow">Antes de comenzar</p>
            <h2 id="intro-video-title">Feliz Cumpleaños bebe , {{ state.config.recipientName }}</h2>
            <p>Antes de comenzar, mira este video. Es solo el principio de lo que preparé para ti.</p>
            <div class="video-card intro-video-card">
              <video
                #introVideo
                controls
                playsinline
                preload="metadata"
                [poster]="state.config.introVideoPosterUrl"
                (play)="onVideoPlay()"
                (ended)="finishIntro()"
                (error)="videoError.set(true)"
              >
                <source [src]="state.config.introVideoUrl" type="video/mp4" />
                Tu navegador no puede reproducir este video.
              </video>
            </div>
            @if (videoError()) {
              <p class="notice error-notice" role="status">El video no pudo cargarse. Puedes continuar con la aventura.</p>
            }
            <button class="primary-button full-button" type="button" (click)="finishIntro()">Continuar al primer capítulo</button>
            <button class="text-button centered" type="button" (click)="finishIntro()">Omitir video</button>
          </div>
        </div>
      }
    </section>
  `,
})
export class WelcomeComponent implements OnDestroy {
  @ViewChild('introVideo') introVideo?: ElementRef<HTMLVideoElement>;
  readonly state = inject(AdventureStateService);
  private readonly router = inject(Router);
  private readonly audio = inject(AudioService);
  readonly leaving = signal(false);
  readonly showIntroVideo = signal(false);
  readonly videoError = signal(false);
  private navigationTimer?: number;

  begin(): void {
    this.state.start();
    this.audio.pauseForVideo();
    this.videoError.set(false);
    this.showIntroVideo.set(true);
  }

  onVideoPlay(): void {
    this.audio.pauseForVideo();
  }

  finishIntro(): void {
    this.introVideo?.nativeElement.pause();
    this.showIntroVideo.set(false);
    this.leaving.set(true);
    this.navigationTimer = window.setTimeout(() => this.continueNow(), 650);
  }

  continueNow(): void {
    if (this.navigationTimer) window.clearTimeout(this.navigationTimer);
    this.audio.resumeAfterVideo();
    void this.router.navigate(['/etapa', this.state.progress().currentStageId]);
  }

  ngOnDestroy(): void {
    if (this.navigationTimer) window.clearTimeout(this.navigationTimer);
    this.introVideo?.nativeElement.pause();
    this.audio.resumeAfterVideo();
  }
}
