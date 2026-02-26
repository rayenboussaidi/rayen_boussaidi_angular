import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuggestionsRoutingModule } from './suggestions-routing.module';
import { SuggestionsComponent } from './suggestions.component';
import { SuggestionsListComponent } from './suggestions-list/suggestions-list.component';
import { SuggestionDetailsComponent } from './suggestion-details/suggestion-details.component';

@NgModule({
  declarations: [
    SuggestionsComponent,
    SuggestionsListComponent,
    SuggestionDetailsComponent
  ],
  imports: [
    CommonModule,
    SuggestionsRoutingModule
  ]
})
export class SuggestionsModule {}

