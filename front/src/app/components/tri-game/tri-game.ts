import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiniJeuService, TriContent, TriItem } from '../../services/minijeu.service';
import { SessionService } from '../../services/session.service';

interface FallingItem {
  id: number;
  item: TriItem;
  x: number;
  y: number;
  speed: number;
}

@Component({
  selector: 'app-tri-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tri-game.html',
  styleUrl: './tri-game.css',
})
export class TriGame implements OnInit, OnDestroy {
  @Input() sessionId!: number;
  @Input() miniJeuId = 1;
  @Output() complete = new EventEmitter<void>();
  @Output() defeat = new EventEmitter<void>();

  @ViewChild('playfield') playfieldRef!: ElementRef<HTMLDivElement>;

  game: TriContent | null = null;
  items: TriItem[] = [];
  fallingItems: FallingItem[] = [];

  score = 0;
  lives = 3;
  target = 15;
  elapsed = 0;
  timeLimit = 180;
  remainingTime = 180;

  gameActive = false;
  gameOver = false;
  won = false;
  saving = false;
  error = '';
  defeatReason: 'lives' | 'timeout' = 'lives';

  basketX = 0;
  playfieldWidth = 0;
  playfieldHeight = 450;

  readonly basketWidth = 80;
  readonly basketHeight = 70;
  readonly itemWidth = 90;
  readonly itemHeight = 50;

  private nextItemId = 0;
  private animFrameId = 0;
  private spawnTimerId: ReturnType<typeof setTimeout> | null = null;
  private elapsedTimerId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private miniJeuService: MiniJeuService,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    this.loadGame();
  }

  ngOnDestroy() {
    this.stopGame();
  }

  loadGame() {
    this.error = '';
    this.miniJeuService.getContenu(this.miniJeuId).subscribe({
      next: (data) => {
        this.game = data as TriContent;
        this.items = this.game.items || [];
      },
      error: (err) => {
        this.error = err.message;
      },
    });
  }

  startGame() {
    if (!this.playfieldRef) return;
    const el = this.playfieldRef.nativeElement;
    this.playfieldWidth = el.offsetWidth;
    this.playfieldHeight = el.offsetHeight;

    this.basketX = (this.playfieldWidth - this.basketWidth) / 2;

    this.gameActive = true;
    this.gameOver = false;
    this.won = false;
    this.score = 0;
    this.lives = 3;
    this.elapsed = 0;
    this.remainingTime = this.timeLimit;
    this.fallingItems = [];
    this.nextItemId = 0;
    this.saving = false;

    this.gameLoop();
    this.scheduleNextSpawn();

    this.elapsedTimerId = setInterval(() => {
      this.elapsed++;
      this.remainingTime--;
      if (this.remainingTime <= 0 && this.gameActive) {
        this.endGame(false, 'timeout');
      }
    }, 1000);
  }

  restartGame() {
    this.gameOver = false;
    this.won = false;
    this.startGame();
  }

  private scheduleNextSpawn() {
    const delay = 700 + Math.random() * 500;
    this.spawnTimerId = setTimeout(() => {
      if (this.gameActive) {
        this.spawnItem();
        this.scheduleNextSpawn();
      }
    }, delay);
  }

  private spawnItem() {
    if (!this.items.length || !this.gameActive) return;
    const item = this.items[Math.floor(Math.random() * this.items.length)];
    const x = Math.random() * (this.playfieldWidth - this.itemWidth);

    this.fallingItems.push({
      id: this.nextItemId++,
      item,
      x,
      y: -this.itemHeight,
      speed: 1.5 + Math.random() * 1.5,
    });
  }

  private gameLoop() {
    if (!this.gameActive) return;

    const basketY = this.playfieldHeight - this.basketHeight - 16;

    const speedMultiplier = 1 + this.score * 0.04;

    for (let i = this.fallingItems.length - 1; i >= 0; i--) {
      const f = this.fallingItems[i];
      f.y += f.speed * speedMultiplier;

      const hitBasket =
        f.x < this.basketX + this.basketWidth &&
        f.x + this.itemWidth > this.basketX &&
        f.y + this.itemHeight > basketY &&
        f.y < basketY + this.basketHeight;

      if (hitBasket) {
        this.catchItem(f.item);
        this.fallingItems.splice(i, 1);
        continue;
      }

      if (f.y > this.playfieldHeight) {
        this.fallingItems.splice(i, 1);
      }
    }

    if (this.score >= this.target) {
      this.endGame(true);
      return;
    }
    if (this.lives <= 0) {
      this.endGame(false);
      return;
    }

    this.animFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  private catchItem(item: TriItem) {
    if (item.estCosmetique) {
      this.score++;
    } else {
      this.lives--;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.playfieldRef || !this.gameActive) return;
    const rect = this.playfieldRef.nativeElement.getBoundingClientRect();
    let x = event.clientX - rect.left - this.basketWidth / 2;
    x = Math.max(0, Math.min(x, this.playfieldWidth - this.basketWidth));
    this.basketX = x;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.playfieldRef || !this.gameActive) return;
    event.preventDefault();
    const rect = this.playfieldRef.nativeElement.getBoundingClientRect();
    const touch = event.touches[0];
    let x = touch.clientX - rect.left - this.basketWidth / 2;
    x = Math.max(0, Math.min(x, this.playfieldWidth - this.basketWidth));
    this.basketX = x;
  }

  private endGame(won: boolean, reason?: 'lives' | 'timeout') {
    this.gameActive = false;
    this.gameOver = true;
    this.won = won;
    this.defeatReason = reason ?? 'lives';
    this.stopIntervals();

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

    const nbCosmetiqueAtt = this.score;
    const nbNonCosmetiqueAtt = 3 - this.lives;

    this.sessionService
      .completeMiniJeu(
        this.sessionId,
        this.miniJeuId,
        this.score,
        this.elapsed,
        nbCosmetiqueAtt,
        nbNonCosmetiqueAtt
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

  private submitFailure(_reason: 'lives' | 'timeout') {
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

  private stopGame() {
    this.gameActive = false;
    this.stopIntervals();
  }

  private stopIntervals() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
    if (this.spawnTimerId) {
      clearTimeout(this.spawnTimerId);
      this.spawnTimerId = null;
    }
    if (this.elapsedTimerId) {
      clearInterval(this.elapsedTimerId);
      this.elapsedTimerId = null;
    }
  }

  formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  trackById(_index: number, item: FallingItem): number {
    return item.id;
  }
}
