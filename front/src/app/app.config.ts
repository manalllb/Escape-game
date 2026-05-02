import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Configuration principale de l'application Angular.
 *
 * appConfig définit les providers globaux nécessaires au fonctionnement
 * de l'application Escape Game :
 *
 * **Providers configurés :**
 * - provideZoneChangeDetection : Active la détection de changements avec
 *   l'option eventCoalescing pour optimiser les performances (regroupe
 *   les événements asynchrones proches)
 * - provideBrowserGlobalErrorListeners : Configure les écouteurs d'erreurs
 *   globales du navigateur pour un meilleur debugging
 * - provideRouter : Configure le routeur Angular avec le tableau de routes
 *   défini dans app.routes.ts
 * - provideHttpClient : Fournit le service HttpClient pour les requêtes
 *   HTTP vers le backend Symfony (API REST)
 *
 * Cette configuration est passée à Angular lors du bootstrap de l'application
 * dans main.ts.
 *
 * @see app.routes.ts pour la définition des routes
 * @see main.ts pour le bootstrap de l'application
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Détection de changements avec optimisation (regroupement d'événements)
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Écouteurs d'erreurs globales du navigateur
    provideBrowserGlobalErrorListeners(),
    // Configuration du routeur avec les définitions de routes
    provideRouter(routes),
    // HttpClient pour les communications avec le backend API
    provideHttpClient()
  ]
};
