import { Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { AudioService } from '../../core/services/audio.service';
import { StageConfig } from '../../core/models/adventure.models';
import { FragmentBoardComponent } from '../../shared/fragment-board/fragment-board.component';

@Component({
  selector: 'app-memory',
  imports: [FragmentBoardComponent],
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
  readonly fragments = this.state.config.stages.map((stage) => stage.fragment);
  private slowTimer = window.setTimeout(() => this.slowConnection.set(true), 9000);

  ngOnDestroy(): void {
    window.clearTimeout(this.slowTimer);
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
