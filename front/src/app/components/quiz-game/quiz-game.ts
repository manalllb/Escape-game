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

  ceil = Math.ceil;

  showingFeedback = false;
  lastAnswerCorrect: boolean | null = null;

  elapsed = 0;
  timeLimit = 180;
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

  formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  getLetter(i: number): string {
    return LETTERS[i] ?? '?';
  }

  getRemaining(): number {
    return (this.quiz?.questions?.length ?? 0) - this.index - (this.showingFeedback ? 1 : 0);
  }
}
