import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { CocktailService } from '../../../core/services/cocktail.service';
import { Cocktail } from '../../../core/models';
import { IngredientsModalComponent } from '../../../shared/components/ingredients-modal/ingredients-modal.component';

@Component({
  selector: 'app-cocktail-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    CardModule,
    TagModule,
    DialogModule,
    BadgeModule,
    TooltipModule,
    ChipModule,
    IngredientsModalComponent
  ],
  templateUrl: './cocktail-list.component.html',
  styleUrl: './cocktail-list.component.scss'
})
export class CocktailListComponent implements OnInit {
  cocktails: Cocktail[] = [];
  categories: string[] = [];
  glasses: string[] = [];

  selectedCocktail: Cocktail | null = null;
  showIngredients: boolean = false;
  loading: boolean = false;

  // probe usar esto para algo pero al final no
  private isInitialized: boolean = false;

  alcoholicCount: number = 0;
  nonAlcoholicCount: number = 0;
  totalCount: number = 0;

  searchText: string = '';
  selectedLetter: string = '';
  selectedCategory: string = '';
  selectedGlass: string = '';
  selectedAlcoholic: string = '';

  alcoholicOptions = [
    { label: 'Todos', value: '' },
    { label: 'Alcohólico', value: 'Alcoholic' },
    { label: 'Sin Alcohol', value: 'Non_Alcoholic' }
  ];

  alphabet: any[] = [];

  private searchTimeout: any;

  constructor(
    private cocktailService: CocktailService,
    private router: Router
  ) {
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      this.alphabet.push({ label: letter, value: letter.toLowerCase() });
    }
  }

  ngOnInit(): void {
    this.loadCategoriesAndGlasses();
    this.loadInitialCocktails();
  }

  loadCategoriesAndGlasses(): void {
    this.cocktailService.getCategories().subscribe(cats => {
      this.categories = cats;
      console.log('categorias:', cats.length);
    });

    this.cocktailService.getGlasses().subscribe(glasses => {
      this.glasses = glasses;
      console.log('vasos:', glasses.length);
    });

  }

  loadInitialCocktails(): void {
    this.loading = true;

    this.cocktailService.searchByLetter('a').subscribe(result => {
      this.cocktails = result;
      this.updateCounts();
      this.loading = false;
      console.log('cocktails iniciales cargados:', result.length);
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      if (this.searchText && this.searchText.trim() !== '') {
        this.selectedLetter = '';
        this.selectedCategory = '';
        this.selectedGlass = '';
        this.selectedAlcoholic = '';
        this.loading = true;
        console.log('buscando:', this.searchText);
        this.cocktailService.searchByName(this.searchText).subscribe(result => {
          this.cocktails = result;
          this.updateCounts();
          this.loading = false;
        });
      } else if (this.selectedLetter) {
        this.filterByLetter(this.selectedLetter);
      } else {
        this.loadInitialCocktails();
      }
    }, 500);
  }

  clearSearch(): void {
    this.searchText = '';
    this.loadInitialCocktails();
  }

  filterByLetter(letter: string): void {
    this.selectedLetter = letter;
    this.searchText = '';
    this.selectedCategory = '';
    this.selectedGlass = '';
    this.selectedAlcoholic = '';
    this.loading = true;

    this.cocktailService.searchByLetter(letter).subscribe(result => {
      this.cocktails = result;
      this.updateCounts();
      this.loading = false;
    });
  }

  clearLetterFilter(): void {
    this.selectedLetter = '';
    this.searchText = '';
    this.loadInitialCocktails();
  }

  onCategoryChange(): void {
    if (this.selectedCategory) {
      this.searchText = '';
      this.selectedLetter = '';
      this.selectedGlass = '';
      this.selectedAlcoholic = '';
      this.loading = true;
      this.cocktailService.filterByCategory(this.selectedCategory).subscribe(result => {
        this.cocktails = result;
        this.updateCounts();
        this.loading = false;
      });
    } else {
      this.searchText = '';
      this.loadInitialCocktails();
    }
  }

  onGlassChange(): void {
    if (this.selectedGlass) {
      this.searchText = '';
      this.selectedLetter = '';
      this.selectedCategory = '';
      this.selectedAlcoholic = '';
      this.loading = true;
      this.cocktailService.filterByGlass(this.selectedGlass).subscribe(result => {
        this.cocktails = result;
        this.updateCounts();
        this.loading = false;
      });
    } else {
      this.searchText = '';
      this.loadInitialCocktails();
    }
  }

  onAlcoholicChange(): void {
    if (this.selectedAlcoholic) {
      this.searchText = '';
      this.selectedLetter = '';
      this.selectedCategory = '';
      this.selectedGlass = '';
      this.loading = true;
      this.cocktailService.filterByAlcoholic(this.selectedAlcoholic).subscribe(result => {
        this.cocktails = result;
        this.updateCounts();
        this.loading = false;
      });
    } else {
      this.searchText = '';
      this.loadInitialCocktails();
    }
  }

  clearAllFilters(): void {
    this.searchText = '';
    this.selectedLetter = '';
    this.selectedCategory = '';
    this.selectedGlass = '';
    this.selectedAlcoholic = '';
    this.loadInitialCocktails();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedCategory || this.selectedGlass || this.selectedAlcoholic);
  }

  getIngredientCount(cocktail: Cocktail): number {
    let count = 0;
  
    for (let i = 1; i <= 15; i++) {
      const ingredient = (cocktail as any)[`strIngredient${i}`];
      if (ingredient && ingredient.trim() !== '') {
        count++;
      }
    }
    return count;
  }

  showIngredientsModal(cocktail: Cocktail): void {
    this.selectedCocktail = cocktail;
    this.showIngredients = true;
  }

  navigateToCocktail(id: string): void {
    this.router.navigate(['/cocktail', id]);
  }

  getAlcoholicSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (type === 'Alcoholic') {
      return 'warn';
    } else if (type === 'Non Alcoholic') {
      return 'success';
    } else {
      return 'info';
    }
  }

  getAlcoholicIcon(type: string): string {
    if (type === 'Alcoholic') {
      return 'pi pi-wine-bottle';
    } else if (type === 'Non Alcoholic') {
      return 'pi pi-leaf';
    } else {
      return 'pi pi-question';
    }
  }

  updateCounts(): void {
    this.alcoholicCount = this.cocktails.filter(c => c.strAlcoholic === 'Alcoholic').length;
    this.nonAlcoholicCount = this.cocktails.filter(c => c.strAlcoholic !== 'Alcoholic').length;
    this.totalCount = this.cocktails.length;
  }
}
