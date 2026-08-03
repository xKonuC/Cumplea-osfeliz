import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FragmentConfig } from '../../core/models/adventure.models';

@Component({
  selector: 'app-fragment-board',
  template: `
    <div class="fragment-board" [class.fragment-board--assembled]="assembled" [attr.aria-label]="ariaLabel">
      @for (fragment of fragments; track fragment.id; let index = $index) {
        <button
          type="button"
          class="fragment-piece"
          [class.unlocked]="isUnlocked(fragment.id)"
          [class.selected]="selectedId === fragment.id"
          [class.new-fragment]="newFragmentId === fragment.id"
          [style.--fragment-color]="fragment.color"
          [disabled]="!isUnlocked(fragment.id)"
          (click)="select(fragment.id)"
          [attr.aria-label]="isUnlocked(fragment.id) ? 'Fragmento ' + (index + 1) + ' desbloqueado' : 'Fragmento ' + (index + 1) + ' bloqueado'"
        >
          @if (isUnlocked(fragment.id)) {
            @if (fragment.imageUrl) { <img [src]="fragment.imageUrl" alt="" /> }
            @else { <span>{{ fragment.label }}</span> }
          } @else { <span class="fragment-lock">·</span> }
        </button>
      }
      @if (showMissingCenter) {
        <div class="missing-center" aria-label="Todavía falta la pieza central"><span>?</span><small>falta una pieza</small></div>
      }
    </div>
  `,
})
export class FragmentBoardComponent {
  @Input({ required: true }) fragments: readonly FragmentConfig[] = [];
  @Input() unlockedIds: readonly string[] = [];
  @Input() selectedId = '';
  @Input() newFragmentId = '';
  @Input() assembled = false;
  @Input() showMissingCenter = false;
  @Output() readonly selectedIdChange = new EventEmitter<string>();

  get ariaLabel(): string {
    return `Composición de fragmentos. ${this.unlockedIds.length} de ${this.fragments.length} encontrados.`;
  }

  isUnlocked(id: string): boolean {
    return this.unlockedIds.includes(id);
  }

  select(id: string): void {
    if (this.isUnlocked(id)) this.selectedIdChange.emit(id);
  }
}
