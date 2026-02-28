import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Suggestion } from '../../models/suggestion';

/** API response may have date as string; we normalize to Date */
function toSuggestion(raw: any): Suggestion {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    category: raw.category || '',
    date: raw.date ? new Date(raw.date) : new Date(),
    status: normalizeStatus(raw.status),
    nbLikes: raw.nbLikes ?? 0,
    isFavorite: raw.isFavorite
  };
}

function normalizeStatus(s: string): 'acceptee' | 'refusee' | 'en_attente' {
  if (s === 'acceptee' || s === 'refusee' || s === 'en_attente') return s;
  if (s === 'refusée' || s?.toLowerCase() === 'refusee') return 'refusee';
  if (s === 'acceptée' || s?.toLowerCase() === 'acceptee') return 'acceptee';
  return 'en_attente';
}

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {
  suggestionUrl = 'http://localhost:3000/suggestions';

  constructor(private http: HttpClient) {}

  /** Part 1: static list for when no backend */
  private staticList: Suggestion[] = [
    {
      id: 1,
      title: 'Organiser une journée team building',
      description: "Suggestion pour organiser une journée de team building pour renforcer les liens entre les membres de l'équipe.",
      category: 'Événements',
      date: new Date('2025-01-20'),
      status: 'acceptee',
      nbLikes: 10
    },
    {
      id: 2,
      title: 'Améliorer le système de réservation',
      description: "Proposition pour améliorer la gestion des réservations en ligne avec un système de confirmation automatique.",
      category: 'Technologie',
      date: new Date('2025-01-15'),
      status: 'refusee',
      nbLikes: 0
    },
    {
      id: 3,
      title: 'Créer un système de récompenses',
      description: "Mise en place d'un programme de récompenses pour motiver les employés et reconnaître leurs efforts.",
      category: 'Ressources Humaines',
      date: new Date('2025-01-25'),
      status: 'refusee',
      nbLikes: 0
    },
    {
      id: 4,
      title: "Moderniser l'interface utilisateur",
      description: "Refonte complète de l'interface utilisateur pour une meilleure expérience utilisateur.",
      category: 'Technologie',
      date: new Date('2025-01-30'),
      status: 'en_attente',
      nbLikes: 0
    }
  ];

  /** Part 1 & 2: getSuggestionsList() returns list from API, fallback to static if backend unavailable */
  getSuggestionsList(): Observable<Suggestion[]> {
    return this.http.get<any[]>(this.suggestionUrl).pipe(
      map(list => (list || []).map(toSuggestion)),
      catchError(() => of(this.staticList))
    );
  }

  /** Part 2: getSuggestionById */
  getSuggestionById(id: number): Observable<Suggestion | null> {
    return this.http.get<any>(`${this.suggestionUrl}/${id}`).pipe(
      map(raw => raw ? toSuggestion(raw) : null),
      catchError(() => {
        const found = this.staticList.find(s => s.id === id);
        return of(found ?? null);
      })
    );
  }

  /** Part 2: deleteSuggestion */
  deleteSuggestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.suggestionUrl}/${id}`).pipe(
      catchError(() => {
        const idx = this.staticList.findIndex(s => s.id === id);
        if (idx >= 0) this.staticList.splice(idx, 1);
        return of(void 0);
      })
    );
  }

  /** Part 2: addSuggestion */
  addSuggestion(suggestion: Omit<Suggestion, 'id'>): Observable<Suggestion> {
    const body = {
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      status: suggestion.status,
      nbLikes: suggestion.nbLikes ?? 0
    };
    return this.http.post<any>(this.suggestionUrl, body).pipe(
      map(toSuggestion),
      catchError(() => {
        const newId = Math.max(0, ...this.staticList.map(s => s.id)) + 1;
        const created: Suggestion = { ...suggestion, id: newId, nbLikes: suggestion.nbLikes ?? 0 };
        this.staticList.push(created);
        return of(created);
      })
    );
  }

  /** Part 2: updateSuggestion */
  updateSuggestion(id: number, suggestion: Partial<Suggestion>): Observable<Suggestion> {
    const body: any = {
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      status: suggestion.status,
      nbLikes: suggestion.nbLikes
    };
    Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);
    return this.http.put<any>(`${this.suggestionUrl}/${id}`, body).pipe(
      map(toSuggestion),
      catchError(() => {
        const idx = this.staticList.findIndex(s => s.id === id);
        if (idx >= 0 && suggestion) {
          this.staticList[idx] = { ...this.staticList[idx], ...suggestion };
          return of(this.staticList[idx]);
        }
        const stub: Suggestion = { id, title: '', description: '', category: '', date: new Date(), status: 'en_attente', nbLikes: 0 };
        return of(stub);
      })
    );
  }

  /** Part 2: updateNbLikes */
  updateNbLikes(id: number, nbLikes: number): Observable<Suggestion> {
    return this.http.patch<any>(`${this.suggestionUrl}/${id}`, { nbLikes }).pipe(
      map(toSuggestion),
      catchError(() => {
        const s = this.staticList.find(x => x.id === id);
        if (s) { s.nbLikes = nbLikes; return of(s); }
        return of({ id, title: '', description: '', category: '', date: new Date(), status: 'en_attente', nbLikes } as Suggestion);
      })
    );
  }
}
