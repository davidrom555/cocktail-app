import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import { CocktailService } from '../../core/services/cocktail.service';
import { Cocktail } from '../../core/models';
import { IngredientsModalComponent } from '../../shared/components/ingredients-modal/ingredients-modal.component';

@Component({
  selector: 'app-cocktail-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    ProgressSpinnerModule,
    ChipModule,
    CarouselModule,
    TooltipModule,
    IngredientsModalComponent
  ],
  templateUrl: './cocktail-detail.component.html',
  styleUrl: './cocktail-detail.component.scss'
})
export class CocktailDetailComponent implements OnInit {
  cocktail: Cocktail | null = null;
  ingredients: any[] = [];
  loading: boolean = true;

  selectedLanguage: string = 'en';
  currentInstructions: string = '';

  showIngredientsModal: boolean = false;

  showCategorySlider: boolean = false;
  categoryCocktails: Cocktail[] = [];

  private previousCocktailId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cocktailService: CocktailService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadCocktail(id);
  }

  loadCocktail(id: string): void {
    this.loading = true;
    this.cocktailService.getCocktailById(id).subscribe({
      next: (cocktail) => {
        if (cocktail) {
          this.cocktail = cocktail;
          this.loadIngredients();
          this.setDefaultLanguage();
          this.loading = false;
        } else {
          console.log('coctel no encontrado');
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('ERROR:', error);
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  loadIngredients(): void {
    if (!this.cocktail) return;
    this.ingredients = this.cocktailService.getIngredients(this.cocktail);
  }

  setDefaultLanguage(): void {
    if (!this.cocktail) return;

    if (this.cocktail.strInstructionsES && this.cocktail.strInstructionsES.trim() !== '') {
      this.selectedLanguage = 'es';
      this.currentInstructions = this.cocktail.strInstructionsES;
    } else {
      this.selectedLanguage = 'en';
      this.currentInstructions = this.cocktail.strInstructions || '';
    }
  }

  changeLanguage(lang: string): void {
    if (!this.cocktail) return;

    this.selectedLanguage = lang;
    console.log('cambiando a idioma:', lang);

    // si el idioma no tiene traduccion, uso ingles por defecto
    if (lang === 'en') {
      this.currentInstructions = this.cocktail.strInstructions || '';
    } else if (lang === 'es' && this.cocktail.strInstructionsES) {
      this.currentInstructions = this.cocktail.strInstructionsES;
    } else if (lang === 'de' && this.cocktail.strInstructionsDE) {
      this.currentInstructions = this.cocktail.strInstructionsDE;
    } else if (lang === 'fr' && this.cocktail.strInstructionsFR) {
      this.currentInstructions = this.cocktail.strInstructionsFR;
    } else if (lang === 'it' && this.cocktail.strInstructionsIT) {
      this.currentInstructions = this.cocktail.strInstructionsIT;
    } else {
      // fallback a ingles si no hay traduccion
      this.currentInstructions = this.cocktail.strInstructions || '';
    }
  }

  isLanguageAvailable(lang: string): boolean {
    if (!this.cocktail) return false;

    if (lang === 'en') return true;
    if (lang === 'es') return !!(this.cocktail.strInstructionsES && this.cocktail.strInstructionsES.trim() !== '');
    if (lang === 'de') return !!(this.cocktail.strInstructionsDE && this.cocktail.strInstructionsDE.trim() !== '');
    if (lang === 'fr') return !!(this.cocktail.strInstructionsFR && this.cocktail.strInstructionsFR.trim() !== '');
    if (lang === 'it') return !!(this.cocktail.strInstructionsIT && this.cocktail.strInstructionsIT.trim() !== '');

    return false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  loadRandomCocktail(): void {
    this.loading = true;
    this.cocktailService.getRandomCocktail().subscribe({
      next: (cocktail) => {
        if (cocktail) {
          this.router.navigate(['/cocktail', cocktail.idDrink]).then(() => {
            this.loadCocktail(cocktail.idDrink);
          });
        }
      },
      error: (error) => {
        console.log('error:', error);
        this.loading = false;
      }
    });
  }

  openImageFullscreen(): void {
    if (this.cocktail) {
      window.open(this.cocktail.strDrinkThumb, '_blank');
    }
  }

  getTags(): string[] {
    if (!this.cocktail?.strTags) return [];
    return this.cocktail.strTags.split(',').map(t => t.trim());
  }

  openCategorySlider(category: string): void {
    this.showCategorySlider = true;
    // traigo mas cocteles de la misma categoria para mostrar en el slider
    this.cocktailService.filterByCategory(category).subscribe(result => {
      this.categoryCocktails = result;
      console.log('encontre', result.length, 'cocteles de esta categoria');
    });
  }

  navigateToCocktail(id: string): void {
    this.showCategorySlider = false;
    this.router.navigate(['/cocktail', id]).then(() => {
      this.loadCocktail(id);
    });
  }
}
