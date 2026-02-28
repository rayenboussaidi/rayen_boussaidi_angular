import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SuggestionService } from '../../../core/services/suggestion.service';

@Component({
  selector: 'app-suggestion-form',
  templateUrl: './suggestion-form.component.html',
  styleUrl: './suggestion-form.component.css'
})
export class SuggestionFormComponent implements OnInit {
  suggestionForm!: FormGroup;
  id?: number;
  isEdit = false;

  categories: string[] = [
    'Événements',
    'Technologie',
    'Ressources Humaines',
    'Infrastructure et bâtiments',
    'Restauration et cafétéria',
    'Hygiène et environnement',
    'Transport et mobilité',
    'Activités et événements',
    'Sécurité',
    'Communication interne',
    'Accessibilité',
    'Autre'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private suggestionService: SuggestionService
  ) {}

  ngOnInit(): void {
    this.suggestionForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(/^[A-Za-z][a-zA-Z0-9 À-ÿ]*$/)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(30)
      ]],
      category: ['', Validators.required],
      date: [{ value: new Date().toISOString().split('T')[0], disabled: true }],
      status: [{ value: 'en_attente', disabled: true }]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      if (Number.isFinite(this.id)) {
        this.isEdit = true;
        this.suggestionService.getSuggestionById(this.id).subscribe({
          next: data => {
            if (data) {
              const d = data.date ? new Date(data.date) : new Date();
              this.suggestionForm.patchValue({
                title: data.title,
                description: data.description,
                category: data.category,
                date: d.toISOString().split('T')[0],
                status: data.status
              });
            }
          },
          error: () => this.router.navigate(['/suggestions'])
        });
      }
    }
  }

  onSubmit(): void {
    if (!this.suggestionForm.valid) return;

    const value = this.suggestionForm.getRawValue();
    const payload = {
      title: value.title,
      description: value.description,
      category: value.category,
      status: value.status || 'en_attente',
      nbLikes: 0,
      date: new Date()
    };

    if (this.isEdit && this.id) {
      this.suggestionService.updateSuggestion(this.id, payload).subscribe({
        next: () => this.router.navigate(['/suggestions']),
        error: err => alert(err?.message || 'Erreur lors de la modification.')
      });
    } else {
      this.suggestionService.addSuggestion(payload).subscribe({
        next: () => this.router.navigate(['/suggestions']),
        error: err => alert(err?.message || 'Erreur lors de l\'ajout.')
      });
    }
  }

  get title() {
    return this.suggestionForm.get('title');
  }

  get description() {
    return this.suggestionForm.get('description');
  }

  get category() {
    return this.suggestionForm.get('category');
  }

  cancel(): void {
    this.router.navigate(['/suggestions']);
  }
}
