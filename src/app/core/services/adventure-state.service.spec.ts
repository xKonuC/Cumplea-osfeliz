import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ADVENTURE_CONFIG } from '../../config/adventure.config';
import { AdventureStateService } from './adventure-state.service';

describe('AdventureStateService', () => {
  let service: AdventureStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdventureStateService);
  });

  it('empieza con solo el primer capítulo desbloqueado', () => {
    expect(service.progress().unlockedStageIds).toEqual([ADVENTURE_CONFIG.stages[0].id]);
    expect(service.progress().completedStageIds).toEqual([]);
  });

  it('completar un capítulo entrega el fragmento y desbloquea el siguiente', () => {
    const first = ADVENTURE_CONFIG.stages[0];
    const second = ADVENTURE_CONFIG.stages[1];
    service.completeStage(first.id);
    expect(service.progress().completedStageIds).toContain(first.id);
    expect(service.progress().unlockedRewardIds).toContain(first.reward.id);
    expect(service.progress().unlockedStageIds).toContain(second.id);
    expect(service.progress().currentStageId).toBe(second.id);
  });

  it('solo completa la aventura después de reunir seis fragmentos y abrir el epílogo', () => {
    service.completeEpilogue();
    expect(service.progress().adventureCompleted).toBe(false);
    for (const stage of ADVENTURE_CONFIG.stages) service.completeStage(stage.id);
    service.completeEpilogue();
    expect(service.progress().adventureCompleted).toBe(true);
  });

  it('rechaza una importación dañada sin alterar el progreso', () => {
    const before = service.exportJson();
    expect(service.importJson('{"version":99}')).toBe(false);
    expect(service.exportJson()).toBe(before);
  });
});
