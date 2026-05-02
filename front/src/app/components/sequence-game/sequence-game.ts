import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiniJeuService, SequenceContent, SequenceStep } from '../../services/minijeu.service';
import { SessionService } from '../../services/session.service';

interface StepConfig {
  color: string;
  icon: string;
  label: string;
}

const STEP_CONFIG: Record<number, StepConfig> = {
  1: { color: '#3b9dff', icon: '💧', label: 'Nettoyant' },
  2: { color: '#00d084', icon: '🌿', label: 'Gommage' },
  3: { color: '#ff69b4', icon: '🌸', label: 'Tonique' },
  4: { color: '#c084fc', icon: '🌟', label: 'Sérum' },
  5: { color: '#ffc107', icon: '☀️', label: 'Crème' },
};

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

/**
 * Mini-jeu 2 : Mission Peau Parfaite.
 * Le joueur doit appliquer les 5 produits de soin sur le visage
 * dans l'ordre numérique (1 → 5). 3 erreurs max.
 */
@Component({
  selector: 'app-sequence-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sequence-game.html',
  styleUrl: './sequence-game.css',
})
export class SequenceGame implements OnInit, OnDestroy {
  @Input() sessionId!: number;
  @Input() miniJeuId = 2;
  @Output() complete = new EventEmitter<void>();
  @Output() defeat = new EventEmitter<void>();

  game: SequenceContent | null = null;
  choices: SequenceStep[] = [];
  appliedSteps: SequenceStep[] = [];
  error = '';
  saving = false;

  currentStep = 0;   // combien d'étapes correctement appliquées (0-5)
  mistakes = 0;      // nombre d'erreurs (0-3)
  maxMistakes = 3;
  totalSteps = 5;
  lastWrongId: number | null = null;

  // exposé au template
  floor = Math.floor;

  gameActive = false;
  gameOver = false;
  won = false;
  defeatReason: 'mistakes' | 'timeout' = 'mistakes';
  startedAt = 0;
  elapsed = 0;
  timeLimit = 180; // 3 minutes
  remainingTime = 180;

  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private miniJeuService: MiniJeuService,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    this.loadGame();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  /** Charge le contenu et mélange les étapes. */
  loadGame() {
    this.error = '';
    this.miniJeuService.getContenu(this.miniJeuId).subscribe({
      next: (data) => {
        this.game = data as SequenceContent;

        const etapes = this.game.etapes || [];
        console.log('etapes', etapes);
        this.choices = shuffle(etapes);
        console.log('Étapes chargées :', this.choices);
        this.appliedSteps = [];
        this.currentStep = 0;
        this.mistakes = 0;
        this.gameActive = false;
        this.gameOver = false;
        this.won = false;
        this.elapsed = 0;
        this.remainingTime = this.timeLimit;
      },
      error: (err) => {
        this.error = err.message;
      },
    });
  }

  /** Démarre la partie. */
  startGame() {
    this.gameActive = true;
    this.gameOver = false;
    this.won = false;
    this.currentStep = 0;
    this.mistakes = 0;
    this.appliedSteps = [];
    this.choices = shuffle(this.game?.etapes || []);
    this.startedAt = Date.now();
    this.elapsed = 0;
    this.remainingTime = this.timeLimit;

    this.timerId = setInterval(() => {
      this.elapsed++;
      this.remainingTime--;
      if (this.remainingTime <= 0 && this.gameActive) {
        this.endGame(false, 'timeout');
      }
    }, 1000);
  }

  /** Retourne la config visuelle (couleur, icône, label) pour un ordre donné. */
  getStepConfig(ordre: number): StepConfig {
    return STEP_CONFIG[ordre] ?? { color: '#a855f7', icon: '✨', label: 'Produit' };
  }

  /** Retourne les étapes déjà appliquées dans l'ordre. */
  getAppliedOrdered(): SequenceStep[] {
    return [...this.appliedSteps].sort((a, b) => a.ordreAttendu - b.ordreAttendu);
  }

  /** Vérifie si une étape a déjà été appliquée. */
  isApplied(step: SequenceStep): boolean {
    return this.appliedSteps.some((s) => s.id === step.id);
  }

  /** Quand le joueur clique sur un produit. */
  onSelectProduct(step: SequenceStep) {
    if (!this.gameActive || this.isApplied(step)) return;

    const expectedOrder = this.currentStep + 1;
    if (step.ordreAttendu === expectedOrder) {
      // Bon ordre
      this.appliedSteps = [...this.appliedSteps, step];
      this.currentStep++;
      if (this.currentStep >= this.totalSteps) {
        this.endGame(true);
      }
    } else {
      // Mauvais ordre
      this.mistakes++;
      this.lastWrongId = step.id;
      setTimeout(() => {
        if (this.lastWrongId === step.id) {
          this.lastWrongId = null;
        }
      }, 400);
      if (this.mistakes >= this.maxMistakes) {
        this.endGame(false, 'mistakes');
      }
    }
  }

  /** Termine la partie. */
  private endGame(won: boolean, reason?: 'mistakes' | 'timeout') {
    this.gameActive = false;
    this.gameOver = true;
    this.won = won;
    this.defeatReason = reason ?? 'mistakes';
    this.stopTimer();

    setTimeout(() => {
      if (won) {
        this.submitResult();
      } else {
        this.submitFailure(this.defeatReason);
      }
    }, won ? 2500 : 800);
  }

  /** Soumet le résultat au backend. */
  private submitResult() {
    if (this.saving) return;
    this.saving = true;
    this.sessionService
      .completeMiniJeu(
        this.sessionId,
        this.miniJeuId,
        this.currentStep,
        this.elapsed,
        0,
        0
      )
      .subscribe({
        next: () => {
          this.complete.emit();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.message;
        },
      });
  }

  /** Ferme la session en cas de défaite. */
  private submitFailure(_reason: 'mistakes' | 'timeout') {
    if (this.saving) return;
    this.saving = true;
    this.sessionService.failSession(this.sessionId).subscribe({
      next: () => {
        this.defeat.emit();
      },
      error: () => {
        this.defeat.emit();
      },
    });
  }

  private stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /** Formate un temps en mm:ss. */
  formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
