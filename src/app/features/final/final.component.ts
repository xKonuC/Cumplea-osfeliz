import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { AudioService } from '../../core/services/audio.service';

@Component({
  selector: 'app-final',
  imports: [DatePipe, RouterLink],
  template: `
    <section class="final-page final-page--epilogue page-enter">
      @if (state.progress().adventureCompleted) {
        <div class="final-content">
          <div class="final-seal">✦</div><p class="eyebrow">Epílogo</p><h1>Aventura completada</h1>
          <p class="lead">{{ epilogue.introText }}</p>
          <div class="video-card final-video"><video #finalVideo controls playsinline preload="metadata" [poster]="epilogue.videoPosterUrl" (play)="audio.pauseForVideo()" (pause)="audio.resumeAfterVideo()"><source [src]="epilogue.videoUrl" type="video/mp4" />Tu navegador no puede reproducir este video.</video></div>
          @if (epilogue.galleryUrls.length) { <div class="final-gallery">@for (photo of epilogue.galleryUrls; track photo) { <img [src]="photo" alt="Un recuerdo de nuestra historia" loading="lazy" /> }</div> }
          <article class="final-letter"><span aria-hidden="true">“</span><p>{{ epilogue.finalLetter }}</p><strong>Con todo mi amor.</strong></article>
          <article class="gift-card">
            @if (epilogue.finalGiftImageUrl) { <img [src]="epilogue.finalGiftImageUrl" alt="Tu regalo final" /> } @else { <div class="gift-placeholder" aria-hidden="true">✧</div> }
            <small>Ahora sí, tu regalo</small><h2>{{ epilogue.finalGiftName }}</h2>
          </article>
          <p class="completion-date">Esta historia quedó completa el {{ state.progress().completedAt | date: "d 'de' MMMM 'de' y, HH:mm" }}</p>
          <p class="closing-line">Feliz cumpleaños, {{ state.config.recipientName }}.</p>
        </div>
      } @else {
        <div class="locked-final"><span>⌁</span><h1>El epílogo todavía está esperando</h1><p>Solo el QR dentro de la habitación puede abrirlo.</p><a class="primary-button" [routerLink]="state.completedCount() === 6 ? '/epilogo' : '/capitulos'">Buscar la última señal</a></div>
      }
    </section>
  `,
})
export class FinalComponent implements OnDestroy {
  @ViewChild('finalVideo') finalVideo?: ElementRef<HTMLVideoElement>;
  readonly state = inject(AdventureStateService);
  readonly audio = inject(AudioService);
  readonly epilogue = this.state.config.epilogue;
  ngOnDestroy(): void { this.finalVideo?.nativeElement.pause(); this.audio.resumeAfterVideo(); }
}
