import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { StageConfig } from '../../core/models/adventure.models';
import { AudioService } from '../../core/services/audio.service';

@Component({
  selector: 'app-chapters',
  imports: [RouterLink],
  template: `
    <section class="page page-enter">
      <div class="section-heading">
        <p class="eyebrow">Tu recorrido</p>
        <h1>Capítulos de nuestra historia</h1>
        <p>No tienes que recordar nada: aquí siempre sabrás cuál es el siguiente paso.</p>
      </div>

      <div class="progress-wrap narrative-progress" aria-label="Progreso general">
        <div class="progress-label"><span>Has encontrado</span><strong>{{ state.completedCount() }} de {{ state.config.stages.length }} fragmentos</strong></div>
        <div class="fragment-dots" aria-hidden="true">
          @for (stage of state.config.stages; track stage.id) { <i [class.found]="state.progress().completedStageIds.includes(stage.id)"></i> }
        </div>
      </div>

      <div class="chapter-path">
        @for (stage of state.config.stages; track stage.id; let last = $last) {
          <article class="chapter-card" [class.locked]="state.statusFor(stage) === 'locked'" [class.current]="state.statusFor(stage) === 'in-progress'">
            <div class="chapter-index">
              @switch (state.statusFor(stage)) {
                @case ('completed') { <span aria-label="Completada">✓</span> }
                @case ('locked') { <span aria-label="Bloqueada">⌁</span> }
                @default { <span>{{ stage.order }}</span> }
              }
            </div>
            <div class="chapter-copy">
              <small>{{ label(stage) }}</small>
              <h2>{{ stage.title }}</h2>
              <p>{{ stage.subtitle }}</p>
            </div>
            @if (state.statusFor(stage) !== 'locked') {
              <a class="round-link" [routerLink]="['/etapa', stage.id]" [attr.aria-label]="'Abrir ' + stage.title">→</a>
            }
          </article>
          @if (!last) { <div class="path-line"></div> }
        }
      </div>
      <a class="secondary-button full-button" routerLink="/mochila">Ver mi mochila</a>

      <aside class="test-reset-panel">
        <small>Herramienta temporal para pruebas</small>
        <p>Elimina el progreso guardado en este dispositivo y vuelve al comienzo.</p>
        <button class="danger-button full-button" type="button" (click)="resetAdventure()">Reiniciar todo</button>
      </aside>
    </section>
  `,
})
export class ChaptersComponent {
  readonly state = inject(AdventureStateService);
  private readonly router = inject(Router);
  private readonly audio = inject(AudioService);

  label(stage: StageConfig): string {
    if (stage.kind === 'homecoming') return 'Regreso a casa';
    return `Capítulo ${stage.order}`;
  }

  resetAdventure(): void {
    if (!confirm('¿Reiniciar toda la aventura? Se borrará el progreso guardado en este dispositivo.')) return;
    this.audio.setEnabled(false);
    this.state.reset();
    void this.router.navigate(['/bienvenida']);
  }
}
