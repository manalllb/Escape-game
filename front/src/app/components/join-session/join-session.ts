import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { GameStateService } from '../../services/game-state.service';

/**
 * Page de connexion joueur.
 * Permet de saisir le code PIN et son pseudo pour rejoindre une session.
 */
@Component({
  selector: 'app-join-session',
  imports: [CommonModule, FormsModule],
  templateUrl: './join-session.html',
  styleUrl: './join-session.css'
})
export class JoinSession {
  pin = '';
  pseudo = '';
  loading = false;
  error = '';

  constructor(
    private sessionService: SessionService,
    private gameState: GameStateService,
    private router: Router
  ) {}

  /** Nettoie le PIN pour ne garder que les chiffres (max 6). */
  onPinChange(value: string) {
    this.pin = value.replace(/\D/g, '').slice(0, 6);
  }

  /** Transforme l'erreur backend en message lisible pour le joueur. */
  private formatJoinError(err: Error & { status?: number }): string {
    switch (err.status) {
      case 404:
        return 'Ce code PIN n\'existe pas ou la session est inactive.';
      case 403:
        return 'Cette session est expirée. Contactez l\'administrateur.';
      case 400:
        return 'Veuillez saisir un code PIN et un pseudo valides.';
      default:
        return err.message || 'Une erreur inattendue est survenue. Réessayez.';
    }
  }

  /** Rejoint la session via l'API. */
  handleSubmit() {
    this.error = '';
    this.loading = true;

    this.sessionService.joinSession(this.pin, this.pseudo).subscribe({
      next: (response) => {
        this.loading = false;
        this.gameState.setSessionId(response.sessionId);
        this.gameState.setSessionPin(response.codePin);
        this.gameState.setPseudo(response.pseudo);
        this.gameState.setError('');
        this.router.navigate(['/intro']);
      },
      error: (err) => {
        this.loading = false;
        this.error = this.formatJoinError(err);
      }
    });
  }
}
