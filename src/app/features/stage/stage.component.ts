import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { StageConfig } from '../../core/models/adventure.models';
import { FragmentBoardComponent } from '../../shared/fragment-board/fragment-board.component';

@Component({
  selector: 'app-stage',
  imports: [RouterLink, FragmentBoardComponent],
  template: `
    @if (stage; as current) {
      <section class="page page-enter stage-page" [class.near-reveal]="current.order >= 5">
        <a class="back-link" routerLink="/capitulos">← Todos los capítulos</a>
        <div class="stage-meta">
          <span>Capítulo {{ current.order }} de 6</span>
          <span>{{ state.completedCount() }} fragmentos encontrados</span>
        </div>
        <div class="fragment-dots" aria-hidden="true">
          @for (item of state.config.stages; track item.id) { <i [class.found]="state.progress().completedStageIds.includes(item.id)"></i> }
        </div>

        <header class="stage-header">
          <p class="eyebrow">{{ current.subtitle }}</p>
          <h1>{{ current.title }}</h1>
          <p class="lead">{{ current.description }}</p>
        </header>

        <article class="mission-card">
          <small>Tu misión</small>
          <p>{{ current.mission }}</p>
        </article>

        @if (current.interaction.kind === 'photo-reveal' && current.imageUrl) {
          <figure class="photo-clue">
            <img [src]="current.imageUrl" [alt]="current.interaction.locationAlt || 'Fotografía con la pista del lugar'" [style.filter]="photoFilter()" />
            <figcaption>La imagen se aclarará a medida que reveles pistas.</figcaption>
          </figure>
        } @else if (current.imageUrl && current.interaction.kind !== 'word-order') {
          <img class="stage-image" [src]="current.imageUrl" [alt]="current.interaction.locationAlt || ('Imagen de referencia para ' + current.title)" loading="lazy" />
        }

        <section class="interaction-card" [attr.aria-label]="'Interacción de ' + current.title">
          @switch (current.interaction.kind) {
            @case ('word-order') {
              <p class="interaction-kicker">Completa la frase</p>
              <p class="tap-instruction">Coloca las tres partes de la frase en los cuadros. Toca una tarjeta para agregarla.</p>
              <div class="phrase-boxes" aria-live="polite" aria-label="Cuadros de la frase">
                @for (slot of phraseSlots; track slot; let i = $index) {
                  <div class="phrase-box" [class.filled]="selectedWords()[i]">
                    <small>{{ i + 1 }}</small>
                    @if (selectedWords()[i]; as part) {
                      <button type="button" (click)="returnWord(i)" [attr.aria-label]="'Quitar ' + part + ' del cuadro ' + (i + 1)">{{ part }}</button>
                    } @else {
                      <span>Coloca una parte aquí</span>
                    }
                  </div>
                }
              </div>
              <div class="phrase-parts" aria-label="Partes disponibles">
                @for (part of orderedWords(); track $index; let i = $index) {
                  <button type="button" class="phrase-part" (click)="selectWord(i)"><span aria-hidden="true">＋</span>{{ part }}</button>
                }
              </div>
              <div class="word-builder-actions">
                <button class="secondary-button" type="button" (click)="checkWords()" [disabled]="orderedWords().length > 0">Comprobar frase</button>
                <button class="text-button" type="button" (click)="undoWord()" [disabled]="selectedWords().length === 0">Deshacer última</button>
                <button class="text-button" type="button" (click)="resetWords()">Reiniciar</button>
              </div>
              @if (interactionComplete()) {
                <article class="destination-reveal page-enter" aria-live="polite">
                  <div class="destination-reveal__seal" aria-hidden="true">✓</div>
                  <p class="destination-reveal__success">{{ current.interaction.successMessage }}</p>
                  <small>Tu próximo destino es</small>
                  <h2>{{ current.interaction.destinationName }}</h2>
                  <p>{{ current.interaction.arrivalInstruction }}</p>
                  <div class="destination-actions">
                    <a class="secondary-button" [href]="current.mapUrl" target="_blank" rel="noopener noreferrer">Abrir ubicación</a>
                    <a class="primary-button" [routerLink]="['/escanear', current.id]">Ya llegué</a>
                  </div>
                </article>
              }
            }
            @case ('qualities') {
              <p class="interaction-kicker">Así es como yo te veo</p>
              <div class="quality-list">
                @for (scenario of current.interaction.scenarios; track scenario.text; let i = $index) {
                  <article><p>{{ scenario.text }}</p><div class="quality-options">
                    @for (quality of current.interaction.qualities; track quality) {
                      <button type="button" [class.chosen]="qualityAnswers()[i] === quality" (click)="chooseQuality(i, quality)">{{ quality }}</button>
                    }
                  </div></article>
                }
              </div>
              <button class="secondary-button full-button" type="button" (click)="checkQualities()">Descubrir lo que veo</button>
            }
            @case ('fragment-order') {
              <p class="interaction-kicker">Reúne lo que has encontrado</p>
              <app-fragment-board [fragments]="fragments" [unlockedIds]="state.progress().unlockedRewardIds" [showMissingCenter]="true" />
              @if (!countdownSkipped() && countdownSeconds() > 0) {
                <div class="short-countdown" aria-live="polite"><span>Una pausa antes de continuar</span><strong>{{ countdownSeconds() }}</strong><button class="text-button" type="button" (click)="skipCountdown()">Saltar espera</button></div>
              }
              <p>Colócalos en el orden en que llegaron hasta ti.</p>
              <div class="word-order">
                @for (piece of orderedPieces(); track piece; let i = $index) {
                  <div class="word-chip"><span>{{ piece }}</span><button type="button" (click)="movePiece(i, -1)" [disabled]="i === 0">←</button><button type="button" (click)="movePiece(i, 1)" [disabled]="i === orderedPieces().length - 1">→</button></div>
                }
              </div>
              <button class="secondary-button full-button" type="button" (click)="checkPieces()">Colocar fragmentos</button>
            }
            @case ('homecoming') {
              <p class="interaction-kicker">Una señal todavía permanece oculta</p>
              <p>Cuando valides el código, los seis fragmentos podrán reunirse.</p>
            }
            @default {
              <p class="interaction-kicker">Observa con calma</p><p>La primera señal está en el mundo real. Las pistas te acompañarán.</p>
            }
          }
          @if (interactionMessage()) { <p class="interaction-message" [class.complete]="interactionComplete()" role="status">{{ interactionMessage() }}</p> }
        </section>

        @if (current.interaction.kind !== 'word-order') {
          <article class="hint-card">
            <div class="hint-icon" aria-hidden="true">✦</div><div><small>Pista 1 · sutil</small><p>{{ current.primaryHint }}</p></div>
          </article>
          @if (hintCount() >= 1) { <article class="hint-card secondary-hint page-enter"><div class="hint-icon">◇</div><div><small>Pista 2 · clara</small><p>{{ current.secondaryHint }}</p></div></article> }
          @if (hintCount() >= 2) { <article class="hint-card final-hint page-enter"><div class="hint-icon">◎</div><div><small>Pista 3 · casi directa</small><p>{{ current.finalHint }}</p></div></article> }
        }

        <div class="action-stack">
          @if (current.interaction.kind !== 'word-order' && hintCount() < 2) { <button class="secondary-button" type="button" (click)="revealHint()">Revelar otra pista</button> }
          @if (current.mapUrl && hintCount() >= 2 && current.interaction.kind !== 'word-order') {
            <a class="secondary-button" [href]="current.mapUrl" target="_blank" rel="noopener noreferrer">Abrir ubicación en Google Maps</a>
            <p class="map-fallback">{{ current.interaction.locationAlt }}</p>
          }
          @if (state.progress().unlockedVideoIds.includes(current.id)) {
            <a class="primary-button" [routerLink]="['/recuerdo', current.id]">Volver a ver el recuerdo</a>
          } @else if (current.interaction.kind === 'word-order') {
          } @else if (current.validationMode === 'code-only') {
            <a class="primary-button glow" [class.disabled-link]="!interactionComplete()" [attr.aria-disabled]="!interactionComplete()" (click)="guardInteraction($event)" [routerLink]="['/escanear', current.id]" [queryParams]="{ manual: true }">Ingresar el código de la rosa</a>
          } @else {
            <a class="primary-button glow" [class.disabled-link]="!interactionComplete()" [attr.aria-disabled]="!interactionComplete()" (click)="guardInteraction($event)" [routerLink]="['/escanear', current.id]">Escanear QR</a>
            <a class="text-button centered" [class.disabled-link]="!interactionComplete()" [attr.aria-disabled]="!interactionComplete()" (click)="guardInteraction($event)" [routerLink]="['/escanear', current.id]" [queryParams]="{ manual: true }">Ingresar código manual</a>
          }
          <button class="emergency-button" type="button" (click)="showEmergency.set(!showEmergency())">No puedo continuar</button>
        </div>

        @if (showEmergency()) {
          <aside class="emergency-panel page-enter"><h2>Tranquila, no estás atrapada</h2><p>Puedes usar el código escrito junto al QR, revelar todas las pistas o continuar manualmente.</p><div class="inline-actions">
            <a class="secondary-button" [routerLink]="['/escanear', current.id]" [queryParams]="{ manual: true }">Usar código manual</a>
            @if (current.interaction.kind !== 'word-order') { <button class="secondary-button" type="button" (click)="revealAll()">Mostrar pista final</button> }
            <button class="secondary-button" type="button" (click)="continueManually()">Continuar manualmente</button>
            <button class="text-button" type="button" (click)="restore()">Restaurar capítulo actual</button>
          </div></aside>
        }
      </section>
    }
  `,
})
export class StageComponent implements OnDestroy {
  readonly state = inject(AdventureStateService);
  readonly showEmergency = signal(false);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly stage: StageConfig | undefined = this.state.stageById(this.route.snapshot.paramMap.get('id') ?? '');
  readonly hintCount = signal(this.stage ? this.state.progress().hintsUsed[this.stage.id] ?? 0 : 0);
  readonly fragments = this.state.config.stages.map((stage) => stage.fragment);
  readonly interactionComplete = signal(this.isSimpleInteraction());
  readonly interactionMessage = signal('');
  readonly orderedWords = signal<string[]>([]);
  readonly selectedWords = signal<string[]>([]);
  readonly phraseSlots = [0, 1, 2];
  readonly qualityAnswers = signal<string[]>([]);
  readonly orderedPieces = signal(['IV', 'II', 'I', 'III']);
  readonly countdownSeconds = signal(this.stage?.interaction.kind === 'fragment-order' ? 8 : 0);
  readonly countdownSkipped = signal(false);
  private countdownTimer?: number;

  constructor() {
    this.resetWords();
    if (this.state.progress().unlockedVideoIds.includes(this.stage?.id ?? '')) this.interactionComplete.set(true);
    if (this.countdownSeconds()) this.countdownTimer = window.setInterval(() => this.tickCountdown(), 1000);
  }

  ngOnDestroy(): void { if (this.countdownTimer) window.clearInterval(this.countdownTimer); }

  revealHint(): void {
    if (!this.stage || !confirm('¿Segura que quieres revelar otra pista?')) return;
    this.hintCount.set(this.state.useHint(this.stage.id));
  }
  revealAll(): void { while (this.stage && this.hintCount() < 2) this.hintCount.set(this.state.useHint(this.stage.id)); }
  restore(): void { this.state.restoreCurrentStage(); this.showEmergency.set(false); }
  continueManually(): void {
    if (!this.stage || !confirm('¿Quieres continuar sin escanear el QR?')) return;
    this.state.unlockVideo(this.stage.id); void this.router.navigate(['/recuerdo', this.stage.id]);
  }
  guardInteraction(event: Event): void {
    if (this.interactionComplete()) return;
    event.preventDefault(); this.interactionMessage.set('Completa primero la pequeña interacción de este capítulo.');
  }
  photoFilter(): string { return this.hintCount() === 0 ? 'blur(18px) saturate(.55)' : this.hintCount() === 1 ? 'blur(9px) saturate(.75)' : 'blur(2px)'; }
  resetWords(): void {
    const words = [...(this.stage?.interaction.phraseParts ?? this.stage?.interaction.phrase?.split(' ') ?? [])];
    const easierShuffle = [...words.filter((_, index) => index % 2 === 0), ...words.filter((_, index) => index % 2 !== 0)];
    this.orderedWords.set(easierShuffle);
    this.selectedWords.set([]);
    this.interactionComplete.set(this.isSimpleInteraction());
    this.interactionMessage.set('');
  }
  selectWord(index: number): void {
    const words = [...this.orderedWords()];
    const [word] = words.splice(index, 1);
    if (!word) return;
    this.orderedWords.set(words);
    this.selectedWords.update((selected) => [...selected, word]);
    this.interactionMessage.set('');
  }
  returnWord(index: number): void {
    const selected = [...this.selectedWords()];
    const [word] = selected.splice(index, 1);
    if (!word) return;
    this.selectedWords.set(selected);
    this.orderedWords.update((words) => [...words, word]);
    this.interactionComplete.set(false);
  }
  undoWord(): void {
    const lastIndex = this.selectedWords().length - 1;
    if (lastIndex >= 0) this.returnWord(lastIndex);
  }
  checkWords(): void {
    const expected = this.normalize(this.stage?.interaction.phrase ?? ''); const actual = this.normalize(this.selectedWords().join(' '));
    this.finishInteraction(expected === actual, expected === actual ? '' : 'Casi. Prueba moviendo una palabra cada vez.');
  }
  chooseQuality(index: number, quality: string): void { this.qualityAnswers.update((answers) => { const next = [...answers]; next[index] = quality; return next; }); }
  checkQualities(): void {
    const scenarios = this.stage?.interaction.scenarios ?? []; const correct = scenarios.length > 0 && scenarios.every((scenario, index) => this.qualityAnswers()[index] === scenario.quality);
    this.finishInteraction(correct, correct ? 'Empatía, fortaleza y ternura. Tres formas en que haces distinto mi mundo.' : 'No hay examen aquí. Mira cada recuerdo y prueba otra combinación.');
  }
  movePiece(index: number, direction: number): void { this.orderedPieces.update((pieces) => this.move(pieces, index, direction)); }
  checkPieces(): void { const correct = this.orderedPieces().join(',') === 'I,II,III,IV'; this.finishInteraction(correct, correct ? 'Las piezas encajan. Aun así, el centro sigue esperando.' : 'Recuerda el orden en que encontraste cada pieza.'); }
  skipCountdown(): void { this.countdownSkipped.set(true); this.countdownSeconds.set(0); if (this.countdownTimer) window.clearInterval(this.countdownTimer); }

  private finishInteraction(complete: boolean, message: string): void { this.interactionComplete.set(complete); this.interactionMessage.set(message); if (complete) navigator.vibrate?.(45); }
  private isSimpleInteraction(): boolean { return !this.stage || ['discovery', 'photo-reveal', 'homecoming'].includes(this.stage.interaction.kind); }
  private normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,]/g, '').toLowerCase().trim(); }
  private move<T>(values: T[], index: number, direction: number): T[] { const target = index + direction; if (target < 0 || target >= values.length) return values; const next = [...values]; [next[index], next[target]] = [next[target], next[index]]; return next; }
  private tickCountdown(): void { if (this.countdownSeconds() <= 1) this.skipCountdown(); else this.countdownSeconds.update((value) => value - 1); }
}
