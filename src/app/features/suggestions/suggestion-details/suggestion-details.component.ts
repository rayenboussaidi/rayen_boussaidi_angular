import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Suggestion } from '../../../models/suggestion';
import { SUGGESTIONS } from '../suggestions.data';

@Component({
  selector: 'app-suggestion-details',
  templateUrl: './suggestion-details.component.html',
  styleUrl: './suggestion-details.component.css'
})
export class SuggestionDetailsComponent implements OnInit {
  suggestion?: Suggestion;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      this.router.navigate(['/suggestions']);
      return;
    }

    this.suggestion = SUGGESTIONS.find((s) => s.id === id);

    if (!this.suggestion) {
      this.router.navigate(['/suggestions']);
    }
  }

  backToList(): void {
    this.router.navigate(['/suggestions']);
  }

  likeSuggestion(): void {
    if (this.suggestion) {
      this.suggestion.nbLikes++;
    }
  }

  toggleFavorite(): void {
    if (this.suggestion) {
      this.suggestion.isFavorite = !this.suggestion.isFavorite;
    }
  }
}

