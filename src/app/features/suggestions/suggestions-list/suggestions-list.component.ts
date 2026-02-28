import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Suggestion } from '../../../models/suggestion';
import { SuggestionService } from '../../../core/services/suggestion.service';

@Component({
  selector: 'app-suggestions-list',
  templateUrl: './suggestions-list.component.html',
  styleUrl: './suggestions-list.component.css'
})
export class SuggestionsListComponent implements OnInit {
  suggestions: Suggestion[] = [];
  searchText = '';
  selectedStatus = 'all';
  favorites: Suggestion[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private suggestionService: SuggestionService
  ) {}

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.loading = true;
    this.error = null;
    this.suggestionService.getSuggestionsList().subscribe({
      next: list => {
        this.suggestions = list;
        this.loading = false;
      },
      error: err => {
        this.error = err?.message || 'Erreur lors du chargement. Vérifiez que le backend est démarré (npm run dev).';
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

  goToDetails(id: number): void {
    this.router.navigate(['/suggestions', id]);
  }

  goToAddForm(): void {
    this.router.navigate(['/suggestions/add']);
  }

  deleteSuggestion(s: Suggestion, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Supprimer « ${s.title } » ?`)) return;
    this.suggestionService.deleteSuggestion(s.id).subscribe({
      next: () => this.loadSuggestions(),
      error: err => alert(err?.message || 'Erreur lors de la suppression.')
    });
  }

  likeSuggestion(s: Suggestion): void {
    const newCount = (s.nbLikes ?? 0) + 1;
    this.suggestionService.updateNbLikes(s.id, newCount).subscribe({
      next: updated => {
        const idx = this.suggestions.findIndex(x => x.id === s.id);
        if (idx >= 0) this.suggestions[idx] = { ...this.suggestions[idx], nbLikes: updated.nbLikes };
      },
      error: () => {
        s.nbLikes = (s.nbLikes ?? 0) + 1;
      }
    });
  }

  addToFavorites(s: Suggestion): void {
    if (!this.isInFavorites(s)) this.favorites.push(s);
  }

  isInFavorites(s: Suggestion): boolean {
    return this.favorites.some(f => f.id === s.id);
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
}
