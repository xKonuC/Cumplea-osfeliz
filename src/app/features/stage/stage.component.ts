import { Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { StageConfig } from '../../core/models/adventure.models';
import { FragmentBoardComponent } from '../../shared/fragment-board/fragment-board.component';

@Component({
  selector: 'app-stage',
  imports: [RouterLink, ReactiveFormsModule, FragmentBoardComponent],
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
              @if (!assemblyStarted()) {
                <p class="interaction-kicker">Las respuestas están en tus manos</p>
                <p>Saca las seis piezas que guardaste durante el día. La página no te mostrará lo que forman: tienes que descubrirlo con los fragmentos reales.</p>
                <button class="primary-button full-button" type="button" (click)="startAssembly()">Tengo todos los fragmentos</button>
              } @else if (!phraseSolved()) {
                <div class="assembly-challenge page-enter">
                  <p class="interaction-kicker">Júntalos</p>
                  <h2>Busca la forma en que encajan</h2>
                  <p>No importa el orden en que los encontraste.</p>
                  <p>Muévelos, gíralos y busca la forma en que todos encajan.</p>
                  <p>Cuando lo logres, mira con atención lo que forman.</p>
                  <form class="assembly-answer" (submit)="checkFinalPhrase($event)">
                    <label for="fragmentPhrase">¿Qué dicen tus fragmentos?</label>
                    <input
                      id="fragmentPhrase"
                      type="text"
                      [formControl]="finalPhrase"
                      placeholder="Escribe aquí"
                      autocomplete="off"
                      autocapitalize="characters"
                      (input)="clearAssemblyMessage()"
                    />
                    <button class="primary-button" type="submit">Comprobar</button>
                  </form>
                  @if (assemblyMessage()) {
                    <p class="assembly-feedback" role="status">{{ assemblyMessage() }}</p>
                  }
                </div>
              } @else if (!returnMessageShown()) {
                <div class="phrase-reveal page-enter" aria-live="polite">
                  <p class="phrase-reveal__letters" aria-label="Mi vida">
                    @for (letter of revealLetters; track $index) {
                      <span [style.--letter-index]="$index">{{ letter === ' ' ? ' ' : letter }}</span>
                    }
                  </p>
                  <h2>Sí.</h2>
                  <p>Eso era lo que llevabas contigo durante toda esta aventura.</p>
                  <p>Porque entre todos los lugares, regalos, pistas y vueltas que dimos hoy, había algo que quería decirte desde el principio.</p>
                  <p class="phrase-reveal__personal">Eres una parte demasiado importante de mi vida, Kathia.</p>
                  <p>Y quería que hoy lo descubrieras de una forma que pudieras recordar.</p>
                </div>
              } @else {
                <div class="homecoming-message page-enter" aria-live="polite">
                  <p class="eyebrow">Ahora sí…</p>
                  <h2>Ya no queda nada más que buscar afuera.</h2>
                  <p>Guarda bien tus seis fragmentos.</p>
                  <p>Y vuelve a casa.</p>
                </div>
              }
            }
            @default {
              @if (current.order === 3) {
                <p class="interaction-kicker">El destino está en la pista</p>
                <p>Lee cada detalle con calma. Si lo necesitas, puedes revelar pistas cada vez más claras.</p>
              } @else if (current.order === 4) {
                <p class="interaction-kicker">Un antojo guarda la señal</p>
                <p>Piensa en ese lugar favorito al que volverías solo por algo dulce. Las pistas te llevarán hasta lo que te espera.</p>
              } @else if (current.order === 5) {
                <p class="interaction-kicker">Algo viajó contigo</p>
                <p>No tienes que ir más lejos. Revela las pistas una por una y piensa en todo el recorrido de hoy.</p>
              } @else {
                <p class="interaction-kicker">Observa con calma</p><p>La primera pista está en tu casa. cualquier cosa las pistas te acompañarán.</p>
              }
            }
          }
          @if (interactionMessage()) { <p class="interaction-message" [class.complete]="interactionComplete()" role="status">{{ interactionMessage() }}</p> }
        </section>

        @if (current.order === 5) {
          @if (hintCount() >= 1) {
            <article class="hint-card page-enter">
              <div class="hint-icon" aria-hidden="true">✦</div><div><small>Pista 1 · sutil</small><p>{{ current.primaryHint }}</p></div>
            </article>
          }
          @if (hintCount() >= 2) {
            <article class="hint-card secondary-hint page-enter"><div class="hint-icon">◇</div><div><small>Pista 2 · más cerca</small><p>{{ current.secondaryHint }}</p></div></article>
          }
          @if (hintCount() >= 3) {
            <article class="hint-card secondary-hint page-enter"><div class="hint-icon">○</div><div><small>Pista 3 · piensa en el recorrido</small><p>{{ current.tertiaryHint }}</p></div></article>
          }
          @if (hintCount() >= 4) {
            <article class="hint-card final-hint page-enter"><div class="hint-icon">◎</div><div><small>Pista final</small><p>{{ current.finalHint }}</p></div></article>
            <article class="destination-reveal page-enter" aria-live="polite">
              <div class="destination-reveal__seal" aria-hidden="true">♡</div>
              <small>La respuesta estuvo cerca todo este tiempo</small>
              <h2>{{ current.interaction.destinationName }}</h2>
              <p>{{ current.interaction.arrivalInstruction }}</p>
            </article>
          }
        } @else if (current.interaction.kind !== 'word-order' && current.order !== 6) {
          <article class="hint-card">
            <div class="hint-icon" aria-hidden="true">✦</div><div><small>Pista 1 · sutil</small><p>{{ current.primaryHint }}</p></div>
          </article>
          @if (hintCount() >= 1) { <article class="hint-card secondary-hint page-enter"><div class="hint-icon">◇</div><div><small>Pista 2 · clara</small><p>{{ current.secondaryHint }}</p></div></article> }
          @if (hintCount() >= 2) { <article class="hint-card final-hint page-enter"><div class="hint-icon">◎</div><div><small>Pista 3 · casi directa</small><p>{{ current.finalHint }}</p></div></article> }
        }

        <div class="action-stack">
          @if (current.order === 5 && hintCount() < 4) {
            <button class="secondary-button" type="button" (click)="revealHint()">{{ hintCount() === 0 ? 'Revelar primera pista' : 'Revelar otra pista' }}</button>
          } @else if (current.order !== 5 && current.order !== 6 && current.interaction.kind !== 'word-order' && hintCount() < 2) {
            <button class="secondary-button" type="button" (click)="revealHint()">Revelar otra pista</button>
          }
          @if (current.mapUrl && hintCount() >= 2 && current.interaction.kind !== 'word-order') {
            <a class="secondary-button" [href]="current.mapUrl" target="_blank" rel="noopener noreferrer">Abrir ubicación en Google Maps</a>
            <p class="map-fallback">{{ current.interaction.locationAlt }}</p>
          }
          @if (current.order === 6) {
            @if (phraseSolved() && !returnMessageShown()) {
              <button class="primary-button glow" type="button" (click)="showReturnMessage()">Continuar</button>
            } @else if (returnMessageShown()) {
              <button class="primary-button glow home-button" type="button" (click)="returnHome()">Volver a casa ❤️</button>
            }
          } @else if (state.progress().unlockedVideoIds.includes(current.id)) {
            <a class="primary-button" [routerLink]="['/recuerdo', current.id]">Volver a ver el recuerdo</a>
          } @else if (current.interaction.kind === 'word-order') {
          } @else if (current.order === 5 && hintCount() < 4) {
          } @else if (current.validationMode === 'code-only') {
            <a class="primary-button glow" [class.disabled-link]="!interactionComplete()" [attr.aria-disabled]="!interactionComplete()" (click)="guardInteraction($event)" [routerLink]="['/escanear', current.id]" [queryParams]="{ manual: true }">Ingresar el código de la rosa</a>
          } @else {
            <a class="primary-button glow" [class.disabled-link]="!interactionComplete()" [attr.aria-disabled]="!interactionComplete()" (click)="prepareScanner($event)" [routerLink]="['/escanear', current.id]">
              {{ current.order === 3 || current.order === 4 || current.order === 5 ? 'Ya lo encontré' : 'Escanear QR' }}
            </a>
            <a class="text-button centered" [class.disabled-link]="!interactionComplete()" [attr.aria-disabled]="!interactionComplete()" (click)="prepareScanner($event)" [routerLink]="['/escanear', current.id]" [queryParams]="{ manual: true }">
              Ingresar código manual
            </a>
          }
          @if (current.order !== 6) {
            <button class="emergency-button" type="button" (click)="showEmergency.set(!showEmergency())">No puedo continuar</button>
          }
        </div>

        @if (returnTransition()) {
          <div class="homecoming-transition" aria-hidden="true"></div>
        }

        @if (showEmergency()) {
          <aside class="emergency-panel page-enter"><h2>Tranquila, no estás atrapada</h2><p>Puedes usar el código escrito junto al QR, revelar todas las pistas o continuar manualmente.</p><div class="inline-actions">
            <a class="secondary-button" [routerLink]="['/escanear', current.id]" [queryParams]="{ manual: true }" (click)="prepareScanner($event)">Usar código manual</a>
            @if (current.interaction.kind !== 'word-order') { <button class="secondary-button" type="button" (click)="revealAll()">Mostrar pista final</button> }
            <button class="secondary-button" type="button" (click)="continueManually()">Continuar manualmente</button>
            <button class="text-button" type="button" (click)="restore()">Restaurar capítulo actual</button>
          </div></aside>
        }

        @if (activeDialog(); as dialog) {
          <div class="story-dialog-backdrop" (click)="closeDialog()" (keydown.escape)="closeDialog()">
            <section
              class="story-dialog"
              [class.story-dialog--warning]="dialog === 'early-warning' || dialog === 'bag-warning' || dialog === 'dessert-warning' || dialog === 'envelope-warning'"
              role="dialog"
              aria-modal="true"
              [attr.aria-labelledby]="dialog + '-title'"
              (click)="$event.stopPropagation()"
            >
              @switch (dialog) {
                @case ('hint') {
                  <div class="story-dialog__icon" aria-hidden="true">✦</div>
                  <p class="eyebrow">Una ayuda extra</p>
                  <h2 id="hint-title">¿Quieres revelar otra pista?</h2>
                  <p>Cada pista será un poco más clara, pero todavía puedes intentar descubrirlo por tu cuenta.</p>
                  <div class="story-dialog__actions">
                    <button #dialogPrimary class="primary-button" type="button" (click)="confirmHint()">Sí, revelar pista</button>
                    <button class="secondary-button" type="button" (click)="closeDialog()">Seguir intentando</button>
                  </div>
                }
                @case ('manual') {
                  <div class="story-dialog__icon" aria-hidden="true">◇</div>
                  <p class="eyebrow">Alternativa disponible</p>
                  <h2 id="manual-title">¿Quieres continuar manualmente?</h2>
                  <p>Podrás seguir con la aventura sin validar esta señal.</p>
                  <div class="story-dialog__actions">
                    <button #dialogPrimary class="primary-button" type="button" (click)="confirmManualContinuation()">Continuar manualmente</button>
                    <button class="secondary-button" type="button" (click)="closeDialog()">Volver</button>
                  </div>
                }
                @case ('bag-warning') {
                  <div class="story-dialog__icon story-dialog__icon--warning" aria-hidden="true">!</div>
                  <p class="eyebrow">Ya llegaste</p>
                  <h2 id="bag-warning-title">Todavía no lo abras</h2>
                  <p class="story-dialog__warning-copy">Antes de abrirlo, mira con mucha atención por fuera. <strong>La siguiente señal está esperando ahí.</strong></p>
                  <div class="story-dialog__rule"><span aria-hidden="true">⌕</span><p>Busca el QR por fuera y escanéalo primero.</p></div>
                  <div class="story-dialog__actions">
                    <button #dialogPrimary class="primary-button" type="button" (click)="continueToScanner()">Buscar y escanear la señal</button>
                    <button class="secondary-button" type="button" (click)="closeDialog()">Todavía no</button>
                  </div>
                }
                @case ('early-warning') {
                  <div class="story-dialog__icon story-dialog__icon--warning" aria-hidden="true">!</div>
                  <p class="eyebrow">Una regla importante</p>
                  <h2 id="early-warning-title">No lo abras por nada del mundo</h2>
                  <p class="story-dialog__warning-copy">Cuando encuentres lo que te espera, <strong>debes mantenerlo completamente cerrado</strong>. Si lo abres antes de que la aventura te lo indique, pierdes esta parte de la historia.</p>
                  <div class="story-dialog__rule"><span aria-hidden="true">♡</span><p>Encuéntralo, mantenlo cerrado y vuelve a esta página.</p></div>
                  <div class="story-dialog__actions">
                    <button #dialogPrimary class="primary-button" type="button" (click)="closeDialog()">Entendido, no lo abriré</button>
                  </div>
                }
                @case ('dessert-warning') {
                  <div class="story-dialog__icon story-dialog__icon--warning" aria-hidden="true">!</div>
                  <p class="eyebrow">Antes del primer bocado</p>
                  <h2 id="dessert-warning-title">Todavía no lo pruebes</h2>
                  <p class="story-dialog__warning-copy">Antes de abrirlo o probarlo, <strong>mira con mucha atención el envase por fuera</strong>. La siguiente señal está esperando ahí.</p>
                  <div class="story-dialog__rule"><span aria-hidden="true">⌕</span><p>Busca el QR, escanéalo primero y después disfruta tu cheesecake.</p></div>
                  <div class="story-dialog__actions">
                    <button #dialogPrimary class="primary-button" type="button" (click)="continueToScanner()">Buscar y escanear la señal</button>
                    <button class="secondary-button" type="button" (click)="closeDialog()">Todavía no</button>
                  </div>
                }
                @case ('envelope-warning') {
                  <div class="story-dialog__icon story-dialog__icon--warning" aria-hidden="true">!</div>
                  <p class="eyebrow">Antes de abrir el sobre</p>
                  <h2 id="envelope-warning-title">Todavía no lo abras</h2>
                  <p class="story-dialog__warning-copy">Cuando lo encuentres, <strong>mira muy bien por fuera antes de abrirlo</strong>. Aún guarda una señal para ti.</p>
                  <div class="story-dialog__rule"><span aria-hidden="true">⌕</span><p>Busca el QR por fuera y escanéalo primero.</p></div>
                  <div class="story-dialog__actions">
                    <button #dialogPrimary class="primary-button" type="button" (click)="continueToScanner()">Buscar y escanear la señal</button>
                    <button class="secondary-button" type="button" (click)="closeDialog()">Seguir buscando</button>
                  </div>
                }
              }
            </section>
          </div>
        }
      </section>
    }
  `,
})
export class StageComponent implements OnDestroy {
  @ViewChild('dialogPrimary') dialogPrimary?: ElementRef<HTMLButtonElement>;
  readonly state = inject(AdventureStateService);
  readonly showEmergency = signal(false);
  readonly activeDialog = signal<'hint' | 'manual' | 'early-warning' | 'bag-warning' | 'dessert-warning' | 'envelope-warning' | null>(null);
  readonly pendingManualScanner = signal(false);
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
  readonly assemblyStarted = signal(false);
  readonly phraseSolved = signal(false);
  readonly returnMessageShown = signal(false);
  readonly returnTransition = signal(false);
  readonly assemblyMessage = signal('');
  readonly finalPhrase = new FormControl('', { nonNullable: true });
  readonly revealLetters = [...'MI VIDA'];
  private countdownTimer?: number;
  private dialogFocusTimer?: number;
  private returnTimer?: number;

  constructor() {
    this.resetWords();
    if (this.state.progress().unlockedVideoIds.includes(this.stage?.id ?? '')) this.interactionComplete.set(true);
    if (this.countdownSeconds()) this.countdownTimer = window.setInterval(() => this.tickCountdown(), 1000);
    if (this.stage?.order === 3) this.openDialog('early-warning');
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) window.clearInterval(this.countdownTimer);
    if (this.dialogFocusTimer) window.clearTimeout(this.dialogFocusTimer);
    if (this.returnTimer) window.clearTimeout(this.returnTimer);
  }

  startAssembly(): void {
    this.assemblyStarted.set(true);
    window.setTimeout(() => document.getElementById('fragmentPhrase')?.focus(), 0);
  }

  checkFinalPhrase(event?: Event): void {
    event?.preventDefault();
    const value = this.finalPhrase.value.trim().replace(/\s+/g, ' ').toLocaleUpperCase('es');
    if (value !== 'MI VIDA') {
      this.assemblyMessage.set('Casi. Mira nuevamente cómo están acomodadas las piezas. Todas tienen un lugar.');
      return;
    }
    if (!this.stage) return;
    this.assemblyMessage.set('');
    this.finalPhrase.setValue('MI VIDA');
    this.phraseSolved.set(true);
    this.state.confirmFragmentLetter(this.stage.id);
    this.state.completeStage(this.stage.id);
    navigator.vibrate?.([60, 35, 90]);
  }

  clearAssemblyMessage(): void {
    if (this.assemblyMessage()) this.assemblyMessage.set('');
  }

  showReturnMessage(): void {
    this.returnTransition.set(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.returnTimer = window.setTimeout(() => {
      this.returnTransition.set(false);
      this.returnMessageShown.set(true);
    }, reducedMotion ? 0 : 1800);
  }

  returnHome(): void {
    this.state.setReturningHome();
    void this.router.navigate(['/epilogo']);
  }

  revealHint(): void {
    if (!this.stage) return;
    if (this.stage.order === 5) {
      this.hintCount.set(this.state.useHint(this.stage.id));
      return;
    }
    this.openDialog('hint');
  }
  confirmHint(): void {
    if (!this.stage) return;
    this.hintCount.set(this.state.useHint(this.stage.id));
    this.closeDialog();
  }
  revealAll(): void {
    const target = this.stage?.order === 5 ? 4 : 2;
    while (this.stage && this.hintCount() < target) this.hintCount.set(this.state.useHint(this.stage.id));
  }
  restore(): void { this.state.restoreCurrentStage(); this.showEmergency.set(false); }
  continueManually(): void {
    if (!this.stage) return;
    this.openDialog('manual');
  }
  confirmManualContinuation(): void {
    if (!this.stage) return;
    this.closeDialog();
    this.state.unlockVideo(this.stage.id); void this.router.navigate(['/recuerdo', this.stage.id]);
  }
  prepareScanner(event: Event): void {
    if (!this.interactionComplete()) {
      this.guardInteraction(event);
      return;
    }
    if (this.stage?.order !== 3 && this.stage?.order !== 4 && this.stage?.order !== 5) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLAnchorElement | null;
    this.pendingManualScanner.set(target?.search.includes('manual=true') ?? false);
    this.openDialog(this.stage.order === 3 ? 'bag-warning' : this.stage.order === 4 ? 'dessert-warning' : 'envelope-warning');
  }
  continueToScanner(): void {
    if (!this.stage) return;
    const manual = this.pendingManualScanner();
    this.closeDialog();
    void this.router.navigate(['/escanear', this.stage.id], { queryParams: manual ? { manual: true } : undefined });
  }
  closeDialog(): void {
    this.activeDialog.set(null);
    this.pendingManualScanner.set(false);
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
  private openDialog(dialog: 'hint' | 'manual' | 'early-warning' | 'bag-warning' | 'dessert-warning' | 'envelope-warning'): void {
    this.activeDialog.set(dialog);
    if (this.dialogFocusTimer) window.clearTimeout(this.dialogFocusTimer);
    this.dialogFocusTimer = window.setTimeout(() => this.dialogPrimary?.nativeElement.focus(), 0);
  }
  private isSimpleInteraction(): boolean { return !this.stage || ['discovery', 'photo-reveal', 'homecoming'].includes(this.stage.interaction.kind); }
  private normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,]/g, '').toLowerCase().trim(); }
  private move<T>(values: T[], index: number, direction: number): T[] { const target = index + direction; if (target < 0 || target >= values.length) return values; const next = [...values]; [next[index], next[target]] = [next[target], next[index]]; return next; }
  private tickCountdown(): void { if (this.countdownSeconds() <= 1) this.skipCountdown(); else this.countdownSeconds.update((value) => value - 1); }
}
