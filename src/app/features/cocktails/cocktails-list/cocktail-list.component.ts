import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
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
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
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
    PaginatorModule,
    ProgressSpinnerModule,
    IngredientsModalComponent
  ],
  templateUrl: './cocktail-list.component.html',
  styleUrl: './cocktail-list.component.scss'
})
export class CocktailListComponent implements OnInit, OnDestroy {
  cocktails: Cocktail[] = [];
  categories: string[] = [];
  glasses: string[] = [];

  selectedCocktail: Cocktail | null = null;
  showIngredients: boolean = false;
  loading: boolean = false;

  showCategoryModal: boolean = false;
  categoryCocktails: Cocktail[] = [];
  selectedCategoryName: string = '';

  alcoholicCount: number = 0;
  nonAlcoholicCount: number = 0;
  totalCount: number = 0;

  // Paginación lazy para filtros
  isFilterActive: boolean = false;
  allCocktailIds: string[] = [];
  loadedCocktails = new Map<string, Cocktail>();
  currentPage: number = 0;
  pageSize: number = 5;
  totalRecords: number = 0;

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

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private cocktailService: CocktailService,
    private router: Router
  ) {
    // genero array con las letras A-Z
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(65 + i);
      this.alphabet.push({ label: char, value: char.toLowerCase() });
    }
  }

  ngOnInit(): void {
    this.loadCategoriesAndGlasses();
    this.loadInitialCocktails();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription(): void {
    // espero 500ms antes de buscar para no hacer muchas requests
    this.searchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchText => {
        if (searchText && searchText.trim() !== '') {
          this.selectedLetter = '';
          this.selectedCategory = '';
          this.selectedGlass = '';
          this.selectedAlcoholic = '';
          this.loading = true;
          this.cocktailService.searchByName(searchText).subscribe(result => {
            this.cocktails = result;
            this.updateCounts();
            this.loading = false;
          });
        } else if (this.selectedLetter) {
          this.filterByLetter(this.selectedLetter);
        } else {
          this.loadInitialCocktails();
        }
      });
  }

  loadCategoriesAndGlasses(): void {
    this.cocktailService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.cocktailService.getGlasses().subscribe(glasses => {
      this.glasses = glasses;
    });
  }

  loadInitialCocktails(): void {
    this.loading = true;
    // cargo los que empiecen con 'a' por defecto
    this.cocktailService.searchByLetter('a').subscribe(result => {
      this.cocktails = result;
      this.updateCounts();
      this.loading = false;
    });
  }

  onSearchChange(): void {
    this.searchSubject$.next(this.searchText);
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
      this.isFilterActive = true;
      this.cocktailService.filterByCategory(this.selectedCategory).subscribe(result => {
        this.allCocktailIds = result.map((c: any) => c.idDrink);
        this.totalRecords = this.allCocktailIds.length;
        this.currentPage = 0;
        this.loadedCocktails.clear();
        this.loadCocktailsForPage(0);
      });
    } else {
      this.searchText = '';
      this.isFilterActive = false;
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
      this.isFilterActive = true;
      this.cocktailService.filterByGlass(this.selectedGlass).subscribe(result => {
        this.allCocktailIds = result.map((c: any) => c.idDrink);
        this.totalRecords = this.allCocktailIds.length;
        this.currentPage = 0;
        this.loadedCocktails.clear();
        this.loadCocktailsForPage(0);
      });
    } else {
      this.searchText = '';
      this.isFilterActive = false;
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
      this.isFilterActive = true;
      this.cocktailService.filterByAlcoholic(this.selectedAlcoholic).subscribe(result => {
        this.allCocktailIds = result.map((c: any) => c.idDrink);
        this.totalRecords = this.allCocktailIds.length;
        this.currentPage = 0;
        this.loadedCocktails.clear();
        this.loadCocktailsForPage(0);
      });
    } else {
      this.searchText = '';
      this.isFilterActive = false;
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

  // cuenta cuantos ingredientes tiene cada coctel
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

  openCategoryModal(category: string): void {
    this.selectedCategoryName = category;
    this.showCategoryModal = true;
    this.cocktailService.filterByCategory(category).subscribe(result => {
      this.categoryCocktails = result;
    });
  }

  navigateToCocktail(id: string): void {
    this.router.navigate(['/cocktail', id]);
  }

  getAlcoholicSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch(type) {
      case 'Alcoholic':
        return 'warn';
      case 'Non Alcoholic':
        return 'success';
      default:
        return 'info';
    }
  }

  getAlcoholicIcon(type: string): string {
    switch(type) {
      case 'Alcoholic':
        return 'pi pi-wine-bottle';
      case 'Non Alcoholic':
      case 'Non_Alcoholic':
        return 'pi pi-leaf';
      default:
        return '';
    }
  }

  updateCounts(): void {
    this.alcoholicCount = this.cocktails.filter(c => c.strAlcoholic === 'Alcoholic').length;
    this.nonAlcoholicCount = this.cocktails.filter(c => c.strAlcoholic !== 'Alcoholic').length;
    this.totalCount = this.cocktails.length;
  }

  loadCocktailsForPage(page: number): void {
    const start = page * this.pageSize;
    const end = start + this.pageSize;
    const idsToLoad = this.allCocktailIds.slice(start, end);

    const newIds = idsToLoad.filter(id => !this.loadedCocktails.has(id));

    if (newIds.length === 0) {
      this.cocktails = idsToLoad
        .map(id => this.loadedCocktails.get(id))
        .filter((c): c is Cocktail => c !== undefined);
      this.updateCounts();
      this.loading = false;
      return;
    }


    const requests = newIds.map(id => this.cocktailService.getCocktailById(id));
    forkJoin(requests).subscribe(results => {
      results.forEach(cocktail => {
        if (cocktail) {
          this.loadedCocktails.set(cocktail.idDrink, cocktail);
        }
      });

      this.cocktails = idsToLoad
        .map(id => this.loadedCocktails.get(id))
        .filter((c): c is Cocktail => c !== undefined);
      this.updateCounts();
      this.loading = false;
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.loading = true;
    this.loadCocktailsForPage(event.page);
  }
}
