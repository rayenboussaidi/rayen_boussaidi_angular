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

  constructor(private router: Router) {}

  goToDetails(id: number): void {
    this.router.navigate(['/suggestions', id]);
  }
}

