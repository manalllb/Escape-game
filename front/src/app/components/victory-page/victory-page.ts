import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';
import { SessionStateResponse, SuiviState } from '../../services/session.service';

interface VictoryData {
  session?: SessionStateResponse | null;
  finalCode?: string;
}

interface Achievement {
  icon: string;
  label: string;
  color: string;
}

/**
 * Page de victoire affichée lorsque le code final est correct.
 * Design : design-intefaces/img969.jpg
 */
@Component({
  selector: 'app-victory-page',
  imports: [CommonModule],
  templateUrl: './victory-page.html',
  styleUrl: './victory-page.css'
})
export class VictoryPage {
  result: VictoryData = {};

  constructor(
    private gameState: GameStateService,
    private router: Router
  ) {
    this.result = (this.gameState.getGameResult() as VictoryData) || {};
  }

  get session(): SessionStateResponse | null | undefined {
    return this.result.session;
  }

  /** Temps total en secondes (somme des temps des mini-jeux). */
  get totalTime(): number {
    return (this.session?.suivis ?? []).reduce((sum, s: SuiviState) => sum + (s.temps || 0), 0);
  }

  /** Badges des mini-jeux terminés. */
  get achievements(): Achievement[] {
    const suivis = this.session?.suivis ?? [];
    return suivis
      .filter((s: SuiviState) => s.termine)
      .map((s: SuiviState) => {
        const map: Record<string, { icon: string; label: string; color: string }> = {
          tri: { icon: '✅', label: 'Tri Express Maîtrisé', color: '#22c55e' },
          sequence: { icon: '🧴', label: 'Peau Parfaite Obtenue', color: '#ec4899' },
          quiz: { icon: '🌿', label: 'Quiz Écologique Réussi', color: '#a855f7' },
        };
        const m = map[s.type] || { icon: '✅', label: s.nom, color: '#a855f7' };
        return { icon: m.icon, label: m.label, color: m.color };
      });
  }

  /** Formate un temps en mm:ss. */
  formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  /** Retourne à l'accueil et réinitialise l'état. */
  restart() {
    this.gameState.reset();
    this.router.navigate(['/']);
  }
}
