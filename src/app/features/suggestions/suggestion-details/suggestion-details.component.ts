import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Suggestion } from '../../../models/suggestion';
import { SuggestionService } from '../../../core/services/suggestion.service';

@Component({
  selector: 'app-suggestion-details',
  templateUrl: './suggestion-details.component.html',
  styleUrl: './suggestion-details.component.css'
})
export class SuggestionDetailsComponent implements OnInit {
  suggestion?: Suggestion;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private suggestionService: SuggestionService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      this.router.navigate(['/suggestions']);
      return;
    }

    this.suggestionService.getSuggestionById(id).subscribe({
      next: s => {
        this.suggestion = s ?? undefined;
        if (!this.suggestion) this.router.navigate(['/suggestions']);
      },
      error: () => this.router.navigate(['/suggestions'])
    });
  }

  backToList(): void {
    this.router.navigate(['/suggestions']);
  }

  goToUpdate(): void {
    if (this.suggestion) {
      this.router.navigate(['/suggestions/edit', this.suggestion.id]);
    }
  }

  deleteSuggestion(): void {
    if (!this.suggestion) return;
    if (!confirm(`Supprimer « ${this.suggestion.title } » ?`)) return;
    this.suggestionService.deleteSuggestion(this.suggestion.id).subscribe({
      next: () => this.router.navigate(['/suggestions']),
      error: err => alert(err?.message || 'Erreur lors de la suppression.')
    });
  }

  likeSuggestion(): void {
    if (!this.suggestion) return;
    const newCount = (this.suggestion.nbLikes ?? 0) + 1;
    this.suggestionService.updateNbLikes(this.suggestion.id, newCount).subscribe({
      next: updated => {
        this.suggestion = { ...this.suggestion!, nbLikes: updated.nbLikes };
      },
      error: () => {
        this.suggestion = { ...this.suggestion!, nbLikes: newCount };
      }
    });
  }

  toggleFavorite(): void {
    if (this.suggestion) {
      this.suggestion = { ...this.suggestion, isFavorite: !this.suggestion.isFavorite };
    }
  }
}
