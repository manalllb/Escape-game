import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GameStateService } from './game-state.service';

// URL de base de l'API Symfony (backend)
const API_BASE = 'http://localhost:8000';

/**
 * Service de base qui encapsule HttpClient.
 * Fournit des méthodes get et post avec gestion d'erreur.
 * Ajoute automatiquement le header X-Api-Token si un token est stocké.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private gameState: GameStateService
  ) {}

  /** Construit les headers HTTP avec le token d'authentification si présent. */
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

  /**
   * Effectue une requête GET.
   * @param path Chemin à ajouter après l'URL de base
   * @returns Observable contenant la réponse JSON
   */
  get<T>(path: string): Observable<T> {
    return this.http
      .get<T>(`${API_BASE}${path}`, { headers: this.headers() })
      .pipe(timeout(10000), catchError((err) => this.handleError(err)));
  }

  /**
   * Effectue une requête POST.
   * @param path Chemin à ajouter après l'URL de base
   * @param body Corps de la requête (objet JSON)
   * @returns Observable contenant la réponse JSON
   */
  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${API_BASE}${path}`, body, {
        headers: this.headers({ 'Content-Type': 'application/json' })
      })
      .pipe(timeout(10000), catchError((err) => this.handleError(err)));
  }

  /**
   * Effectue une requête DELETE.
   * @param path Chemin à ajouter après l'URL de base
   * @returns Observable contenant la réponse JSON
   */
  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<T>(`${API_BASE}${path}`, { headers: this.headers() })
      .pipe(timeout(10000), catchError((err) => this.handleError(err)));
  }

  /**
   * Effectue une requête PATCH.
   * @param path Chemin à ajouter après l'URL de base
   * @param body Corps de la requête (objet JSON)
   * @returns Observable contenant la réponse JSON
   */
  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http
      .patch<T>(`${API_BASE}${path}`, body, {
        headers: this.headers({ 'Content-Type': 'application/json' })
      })
      .pipe(timeout(10000), catchError((err) => this.handleError(err)));
  }

  /**
   * Gère les erreurs HTTP en extrayant le message du backend.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg =
      (error.error as Record<string, unknown>)?.['error'] as string ||
      `Erreur HTTP ${error.status}`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = error.status;
    return throwError(() => err);
  }
}
