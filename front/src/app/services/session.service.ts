import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AdminSessionItem {
  id: number;
  codePin: string;
  estActive: boolean;
  dateCreation: string;
  dateDebut: string | null;
  dateFin: string | null;
  score: number;
  joueur: { id: number; pseudo: string } | null;
}

export interface SessionCreateResponse {
  sessionId: number;
  codePin: string;
  estActive: boolean;
  dateCreation: string;
}

export interface SessionJoinResponse {
  sessionId: number;
  codePin: string;
  joueurId: number;
  pseudo: string;
}

export interface SuiviState {
  id: number;
  miniJeuId: number;
  nom: string;
  type: string;
  ordre: number;
  dureeMax: number;
  termine: boolean;
  score: number;
  temps: number;
  nbCosmetiqueAtt: number;
  nbNonCosmetiqueAtt: number;
  aGagneCode: boolean;
}

export interface InventaireCodeState {
  id: number;
  estValide: boolean;
  code: {
    id: number;
    fragment: string;
    ordre: number;
  };
}

export interface SessionStateResponse {
  sessionId: number;
  codePin: string;
  estActive: boolean;
  sessionExpiree: boolean;
  tempsRestant: number;
  dateCreation: string;
  dateDebut: string;
  dateFin: string;
  score: number;
  admin: string;
  joueur: { id: number; pseudo: string } | null;
  suivis: SuiviState[];
  inventaireCodes: InventaireCodeState[];
}

export interface CompleteMiniJeuResponse {
  message: string;
  sessionId: number;
  miniJeuId: number;
  suiviId: number;
  termine: boolean;
  score: number;
  temps: number;
  seuil: number;
  aGagneCode: boolean;
  nbCosmetiqueAtt: number;
  nbNonCosmetiqueAtt: number;
  scoreSession: number;
}

export interface ValidateCodeResponse {
  success: boolean;
  message: string;
  scoreFinal: number;
}

/**
 * Service qui gère toutes les opérations liées aux sessions de jeu :
 * création, rejoindre, état, validation des mini-jeux et du code final.
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(private api: ApiService) {}

  /** Crée une nouvelle session (admin). Le token est injecté par ApiService. */
  createSession(): Observable<SessionCreateResponse> {
    return this.api.post<SessionCreateResponse>('/api/sessions', {});
  }

  /** Liste toutes les sessions de l'admin connecté. */
  getAdminSessions(): Observable<AdminSessionItem[]> {
    return this.api.get<AdminSessionItem[]>('/api/admin/sessions');
  }

  /** Désactive une session sans la supprimer. */
  disableSession(sessionId: number): Observable<{ message: string; sessionId: number; estActive: boolean }> {
    return this.api.patch<{ message: string; sessionId: number; estActive: boolean }>(`/api/sessions/${sessionId}/disable`);
  }

  /** Rejoint une session existante (joueur). */
  joinSession(codePin: string, pseudo: string): Observable<SessionJoinResponse> {
    return this.api.post<SessionJoinResponse>('/api/sessions/join', {
      codePin,
      pseudo
    });
  }

  /** Récupère l'état complet d'une session. */
  getState(sessionId: number): Observable<SessionStateResponse> {
    return this.api.get<SessionStateResponse>(`/api/sessions/${sessionId}/state`);
  }

  /** Soumet le score d'un mini-jeu terminé. */
  completeMiniJeu(
    sessionId: number,
    miniJeuId: number,
    score: number,
    temps: number,
    nbCosmetiqueAtt: number,
    nbNonCosmetiqueAtt: number
  ): Observable<CompleteMiniJeuResponse> {
    return this.api.post<CompleteMiniJeuResponse>(
      `/api/sessions/${sessionId}/minijeux/${miniJeuId}/complete`,
      { score, temps, nbCosmetiqueAtt, nbNonCosmetiqueAtt }
    );
  }

  /** Marque une session comme échouée (fermeture par le joueur). */
  failSession(sessionId: number): Observable<{ message: string; sessionId: number; estActive: boolean }> {
    return this.api.post<{ message: string; sessionId: number; estActive: boolean }>(`/api/sessions/${sessionId}/fail`, {});
  }

  /** Supprime une session de jeu. */
  deleteSession(sessionId: number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/api/sessions/${sessionId}`);
  }

  /** Valide le code final saisi par le joueur. */
  validateCode(sessionId: number, code: string): Observable<ValidateCodeResponse> {
    return this.api.post<ValidateCodeResponse>(
      `/api/sessions/${sessionId}/validate-code`,
      { code }
    );
  }
}
