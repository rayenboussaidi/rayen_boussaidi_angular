import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Suggestion } from '../../../models/suggestion';
import { SUGGESTIONS } from '../suggestions.data';

@Component({
  selector: 'app-suggestions-list',
  templateUrl: './suggestions-list.component.html',
  styleUrl: './suggestions-list.component.css'
})
export class SuggestionsListComponent {
  suggestions: Suggestion[] = SUGGESTIONS;
  searchText: string = '';
  selectedStatus: string = 'all';
  favorites: Suggestion[] = [];

  constructor(private router: Router) {}

  get filteredSuggestions(): Suggestion[] {
    let filtered = this.suggestions;

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.status === this.selectedStatus);
    }

    // Filter by search text
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(suggestion =>
        suggestion.title.toLowerCase().includes(searchLower) ||
        suggestion.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  goToDetails(id: number): void {
    this.router.navigate(['/suggestions', id]);
  }

  likeSuggestion(suggestion: Suggestion): void {
    suggestion.nbLikes++;
  }

  addToFavorites(suggestion: Suggestion): void {
    if (!this.isInFavorites(suggestion)) {
      this.favorites.push(suggestion);
    }
  }

  isInFavorites(suggestion: Suggestion): boolean {
    return this.favorites.some(fav => fav.id === suggestion.id);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'acceptee':
        return 'ACCEPTÉE';
      case 'refusee':
        return 'REFUSÉE';
      case 'en_attente':
        return 'EN ATTENTE';
      default:
        return status.toUpperCase();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'acceptee':
        return 'status-accepted';
      case 'refusee':
        return 'status-refused';
      case 'en_attente':
        return 'status-pending';
      default:
        return '';
    }
  }
}

