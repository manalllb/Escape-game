import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { GameStateService } from './game-state.service';

export interface LoginResponse {
  token: string;
  email: string;
}

/**
 * Service d'authentification administrateur.
 * Gère le login, logout et la vérification du token côté backend.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private api: ApiService,
    private gameState: GameStateService
  ) {}

  /** Connecte un administrateur et stocke le token. */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/api/login', { email, password });
  }

  /** Déconnecte l'admin côté backend puis nettoie le state local. */
  logout(): Observable<{ message: string }> {
    const token = this.gameState.getToken();
    // Même si pas de token, on nettoie le state
    if (!token) {
      this.gameState.reset();
      return new Observable((observer) => {
        observer.next({ message: 'Déconnecté' });
        observer.complete();
      });
    }
    return this.api.post<{ message: string }>('/api/logout', {});
  }

  /** Vérifie si le token stocké est toujours valide côté backend. */
  verifyToken(): Observable<{ id: number; email: string }> {
    return this.api.get<{ id: number; email: string }>('/api/admin/me');
  }

  /** Indique si un token est présent localement. */
  hasToken(): boolean {
    return !!this.gameState.getToken();
  }
}
