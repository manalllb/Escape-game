import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SessionService, SessionStateResponse, AdminSessionItem } from '../../services/session.service';
import { GameStateService } from '../../services/game-state.service';
import { AuthService } from '../../services/auth.service';

function statusLabel(session: AdminSessionItem | SessionStateResponse | null): string {
  if (!session) return 'Chargement';
  if (!session.estActive) return 'Inactive';
  if (session.joueur) return 'En cours';
  return 'En attente';
}

function statusClass(session: AdminSessionItem | SessionStateResponse | null): string {
  const label = statusLabel(session);
  if (label === 'Inactive') return 'inactive';
  if (label === 'En cours') return 'active';
  return 'pending';
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit, OnDestroy {
  adminEmail = '';
  sessions: AdminSessionItem[] = [];
  selectedSession: SessionStateResponse | null = null;
  selectedSessionId: number | null = null;
  loading = true;
  error = '';

  createLoading = false;

  private pollSub?: Subscription;

  constructor(
    private sessionService: SessionService,
    private gameState: GameStateService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.adminEmail = this.gameState.getAdminEmail();

    if (!this.authService.hasToken()) {
      this.router.navigate(['/admin-login']);
      return;
    }

    this.loadSessions();
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  loadSessions() {
    this.error = '';
    this.loading = true;
    this.selectedSession = null;
    this.selectedSessionId = null;
    this.pollSub?.unsubscribe();

    this.sessionService.getAdminSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        if (err.message?.includes('Token') || err.message?.includes('401')) {
          this.gameState.reset();
          this.router.navigate(['/admin-login']);
        }
      }
    });
  }

  selectSession(sessionId: number) {
    if (this.selectedSessionId === sessionId) {
      this.selectedSessionId = null;
      this.selectedSession = null;
      this.pollSub?.unsubscribe();
      return;
    }

    this.selectedSessionId = sessionId;
    this.selectedSession = null;
    this.pollSub?.unsubscribe();

    this.loadSessionDetail(sessionId);

    this.pollSub = interval(4000)
      .pipe(switchMap(() => this.sessionService.getState(sessionId)))
      .subscribe({
        next: (data) => {
          this.selectedSession = data;
        },
        error: (err) => {
          this.error = err.message;
        }
      });
  }

  loadSessionDetail(sessionId: number) {
    this.sessionService.getState(sessionId).subscribe({
      next: (data) => {
        this.selectedSession = data;
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  createSession() {
    if (this.createLoading) return;
    this.error = '';
    this.createLoading = true;

    this.sessionService.createSession().subscribe({
      next: () => {
        this.createLoading = false;
        this.loadSessions();
      },
      error: (err) => {
        this.createLoading = false;
        this.error = err.message;
      }
    });
  }

  deleteSession(sessionId: number, event: Event) {
    event.stopPropagation();
    if (!confirm('Voulez-vous vraiment supprimer cette session ?')) {
      return;
    }
    this.error = '';

    this.sessionService.deleteSession(sessionId).subscribe({
      next: () => {
        if (this.selectedSessionId === sessionId) {
          this.selectedSessionId = null;
          this.selectedSession = null;
          this.pollSub?.unsubscribe();
        }
        this.loadSessions();
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  copyPin(pin: string) {
    navigator.clipboard.writeText(pin).catch(() => {});
  }

  statusLabel(item: AdminSessionItem | SessionStateResponse | null): string {
    return statusLabel(item);
  }

  statusClass(item: AdminSessionItem | SessionStateResponse | null): string {
    return statusClass(item);
  }

  getOrderedSuivis() {
    return (this.selectedSession?.suivis ?? []).slice().sort((a, b) => a.ordre - b.ordre);
  }

  getDoneCount(): number {
    return this.getOrderedSuivis().filter((s) => s.termine).length;
  }

  getProgress(): number {
    const suivis = this.getOrderedSuivis();
    if (!suivis.length) return 0;
    return (this.getDoneCount() / suivis.length) * 100;
  }
}
