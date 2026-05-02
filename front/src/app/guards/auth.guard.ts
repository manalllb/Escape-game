import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';

/**
 * Garde de route qui empêche l'accès au tableau de bord admin
 * si aucun token d'authentification n'est présent.
 */
export const authGuard: CanActivateFn = () => {
  const gameState = inject(GameStateService);
  const router = inject(Router);

  if (gameState.getToken()) {
    return true;
  }

  router.navigate(['/admin-login']);
  return false;
};
