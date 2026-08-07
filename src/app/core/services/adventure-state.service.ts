import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ADVENTURE_CONFIG } from '../../config/adventure.config';
import { AdventureProgress, StageConfig, StageStatus } from '../models/adventure.models';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'nuestra-aventura.progress.v1';
const firstStageId = ADVENTURE_CONFIG.stages[0].id;

export const DEFAULT_PROGRESS: AdventureProgress = {
  version: 2,
  started: false,
  currentStageId: firstStageId,
  unlockedStageIds: [firstStageId],
  completedStageIds: [],
  unlockedVideoIds: [],
  watchedVideoIds: [],
  unlockedRewardIds: [],
  confirmedFragmentStageIds: [],
  hintsUsed: {},
  musicEnabled: false,
  returningHome: false,
  adventureCompleted: false,
};

@Injectable({ providedIn: 'root' })
export class AdventureStateService {
  private readonly storage = inject(StorageService);
  readonly config = ADVENTURE_CONFIG;
  readonly progress = signal<AdventureProgress>(this.restore(this.storage.get(STORAGE_KEY)));
  readonly completedCount = computed(() => this.progress().completedStageIds.length);
  readonly progressPercent = computed(() =>
    Math.round((this.completedCount() / this.config.stages.length) * 100),
  );

  constructor() {
    effect(() => this.storage.set(STORAGE_KEY, this.progress()));
  }

  stageById(id: string): StageConfig | undefined {
    return this.config.stages.find((stage) => stage.id === id);
  }

  statusFor(stage: StageConfig): StageStatus {
    const progress = this.progress();
    if (progress.completedStageIds.includes(stage.id)) return 'completed';
    if (!progress.unlockedStageIds.includes(stage.id)) return 'locked';
    return progress.currentStageId === stage.id ? 'in-progress' : 'available';
  }

  start(): void {
    this.progress.update((p) => ({
      ...p,
      started: true,
      startedAt: p.startedAt ?? new Date().toISOString(),
    }));
  }

  setMusic(enabled: boolean): void {
    this.progress.update((p) => ({ ...p, musicEnabled: enabled }));
  }

  useHint(stageId: string): number {
    let count = 0;
    this.progress.update((p) => {
      const stage = this.stageById(stageId);
      const maximumHints = stage?.order === 5 ? 4 : 2;
      count = Math.min((p.hintsUsed[stageId] ?? 0) + 1, maximumHints);
      return { ...p, hintsUsed: { ...p.hintsUsed, [stageId]: count } };
    });
    return count;
  }

  unlockVideo(stageId: string): void {
    this.progress.update((p) => ({
      ...p,
      unlockedVideoIds: this.addUnique(p.unlockedVideoIds, stageId),
    }));
  }

  markVideoWatched(stageId: string): void {
    this.progress.update((p) => ({
      ...p,
      watchedVideoIds: this.addUnique(p.watchedVideoIds, stageId),
    }));
  }

  completeStage(stageId: string): void {
    const stage = this.stageById(stageId);
    if (!stage) return;
    const next = this.config.stages.find((item) => item.order === stage.order + 1);
    this.progress.update((p) => ({
      ...p,
      completedStageIds: this.addUnique(p.completedStageIds, stageId),
      unlockedRewardIds: this.addUnique(p.unlockedRewardIds, stage.reward.id),
      unlockedStageIds: next ? this.addUnique(p.unlockedStageIds, next.id) : p.unlockedStageIds,
      currentStageId: next?.id ?? stageId,
    }));
  }

  confirmFragmentLetter(stageId: string): void {
    if (!this.stageById(stageId)) return;
    this.progress.update((p) => ({
      ...p,
      confirmedFragmentStageIds: this.addUnique(p.confirmedFragmentStageIds, stageId),
    }));
  }

  setReturningHome(returningHome = true): void {
    this.progress.update((p) => ({ ...p, returningHome }));
  }

  completeEpilogue(): void {
    if (this.completedCount() !== this.config.stages.length) return;
    this.progress.update((p) => ({
      ...p,
      adventureCompleted: true,
      completedAt: p.completedAt ?? new Date().toISOString(),
    }));
  }

  unlockStage(stageId: string): void {
    if (!this.stageById(stageId)) return;
    this.progress.update((p) => ({
      ...p,
      unlockedStageIds: this.addUnique(p.unlockedStageIds, stageId),
      currentStageId: stageId,
    }));
  }

  restoreCurrentStage(): void {
    const p = this.progress();
    const fallback = this.config.stages.find((s) => !p.completedStageIds.includes(s.id)) ?? this.config.stages[0];
    this.progress.update((current) => ({
      ...current,
      currentStageId: fallback.id,
      unlockedStageIds: this.addUnique(current.unlockedStageIds, fallback.id),
    }));
  }

  reset(): void {
    this.storage.remove(STORAGE_KEY);
    this.progress.set(structuredClone(DEFAULT_PROGRESS));
  }

  exportJson(): string {
    return JSON.stringify(this.progress(), null, 2);
  }

  importJson(raw: string): boolean {
    try {
      const parsed: unknown = JSON.parse(raw);
      const restored = this.restore(parsed, true);
      this.progress.set(restored);
      return true;
    } catch {
      return false;
    }
  }

  private restore(value: unknown, strict = false): AdventureProgress {
    if (!this.isValid(value)) {
      if (strict) throw new Error('Formato de progreso inválido');
      return structuredClone(DEFAULT_PROGRESS);
    }
    const ids = new Set(this.config.stages.map((stage) => stage.id));
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      ...value,
      currentStageId: ids.has(value.currentStageId) ? value.currentStageId : firstStageId,
      version: 2,
      returningHome: value.returningHome ?? false,
      unlockedStageIds: this.ensureFirst(value.unlockedStageIds.filter((id) => ids.has(id))),
      completedStageIds: value.completedStageIds.filter((id) => ids.has(id)),
      unlockedVideoIds: value.unlockedVideoIds.filter((id) => ids.has(id)),
      watchedVideoIds: value.watchedVideoIds.filter((id) => ids.has(id)),
      confirmedFragmentStageIds: Array.isArray(value.confirmedFragmentStageIds)
        ? value.confirmedFragmentStageIds.filter((id) => ids.has(id))
        : [],
    };
  }

  private isValid(value: unknown): value is AdventureProgress {
    if (!value || typeof value !== 'object') return false;
    const p = value as Partial<AdventureProgress>;
    return (
      (p.version === 1 || p.version === 2) &&
      typeof p.started === 'boolean' &&
      typeof p.currentStageId === 'string' &&
      Array.isArray(p.unlockedStageIds) &&
      Array.isArray(p.completedStageIds) &&
      Array.isArray(p.unlockedVideoIds) &&
      Array.isArray(p.watchedVideoIds) &&
      Array.isArray(p.unlockedRewardIds) &&
      (p.confirmedFragmentStageIds === undefined || Array.isArray(p.confirmedFragmentStageIds)) &&
      !!p.hintsUsed &&
      typeof p.hintsUsed === 'object' &&
      typeof p.musicEnabled === 'boolean' &&
      typeof p.adventureCompleted === 'boolean'
    );
  }

  private addUnique(values: string[], value: string): string[] {
    return values.includes(value) ? values : [...values, value];
  }

  private ensureFirst(values: string[]): string[] {
    return values.length ? values : [firstStageId];
  }
}
