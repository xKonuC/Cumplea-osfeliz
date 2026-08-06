import { Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { AudioService } from '../../core/services/audio.service';
import { StageConfig } from '../../core/models/adventure.models';
import { FragmentBoardComponent } from '../../shared/fragment-board/fragment-board.component';

@Component({
  selector: 'app-memory',
  imports: [ReactiveFormsModule, FragmentBoardComponent],
  template: `
    @if (stage; as current) {
      <section class="page memory-page page-enter">
        <div class="unlock-burst" aria-hidden="true"><span>✦</span><i></i><i></i><i></i><i></i></div>
        <p class="eyebrow">Recuerdo desbloqueado</p>
        <h1>{{ current.title }}</h1>
        <p class="lead compact">{{ current.beforeVideoText }}</p>

        <div class="video-card">
          <video #memoryVideo
            controls
            playsinline
            preload="metadata"
            [poster]="current.videoPosterUrl"
            (play)="onPlay()"
            (ended)="onEnded()"
            (error)="onVideoError()"
          >
            <source [src]="current.videoUrl" type="video/mp4" />
            Tu navegador no puede reproducir este video.
          </video>
          @if (slowConnection()) {
            <p class="video-note">El video está tardando. Puedes reintentar o continuar sin verlo.</p>
          }
        </div>

        @if (!readyForReward()) {
          <p class="gentle-note">Cuando termine el video podrás continuar.</p>
          <div class="inline-actions centered-actions">
            <button class="text-button" type="button" (click)="retryVideo()">Reintentar carga</button>
            <button class="text-button" type="button" (click)="continueWithoutVideo()">El video no está disponible</button>
          </div>
        } @else {
          <div class="reward-reveal page-enter">
            @if (current.order === 1) {
              <div class="first-fragment-experience">
                <p class="eyebrow">Fragmento desbloqueado</p>
                <h2>Encontraste el primer fragmento</h2>
                <p class="lead compact">Quise empezar con una rosa porque, aunque las flores duren poquito, espero que el recuerdo de este momento se quede contigo por mucho tiempo.</p>

                @if (!letterRevealed()) {
                  <form
                    class="fragment-letter-form"
                    [class.fragment-letter-form--leaving]="letterAccepted()"
                    [attr.aria-busy]="letterAccepted()"
                    (submit)="saveFragmentLetter(); $event.preventDefault()"
                    novalidate
                  >
                    <p class="fragment-letter-prompt">Mira la pieza que acompaña a la rosa.</p>
                    <label for="fragmentLetter">¿Qué letra aparece en ella?</label>
                    <input
                      id="fragmentLetter"
                      type="text"
                      maxlength="1"
                      autocomplete="off"
                      autocapitalize="characters"
                      spellcheck="false"
                      placeholder="Escribe la letra"
                      [formControl]="fragmentLetter"
                      [readonly]="letterAccepted()"
                      (input)="clearLetterMessage()"
                      [attr.aria-invalid]="letterMessage() ? 'true' : null"
                      [attr.aria-describedby]="letterMessage() ? 'fragmentLetterMessage' : null"
                    />
                    @if (letterMessage()) {
                      <p id="fragmentLetterMessage" class="fragment-letter-message" role="status">{{ letterMessage() }}</p>
                    }
                    <button class="primary-button glow" type="submit" [disabled]="letterAccepted()">Guardar fragmento</button>
                  </form>
                } @else {
                  <section class="fragment-letter-reveal" aria-live="polite" aria-labelledby="saved-fragment-title">
                    <div class="fragment-letter-seal" aria-hidden="true">{{ current.fragment.label }}</div>
                    <h3 id="saved-fragment-title">Primer fragmento guardado</h3>
                    <p>Guárdalo bien. Más adelante entenderás qué significa.</p>
                    <button class="primary-button" type="button" (click)="continueJourney()">Continuar la aventura</button>
                    <div class="fragment-found-progress">
                      <small>Fragmentos encontrados: 1 de {{ state.config.stages.length }}</small>
                      <div class="fragment-found-dots" aria-label="1 de 6 fragmentos encontrados">
                        @for (item of state.config.stages; track item.id; let i = $index) {
                          <span [class.found]="i === 0" aria-hidden="true"></span>
                        }
                      </div>
                    </div>
                  </section>
                }
              </div>
            } @else {
              <div class="reward-icon large">{{ current.reward.icon }}</div>
              <p class="eyebrow">Fragmento desbloqueado</p>
              <h2>{{ current.reward.name }}</h2>
              <p class="lead compact">{{ current.completionMessage }}</p>
              <app-fragment-board
                [fragments]="fragments"
                [unlockedIds]="previewUnlockedIds(current.reward.id)"
                [newFragmentId]="current.reward.id"
                [assembled]="current.kind === 'homecoming'"
              />
              <div class="reward-instruction"><span aria-hidden="true">◎</span><p>{{ current.rewardInstruction }}</p></div>
              @if (current.specialInstruction) {
                <p class="special-copy">{{ current.specialInstruction }}</p>
              }
              @if (!isCompleted()) {
                <button class="primary-button glow" type="button" (click)="foundReward()">Ya lo encontré</button>
              } @else {
                <div class="success-chip">✓ Guardado en tu mochila</div>
                <p class="next-teaser">{{ current.nextTeaser }}</p>
                <button class="primary-button" type="button" (click)="continueJourney()">
                  {{ current.kind === 'homecoming' ? 'He comenzado el regreso' : 'Continuar sin prisa' }}
                </button>
              }
            }
          </div>
        }
      </section>
    }
  `,
})
export class MemoryComponent implements OnDestroy {
  @ViewChild('memoryVideo') memoryVideo?: ElementRef<HTMLVideoElement>;
  readonly state = inject(AdventureStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly audio = inject(AudioService);
  readonly stage: StageConfig | undefined = this.state.stageById(this.route.snapshot.paramMap.get('id') ?? '');
  readonly readyForReward = signal(this.stage ? this.state.progress().watchedVideoIds.includes(this.stage.id) : false);
  readonly slowConnection = signal(false);
  readonly isCompleted = signal(this.stage ? this.state.progress().completedStageIds.includes(this.stage.id) : false);
  readonly fragmentLetter = new FormControl('', { nonNullable: true });
  readonly letterMessage = signal('');
  readonly letterAccepted = signal(false);
  readonly letterRevealed = signal(this.stage?.order === 1 && this.isCompleted());
  readonly fragments = this.state.config.stages.map((stage) => stage.fragment);
  private slowTimer = window.setTimeout(() => this.slowConnection.set(true), 9000);
  private revealTimer?: number;

  ngOnDestroy(): void {
    window.clearTimeout(this.slowTimer);
    if (this.revealTimer) window.clearTimeout(this.revealTimer);
    this.memoryVideo?.nativeElement.pause();
    if (this.memoryVideo) this.memoryVideo.nativeElement.removeAttribute('src');
    this.audio.resumeAfterVideo();
  }

  onPlay(): void {
    window.clearTimeout(this.slowTimer);
    this.slowConnection.set(false);
    this.audio.pauseForVideo();
  }

  onEnded(): void {
    if (!this.stage) return;
    this.state.markVideoWatched(this.stage.id);
    this.readyForReward.set(true);
    this.audio.resumeAfterVideo();
  }

  onVideoError(): void {
    this.slowConnection.set(true);
  }

  retryVideo(): void {
    window.location.reload();
  }

  continueWithoutVideo(): void {
    this.onEnded();
  }

  foundReward(): void {
    if (!this.stage) return;
    this.state.completeStage(this.stage.id);
    this.isCompleted.set(true);
    navigator.vibrate?.([60, 30, 60]);
  }

  saveFragmentLetter(): void {
    if (!this.stage || this.stage.order !== 1 || this.letterRevealed() || this.letterAccepted()) return;
    const value = this.fragmentLetter.value.trim().toUpperCase();
    if (!value) {
      this.letterMessage.set('Primero escribe la letra que aparece en tu fragmento.');
      return;
    }
    if (value !== this.stage.fragment.label.toUpperCase()) {
      this.letterMessage.set('Mira nuevamente tu fragmento. La letra está ahí esperándote.');
      return;
    }
    this.letterMessage.set('');
    this.fragmentLetter.setValue(value);
    this.letterAccepted.set(true);
    const revealDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280;
    this.revealTimer = window.setTimeout(() => {
      if (!this.stage) return;
      this.state.completeStage(this.stage.id);
      this.isCompleted.set(true);
      this.letterRevealed.set(true);
      navigator.vibrate?.([50, 35, 70]);
    }, revealDelay);
  }

  clearLetterMessage(): void {
    if (this.letterMessage()) this.letterMessage.set('');
  }

  continueJourney(): void {
    if (!this.stage) return;
    if (this.stage.kind === 'homecoming') {
      this.state.setReturningHome();
      void this.router.navigate(['/epilogo']);
      return;
    }
    const next = this.state.config.stages.find((item) => item.order === this.stage!.order + 1);
    void this.router.navigate(next ? ['/etapa', next.id] : ['/capitulos']);
  }

  previewUnlockedIds(id: string): string[] {
    const unlocked = this.state.progress().unlockedRewardIds;
    return unlocked.includes(id) ? unlocked : [...unlocked, id];
  }
}
