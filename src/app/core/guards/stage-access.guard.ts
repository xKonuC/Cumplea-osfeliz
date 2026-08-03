import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdventureStateService } from '../services/adventure-state.service';

export const stageAccessGuard: CanActivateFn = (route) => {
  const state = inject(AdventureStateService);
  const router = inject(Router);
  const id = route.paramMap.get('id') ?? '';
  return state.progress().unlockedStageIds.includes(id)
    ? true
    : router.createUrlTree(['/capitulos']);
};
