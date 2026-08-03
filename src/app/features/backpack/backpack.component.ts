import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { FragmentBoardComponent } from '../../shared/fragment-board/fragment-board.component';

@Component({
  selector: 'app-backpack',
  imports: [RouterLink, FragmentBoardComponent],
  template: `
    <section class="page page-enter backpack-page">
      <a class="back-link" routerLink="/capitulos">← Volver al recorrido</a>
      <div class="section-heading">
        <p class="eyebrow">La composición</p>
        <h1>Tus fragmentos</h1>
        <p>Cada pieza guarda un momento. El mensaje completo permanecerá oculto hasta el capítulo seis.</p>
      </div>

      <div class="backpack-summary">
        <div class="bag-illustration" aria-hidden="true">◇</div>
        <div><strong>{{ state.progress().unlockedRewardIds.length }} de 6</strong><span>fragmentos encontrados</span></div>
      </div>

      <app-fragment-board
        [fragments]="fragments"
        [unlockedIds]="state.progress().unlockedRewardIds"
        [selectedId]="selectedId"
        [assembled]="state.completedCount() === 6"
        (selectedIdChange)="selectedId = $event"
      />

      <div class="reward-grid">
        @for (stage of state.config.stages; track stage.reward.id) {
          <article class="reward-card" [class.reward-locked]="!isUnlocked(stage.reward.id)">
            <div class="reward-icon">{{ isUnlocked(stage.reward.id) ? stage.reward.icon : '·' }}</div>
            <small>Capítulo {{ stage.order }}</small>
            <h2>{{ isUnlocked(stage.reward.id) ? stage.reward.name : 'Recuerdo por descubrir' }}</h2>
            <p>{{ isUnlocked(stage.reward.id) ? stage.reward.description : 'Sigue la aventura para desbloquearlo.' }}</p>
          </article>
        }
      </div>
    </section>
  `,
})
export class BackpackComponent {
  readonly state = inject(AdventureStateService);
  readonly fragments = this.state.config.stages.map((stage) => stage.fragment);
  selectedId = '';

  isUnlocked(id: string): boolean {
    return this.state.progress().unlockedRewardIds.includes(id);
  }
}
