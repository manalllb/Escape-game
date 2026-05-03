import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface MiniJeu {
  id: number;
  nom: string;
  type: string;
  ordre: number;
  dureeMax: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  bonneReponse: string;
  mauvaisesReponses: string[];
}

export interface QuizContent {
  id: number;
  nom: string;
  type: string;
  questions: QuizQuestion[];
}

export interface TriItem {
  id: number;
  nomProduit: string;
  estCosmetique: boolean;
}

export interface TriContent {
  id: number;
  nom: string;
  type: string;
  items: TriItem[];
}

export interface SequenceStep {
  id: number;
  libelle: string;
  ordreAttendu: number;
  zoneApp: string;
}

export interface SequenceContent {
  id: number;
  nom: string;
  type: string;
  etapes: SequenceStep[];
}

@Injectable({
  providedIn: 'root'
})
export class MiniJeuService {

  constructor(private api: ApiService) {}

  getMiniJeux(): Observable<MiniJeu[]> {
    return this.api.get<MiniJeu[]>('/api/minijeux');
  }

  getContenu(id: number): Observable<QuizContent | TriContent | SequenceContent> {
    return this.api.get<QuizContent | TriContent | SequenceContent>(`/api/minijeux/${id}/contenu`);
  }
}
