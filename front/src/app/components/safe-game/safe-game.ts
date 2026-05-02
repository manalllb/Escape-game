import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { GameStateService } from '../../services/game-state.service';

/**
 * Phase finale : Coffre-fort du laboratoire.
 * Le joueur doit assembler les fragments et saisir le code final.
 */
@Component({
  selector: 'app-safe-game',
  imports: [CommonModule, FormsModule],
  templateUrl: './safe-game.html',
  styleUrl: './safe-game.css'
})
export class SafeGame {
  // Fragments de code débloqués reçus depuis le parent
  @Input() fragments: string[] = [];
  @Input() score = 0;

  // Événements émis selon le résultat
  @Output() victory = new EventEmitter<void>();
  @Output() defeat = new EventEmitter<void>();

  value = '';
  message = '';
  saving = false;
  sessionId: number | null = null;

  constructor(
    private sessionService: SessionService,
    private gameState: GameStateService
  ) {
    this.sessionId = this.gameState.getSessionId();
  }

  /** Valide le code final auprès du backend. */
  validate() {
    if (!this.sessionId) return;
    this.saving = true;
    this.message = '';

    this.sessionService.validateCode(this.sessionId, this.value).subscribe({
      next: (response) => {
        this.saving = false;
        if (response.success) {
          this.message = 'Code correct ! Le coffre est déverrouillé.';
          this.victory.emit();
        } else {
          this.message = 'Code incorrect. La mission échoue pour le moment.';
          this.defeat.emit();
        }
      },
      error: (err) => {
        this.saving = false;
        this.message = err.message || 'Code incorrect';
        this.defeat.emit();
      }
    });
  }

}
