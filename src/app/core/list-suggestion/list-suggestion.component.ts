import { Component } from '@angular/core';
import { Suggestion } from '../../models/suggestion';

@Component({
  selector: 'app-list-suggestion',
  templateUrl: './list-suggestion.component.html',
  styleUrl: './list-suggestion.component.css'
})
export class ListSuggestionComponent {
  searchText: string = '';
  selectedStatus: string = 'all';
  favorites: Suggestion[] = [];

  suggestions: Suggestion[] = [
    {
      id: 1,
      title: 'Organiser une journée team building',
      description: 'Suggestion pour organiser une journée de team building pour renforcer les liens entre les membres de l\'équipe.',
      category: 'Événements',
      date: new Date('2025-01-20'),
      status: 'acceptee',
      nbLikes: 10
    },
    {
      id: 2,
      title: 'Améliorer le système de réservation',
      description: 'Proposition pour améliorer la gestion des réservations en ligne avec un système de confirmation automatique.',
      category: 'Technologie',
      date: new Date('2025-01-15'),
      status: 'refusee',
      nbLikes: 0
    },
    {
      id: 3,
      title: 'Créer un système de récompenses',
      description: 'Mise en place d\'un programme de récompenses pour motiver les employés et reconnaître leurs efforts.',
      category: 'Ressources Humaines',
      date: new Date('2025-01-25'),
      status: 'refusee',
      nbLikes: 0
    },
    {
      id: 4,
      title: 'Moderniser l\'interface utilisateur',
      description: 'Refonte complète de l\'interface utilisateur pour une meilleure expérience utilisateur.',
      category: 'Technologie',
      date: new Date('2025-01-30'),
      status: 'en_attente',
      nbLikes: 0
    },
  ];

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

  removeFromFavorites(suggestion: Suggestion): void {
    this.favorites = this.favorites.filter(fav => fav.id !== suggestion.id);
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

  formatDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('fr-FR', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }
}
