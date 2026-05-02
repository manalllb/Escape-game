import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiniJeuService, QuizContent, QuizQuestion } from '../../services/minijeu.service';
import { SessionService } from '../../services/session.service';

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const LETTERS = ['A', 'B', 'C', 'D'];

/**
 * Mini-jeu 3 : L'Énigme Écologique.
 * Quiz à choix multiples. Seuil de victoire = ceil(5/2) = 3 bonnes réponses.
 */
@Component({
  selector: 'app-quiz-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-game.html',
  styleUrl: './quiz-game.css',
})
export class QuizGame implements OnInit, OnDestroy {
  @Input() sessionId!: number;
  @Input() miniJeuId = 3;
  @Output() complete = new EventEmitter<void>();
  @Output() defeat = new EventEmitter<void>();

  quiz: QuizContent | null = null;
  index = 0;
  score = 0;
  currentChoices: string[] = [];
  currentQuestion: QuizQuestion | null = null;

  error = '';
  saving = false;

  gameActive = false;
  gameOver = false;
  won = false;
  defeatReason: 'score' | 'timeout' = 'score';

  // exposé au template
  ceil = Math.ceil;

  showingFeedback = false;
  lastAnswerCorrect: boolean | null = null;

  elapsed = 0;
  timeLimit = 180; // 3 minutes
  remainingTime = 180;

  private timerId: ReturnType<typeof setInterval> | null = null;
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private miniJeuService: MiniJeuService,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    this.loadQuiz();
  }

  ngOnDestroy() {
    this.stopTimer();
    if (this.feedbackTimeoutId) {
      clearTimeout(this.feedbackTimeoutId);
    }
  }

  /** Charge les questions du quiz. */
  loadQuiz() {
    this.error = '';
    this.miniJeuService.getContenu(this.miniJeuId).subscribe({
      next: (data) => {
        this.quiz = data as QuizContent;
        this.index = 0;
        this.score = 0;
        this.gameActive = false;
        this.gameOver = false;
        this.won = false;
        this.elapsed = 0;
        this.remainingTime = this.timeLimit;
        this.setCurrentQuestion();
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
    this.index = 0;
    this.score = 0;
    this.elapsed = 0;
    this.remainingTime = this.timeLimit;
    this.setCurrentQuestion();

    this.timerId = setInterval(() => {
      this.elapsed++;
      this.remainingTime--;
      if (this.remainingTime <= 0 && this.gameActive) {
        this.endGame(false, 'timeout');
      }
    }, 1000);
  }

  /** Prépare la question actuelle et mélange ses choix une seule fois. */
  private setCurrentQuestion() {
    const q = this.quiz?.questions?.[this.index] ?? null;
    this.currentQuestion = q;
    if (q) {
      this.currentChoices = shuffle([
        q.bonneReponse,
        ...q.mauvaisesReponses,
      ]);
    } else {
      this.currentChoices = [];
    }
  }

  /** Gère la réponse du joueur avec feedback visuel. */
  handleAnswer(choice: string) {
    if (!this.currentQuestion || !this.gameActive || this.showingFeedback || this.saving) return;

    const isCorrect = choice === this.currentQuestion.bonneReponse;
    if (isCorrect) {
      this.score++;
    }

    this.lastAnswerCorrect = isCorrect;
    this.showingFeedback = true;

    this.feedbackTimeoutId = setTimeout(() => {
      this.showingFeedback = false;
      this.lastAnswerCorrect = null;

      const isLast = this.index >= (this.quiz?.questions?.length ?? 0) - 1;
      if (isLast) {
        const seuil = Math.ceil((this.quiz?.questions?.length ?? 5) / 2);
        this.endGame(this.score >= seuil, 'score');
      } else {
        this.index++;
        this.setCurrentQuestion();
      }
    }, 1200);
  }

  /** Termine la partie. */
  private endGame(won: boolean, reason?: 'score' | 'timeout') {
    this.gameActive = false;
    this.gameOver = true;
    this.won = won;
    this.defeatReason = reason ?? 'score';
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
        this.score,
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
  private submitFailure(_reason: 'score' | 'timeout') {
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

  /** Lettres A/B/C/D. */
  getLetter(i: number): string {
    return LETTERS[i] ?? '?';
  }

  /** Nombre de questions restantes. */
  getRemaining(): number {
    return (this.quiz?.questions?.length ?? 0) - this.index - (this.showingFeedback ? 1 : 0);
  }
}
