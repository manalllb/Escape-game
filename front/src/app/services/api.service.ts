import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GameStateService } from './game-state.service';

const API_BASE = 'http://localhost:8000';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private gameState: GameStateService
  ) {}

  private headers(extra: Record<string, string> = {}): HttpHeaders {
    const token = this.gameState.getToken();
    let headers = new HttpHeaders({ Accept: 'application/json' });
    if (token) {
      headers = headers.set('X-Api-Token', token);
    }
    for (const [key, value] of Object.entries(extra)) {
      headers = headers.set(key, value);
    }
    return headers;
  }

  get<T>(path: string): Observable<T> {
    return this.http
      .get<T>(`${API_BASE}${path}`, { headers: this.headers() })
      .pipe(timeout(10000), catchError((err) => this.handleError(err)));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${API_BASE}${path}`, body, {
        headers: this.headers({ 'Content-Type': 'application/json' })
      })
      .pipe(timeout(10000), catchError((err) => this.handleError(err)));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<T>(`${API_BASE}${path}`, { headers: this.headers() })
      .pipe(timeout(10000), catchError((err) => this.handleError(err)));
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http
      .patch<T>(`${API_BASE}${path}`, body, {
        headers: this.headers({ 'Content-Type': 'application/json' })
      })
      .pipe(timeout(10000), catchError((err) => this.handleError(err)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg =
      (error.error as Record<string, unknown>)?.['error'] as string ||
      `Erreur HTTP ${error.status}`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = error.status;
    return throwError(() => err);
  }
}
