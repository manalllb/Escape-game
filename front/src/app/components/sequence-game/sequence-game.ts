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
}

const STEP_CONFIG: Record<number, StepConfig> = {
  1: { color: '#3b9dff', icon: '💧' },
  2: { color: '#00d084', icon: '🌿' },
  3: { color: '#ff69b4', icon: '🌸' },
  4: { color: '#c084fc', icon: '🌟' },
  5: { color: '#ffc107', icon: '☀️' },
};

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

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

  currentStep = 0;
  mistakes = 0;
  maxMistakes = 3;
  totalSteps = 5;
  lastWrongId: number | null = null;

  floor = Math.floor;

  gameActive = false;
  gameOver = false;
  won = false;
  defeatReason: 'mistakes' | 'timeout' = 'mistakes';
  startedAt = 0;
  elapsed = 0;
  timeLimit = 180;
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

  loadGame() {
    this.error = '';
    this.miniJeuService.getContenu(this.miniJeuId).subscribe({
      next: (data) => {
        this.game = data as SequenceContent;

        const etapes = this.game.etapes || [];
        this.totalSteps = etapes.length || 5;
        this.choices = shuffle(etapes);
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

  startGame() {
    this.gameActive = true;
    this.gameOver = false;
    this.won = false;
    this.currentStep = 0;
    this.mistakes = 0;
    this.appliedSteps = [];
    const etapes = this.game?.etapes || [];
    this.totalSteps = etapes.length || 5;
    this.choices = shuffle(etapes);
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

  getStepConfig(ordre: number): StepConfig {
    return STEP_CONFIG[ordre] ?? { color: '#a855f7', icon: '✨' };
  }

  getAppliedOrdered(): SequenceStep[] {
    return [...this.appliedSteps].sort((a, b) => a.ordreAttendu - b.ordreAttendu);
  }

  isApplied(step: SequenceStep): boolean {
    return this.appliedSteps.some((s) => s.id === step.id);
  }

  onSelectProduct(step: SequenceStep) {
    if (!this.gameActive || this.isApplied(step)) return;

    const expectedOrder = this.currentStep + 1;
    if (step.ordreAttendu === expectedOrder) {
      this.appliedSteps = [...this.appliedSteps, step];
      this.currentStep++;
      if (this.currentStep >= this.totalSteps) {
        this.endGame(true);
      }
    } else {
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

  formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
