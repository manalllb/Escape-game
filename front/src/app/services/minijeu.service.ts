import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Interface représentant un mini-jeu tel que retourné par l'API.
 *
 * @property id - L'identifiant unique du mini-jeu en base de données
 * @property nom - Le nom affiché du mini-jeu (ex: "Tri Express")
 * @property type - Le type technique du mini-jeu ('tri', 'sequence', 'quiz')
 * @property ordre - La position du mini-jeu dans la séquence de jeu (1, 2, 3...)
 * @property dureeMax - La durée maximale de jeu en secondes (optionnel)
 */
export interface MiniJeu {
  id: number;
  nom: string;
  type: string;
  ordre: number;
  dureeMax: number;
}

/**
 * Interface représentant une question de quiz.
 *
 * @property id - L'identifiant unique de la question
 * @property question - Le texte de la question posée au joueur
 * @property bonneReponse - La réponse correcte parmi les choix
 * @property mauvaisesReponses - Tableau des réponses incorrectes (distracteurs)
 */
export interface QuizQuestion {
  id: number;
  question: string;
  bonneReponse: string;
  mauvaisesReponses: string[];
}

/**
 * Interface représentant le contenu complet d'un mini-jeu de type Quiz.
 *
 * @property id - L'identifiant du mini-jeu
 * @property nom - Le nom du quiz
 * @property type - Toujours 'quiz' pour ce type
 * @property questions - Tableau des questions du quiz
 */
export interface QuizContent {
  id: number;
  nom: string;
  type: string;
  questions: QuizQuestion[];
}

/**
 * Interface représentant un objet à trier dans le mini-jeu Tri Express.
 *
 * @property id - L'identifiant unique de l'objet
 * @property nomProduit - Le nom affiché du produit (ex: "Shampoing")
 * @property estCosmetique - `true` si c'est un produit cosmétique (à attraper),
 *                           `false` si c'est un non-cosmétique (à éviter)
 */
export interface TriItem {
  id: number;
  nomProduit: string;
  estCosmetique: boolean;
}

/**
 * Interface représentant le contenu complet d'un mini-jeu de type Tri.
 *
 * @property id - L'identifiant du mini-jeu
 * @property nom - Le nom du jeu de tri
 * @property type - Toujours 'tri' pour ce type
 * @property items - Tableau des objets à trier pendant le jeu
 */
export interface TriContent {
  id: number;
  nom: string;
  type: string;
  items: TriItem[];
}

/**
 * Interface représentant une étape dans le mini-jeu de séquence.
 *
 * @property id - L'identifiant unique de l'étape
 * @property libelle - Le nom de l'étape (ex: "Nettoyant")
 * @property ordreAttendu - L'ordre numérique attendu pour cette étape (1-5)
 * @property zoneApp - La zone d'application sur le visage (information visuelle)
 */
export interface SequenceStep {
  id: number;
  libelle: string;
  ordreAttendu: number;
  zoneApp: string;
}

/**
 * Interface représentant le contenu complet d'un mini-jeu de type Sequence.
 *
 * @property id - L'identifiant du mini-jeu
 * @property nom - Le nom de la séquence (ex: "Mission Peau Parfaite")
 * @property type - Toujours 'sequence' pour ce type
 * @property etapes - Tableau des étapes de soin dans le désordre (à réorganiser)
 */
export interface SequenceContent {
  id: number;
  nom: string;
  type: string;
  etapes: SequenceStep[];
}

/**
 * Service de récupération des données des mini-jeux.
 *
 * MiniJeuService est responsable de la communication avec le backend pour
 * récupérer :
 * - La liste de tous les mini-jeux disponibles
 * - Le contenu détaillé de chaque mini-jeu (questions, items, étapes)
 *
 * Types de mini-jeux supportés :
 * - **tri** : Jeu d'arcade de tri d'objets (Tri Express)
 * - **sequence** : Jeu d'ordonnancement d'étapes (Mission Peau Parfaite)
 * - **quiz** : Questionnaire à choix multiples (L'Énigme Écologique)
 *
 * Ce service est utilisé par les composants de jeu (TriGame, SequenceGame,
 * QuizGame) pour charger leurs données avant le début de la partie.
 */
@Injectable({
  providedIn: 'root'
})
export class MiniJeuService {
  /**
   * Crée une instance du service MiniJeuService.
   *
   * @param api - Le service ApiService pour les requêtes HTTP vers le backend
   */
  constructor(private api: ApiService) {}

  /**
   * Récupère la liste complète des mini-jeux disponibles.
   *
   * Cette méthode appelle l'endpoint GET /api/minijeux pour obtenir
   * tous les mini-jeux configurés dans le backend. Les résultats incluent
   * les métadonnées (nom, type, ordre) nécessaires pour afficher la
   * progression du jeu.
   *
   * @returns Un Observable émettant un tableau d'objets MiniJeu
   *
   * @example
   * // Dans un composant
   * this.miniJeuService.getMiniJeux().subscribe(jeux => {
   *   console.log('Mini-jeux disponibles:', jeux);
   * });
   */
  getMiniJeux(): Observable<MiniJeu[]> {
    return this.api.get<MiniJeu[]>('/api/minijeux');
  }

  /**
   * Récupère le contenu détaillé d'un mini-jeu spécifique.
   *
   * Cette méthode appelle l'endpoint GET /api/minijeux/{id}/contenu pour
   * obtenir les données de jeu spécifiques selon le type :
   * - **Quiz** : retourne QuizContent avec les questions et réponses
   * - **Tri** : retourne TriContent avec la liste des objets à trier
   * - **Sequence** : retourne SequenceContent avec les étapes de soin
   *
   * Le type de retour est une union TypeScript qui sera narrowing selon
   * le type réel du mini-jeu.
   *
   * @param id - L'identifiant numérique du mini-jeu
   * @returns Un Observable émettant le contenu approprié (QuizContent | TriContent | SequenceContent)
   *
   * @example
   * // Charger un quiz
   * this.miniJeuService.getContenu(3).subscribe(data => {
   *   const quiz = data as QuizContent;
   *   console.log('Questions:', quiz.questions);
   * });
   */
  getContenu(id: number): Observable<QuizContent | TriContent | SequenceContent> {
    return this.api.get<QuizContent | TriContent | SequenceContent>(`/api/minijeux/${id}/contenu`);
  }
}
