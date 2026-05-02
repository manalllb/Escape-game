import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service qui centralise l'état global de l'application.
 * Utilise des BehaviorSubjects pour que les composants puissent s'abonner
 * aux changements de valeurs.
 */
@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  /** Clés de stockage local. */
  private readonly K = {
    sessionId: 'mwl_sessionId',
    sessionPin: 'mwl_sessionPin',
    pseudo: 'mwl_pseudo',
    adminEmail: 'mwl_adminEmail',
    token: 'mwl_token',
  } as const;

  // Identifiant de la session en cours
  private sessionId$ = new BehaviorSubject<number | null>(this.loadNumber(this.K.sessionId));
  // Code PIN à partager pour rejoindre
  private sessionPin$ = new BehaviorSubject<string>(localStorage.getItem(this.K.sessionPin) ?? '');
  // Pseudo du joueur connecté
  private pseudo$ = new BehaviorSubject<string>(localStorage.getItem(this.K.pseudo) ?? '');
  // Email de l'admin connecté
  private adminEmail$ = new BehaviorSubject<string>(localStorage.getItem(this.K.adminEmail) ?? '');
  // Token d'authentification admin
  private token$ = new BehaviorSubject<string>(localStorage.getItem(this.K.token) ?? '');
  // Message d'erreur global
  private error$ = new BehaviorSubject<string>('');
  // Indicateur de chargement
  private loading$ = new BehaviorSubject<boolean>(false);
  // Résultat final (victoire / défaite)
  private gameResult$ = new BehaviorSubject<unknown>(null);

  /** Recharge un nombre depuis le localStorage. */
  private loadNumber(key: string): number | null {
    const raw = localStorage.getItem(key);
    return raw ? Number(raw) : null;
  }

  // Observables publics pour que les composants puissent s'y abonner
  readonly sessionId = this.sessionId$.asObservable();
  readonly sessionPin = this.sessionPin$.asObservable();
  readonly pseudo = this.pseudo$.asObservable();
  readonly adminEmail = this.adminEmail$.asObservable();
  readonly token = this.token$.asObservable();
  readonly error = this.error$.asObservable();
  readonly loading = this.loading$.asObservable();
  readonly gameResult = this.gameResult$.asObservable();

  // Valeurs actuelles (lecture directe sans abonnement)
  getSessionId(): number | null {
    return this.sessionId$.value;
  }

  getSessionPin(): string {
    return this.sessionPin$.value;
  }

  getPseudo(): string {
    return this.pseudo$.value;
  }

  getAdminEmail(): string {
    return this.adminEmail$.value;
  }

  getToken(): string {
    return this.token$.value;
  }

  getError(): string {
    return this.error$.value;
  }

  getLoading(): boolean {
    return this.loading$.value;
  }

  getGameResult(): unknown {
    return this.gameResult$.value;
  }

  /** Stocke une valeur dans localStorage. */
  private store(key: string, value: string | null) {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }

  // Setters pour modifier l'état
  setSessionId(id: number | null) {
    this.store(this.K.sessionId, id !== null ? String(id) : null);
    this.sessionId$.next(id);
  }

  setSessionPin(pin: string) {
    this.store(this.K.sessionPin, pin || null);
    this.sessionPin$.next(pin);
  }

  setPseudo(pseudo: string) {
    this.store(this.K.pseudo, pseudo || null);
    this.pseudo$.next(pseudo);
  }

  setAdminEmail(email: string) {
    this.store(this.K.adminEmail, email || null);
    this.adminEmail$.next(email);
  }

  setToken(token: string) {
    this.store(this.K.token, token || null);
    this.token$.next(token);
  }

  setError(error: string) {
    this.error$.next(error);
  }

  setLoading(loading: boolean) {
    this.loading$.next(loading);
  }

  setGameResult(result: unknown) {
    this.gameResult$.next(result);
  }

  /** Réinitialise tout l'état (retour à l'accueil). */
  reset() {
    Object.values(this.K).forEach((k) => localStorage.removeItem(k));
    this.sessionId$.next(null);
    this.sessionPin$.next('');
    this.pseudo$.next('');
    this.adminEmail$.next('');
    this.token$.next('');
    this.error$.next('');
    this.loading$.next(false);
    this.gameResult$.next(null);
  }
}
