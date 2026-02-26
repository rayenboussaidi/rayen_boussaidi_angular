import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuggestionDetailsComponent } from './suggestion-details/suggestion-details.component';
import { SuggestionsComponent } from './suggestions.component';
import { SuggestionsListComponent } from './suggestions-list/suggestions-list.component';

const routes: Routes = [
  {
    path: '',
    component: SuggestionsComponent,
    children: [
      { path: '', component: SuggestionsListComponent },
      { path: ':id', component: SuggestionDetailsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuggestionsRoutingModule {}

