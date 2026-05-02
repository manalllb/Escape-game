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

/**
 * Tableau de bord administrateur.
 * Affiche la liste des sessions, permet de créer, désactiver et supprimer.
 */
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

  // État de création séparé
  createLoading = false;

  // Abonnement au polling
  private pollSub?: Subscription;

  constructor(
    private sessionService: SessionService,
    private gameState: GameStateService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ← Ajoute ça
  ) {}

  ngOnInit() {
    this.adminEmail = this.gameState.getAdminEmail();

    // Vérifie que le token est encore valide
    if (!this.authService.hasToken()) {
      this.router.navigate(['/admin-login']);
      return;
    }

    this.loadSessions();
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  /** Charge la liste des sessions de l'admin. */
  loadSessions() {
    this.error = '';
    this.loading = true;
    this.selectedSession = null;
    this.selectedSessionId = null;
    this.pollSub?.unsubscribe();

    this.sessionService.getAdminSessions().subscribe({
      next: (data) => {
        console.log('Sessions chargées :', data);
        this.sessions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des sessions :', err);
        this.error = err.message;
        this.loading = false;
        // Si token invalide, redirige vers login
        if (err.message?.includes('Token') || err.message?.includes('401')) {
          this.gameState.reset();
          this.router.navigate(['/admin-login']);
        }
      }
    });
  }

  /** Sélectionne une session pour voir ses détails (avec polling). */
  selectSession(sessionId: number) {
    if (this.selectedSessionId === sessionId) {
      // Désélectionne si on reclique sur la même
      this.selectedSessionId = null;
      this.selectedSession = null;
      this.pollSub?.unsubscribe();
      return;
    }

    this.selectedSessionId = sessionId;
    this.selectedSession = null;
    this.pollSub?.unsubscribe();

    this.loadSessionDetail(sessionId);

    // Polling toutes les 4 secondes
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

  /** Charge une session une fois. */
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

  /** Crée une nouvelle session de jeu instantanément. */
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

  /** Supprime physiquement une session avec confirmation. */
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

  /** Copie le code PIN dans le presse-papiers. */
  copyPin(pin: string) {
    navigator.clipboard.writeText(pin).catch(() => {});
  }

  // Helpers pour le template
  statusLabel(item: AdminSessionItem | SessionStateResponse | null): string {
    return statusLabel(item);
  }

  statusClass(item: AdminSessionItem | SessionStateResponse | null): string {
    return statusClass(item);
  }

  /** Trie les suivis par ordre croissant. */
  getOrderedSuivis() {
    return (this.selectedSession?.suivis ?? []).slice().sort((a, b) => a.ordre - b.ordre);
  }

  /** Calcule le nombre de mini-jeux terminés. */
  getDoneCount(): number {
    return this.getOrderedSuivis().filter((s) => s.termine).length;
  }

  /** Calcule le pourcentage de progression. */
  getProgress(): number {
    const suivis = this.getOrderedSuivis();
    if (!suivis.length) return 0;
    return (this.getDoneCount() / suivis.length) * 100;
  }
}
