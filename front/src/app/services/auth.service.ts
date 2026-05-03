import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { GameStateService } from './game-state.service';

export interface LoginResponse {
  token: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private api: ApiService,
    private gameState: GameStateService
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/api/login', { email, password });
  }

  logout(): Observable<{ message: string }> {
    const token = this.gameState.getToken();
    if (!token) {
      this.gameState.reset();
      return new Observable((observer) => {
        observer.next({ message: 'Déconnecté' });
        observer.complete();
      });
    }
    return this.api.post<{ message: string }>('/api/logout', {});
  }

  verifyToken(): Observable<{ id: number; email: string }> {
    return this.api.get<{ id: number; email: string }>('/api/admin/me');
  }

  hasToken(): boolean {
    return !!this.gameState.getToken();
  }
}
