import { Component, OnInit } from '@angular/core';
import { Suggestion } from '../../models/suggestion';
import { SuggestionService } from '../services/suggestion.service';

@Component({
  selector: 'app-list-suggestion',
  templateUrl: './list-suggestion.component.html',
  styleUrl: './list-suggestion.component.css'
})
export class ListSuggestionComponent implements OnInit {
  searchText = '';
  selectedStatus = 'all';
  favorites: Suggestion[] = [];
  suggestions: Suggestion[] = [];
  loading = true;
  error: string | null = null;

  constructor(private suggestionService: SuggestionService) {}

  ngOnInit(): void {
    this.suggestionService.getSuggestionsList().subscribe({
      next: list => {
        this.suggestions = list;
        this.loading = false;
      },
      error: err => {
        this.error = err?.message || 'Erreur lors du chargement. Vérifiez que le backend est démarré.';
        this.loading = false;
      }
    });
  }

  get filteredSuggestions(): Suggestion[] {
    let filtered = this.suggestions;
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(s => s.status === this.selectedStatus);
    }
    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  likeSuggestion(s: Suggestion): void {
    const newCount = (s.nbLikes ?? 0) + 1;
    this.suggestionService.updateNbLikes(s.id, newCount).subscribe({
      next: updated => {
        const idx = this.suggestions.findIndex(x => x.id === s.id);
        if (idx >= 0) this.suggestions[idx] = { ...this.suggestions[idx], nbLikes: updated.nbLikes };
      },
      error: () => { s.nbLikes = (s.nbLikes ?? 0) + 1; }
    });
  }

  addToFavorites(s: Suggestion): void {
    if (!this.isInFavorites(s)) this.favorites.push(s);
  }

  isInFavorites(s: Suggestion): boolean {
    return this.favorites.some(f => f.id === s.id);
  }

  removeFromFavorites(s: Suggestion): void {
    this.favorites = this.favorites.filter(f => f.id !== s.id);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'acceptee': return 'ACCEPTÉE';
      case 'refusee': return 'REFUSÉE';
      case 'en_attente': return 'EN ATTENTE';
      default: return status.toUpperCase();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'acceptee': return 'status-accepted';
      case 'refusee': return 'status-refused';
      case 'en_attente': return 'status-pending';
      default: return '';
    }
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('fr-FR', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }
}
