import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, tap } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Cocktail } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CocktailService {
 
  private API_URL = 'https://www.thecocktaildb.com/api/json/v1/1';
  private INGREDIENT_IMAGE_URL = 'https://www.thecocktaildb.com/images/ingredients';

  constructor(private http: HttpClient) {}

  searchByLetter(letter: string): Observable<Cocktail[]> {
    console.log('buscando por letra:', letter);
    return this.http.get<any>(`${this.API_URL}/search.php?f=${letter}`)
      .pipe(
        map(response => {
          if (!response || !response.drinks) {
            return [];
          }
          return response.drinks;
        }),
        catchError(error => {
          console.error('ups, error buscando:', error);
          return of([]);
        })
      );
  }

  searchByName(name: string): Observable<Cocktail[]> {
    if (!name || name.trim() === '') {
      return of([]);
    }
    return this.http.get<any>(`${this.API_URL}/search.php?s=${name}`)
      .pipe(
        map(response => {
          if (!response || !response.drinks) {
            return [];
          }
          return response.drinks;
        }),
        catchError(error => {
          console.log('error:', error);
          return of([]);
        })
      );
  }

  filterByCategory(category: string): Observable<Cocktail[]> {
    return this.http.get<any>(`${this.API_URL}/filter.php?c=${category}`)
      .pipe(
        switchMap(response => {
          if (!response || !response.drinks || response.drinks.length === 0) {
            return of([]);
          }
          const cocktailIds = response.drinks.map((d: any) => d.idDrink);
          const detailRequests = cocktailIds.map((id: string) => this.getCocktailById(id));
          return forkJoin<(Cocktail | null)[]>(detailRequests).pipe(
            map((cocktails: (Cocktail | null)[]) => cocktails.filter((c): c is Cocktail => c !== null))
          );
        }),
        catchError(error => {
          console.log('error filtrando categoria:', error);
          return of([]);
        })
      );
  }

  filterByGlass(glass: string): Observable<Cocktail[]> {
    return this.http.get<any>(`${this.API_URL}/filter.php?g=${glass}`)
      .pipe(
        switchMap(response => {
          if (!response || !response.drinks || response.drinks.length === 0) {
            return of([]);
          }
          const cocktailIds = response.drinks.map((d: any) => d.idDrink);
          const detailRequests = cocktailIds.map((id: string) => this.getCocktailById(id));
          return forkJoin<(Cocktail | null)[]>(detailRequests).pipe(
            map((cocktails: (Cocktail | null)[]) => cocktails.filter((c): c is Cocktail => c !== null))
          );
        }),
        catchError(error => {
          console.log('error filtrando vasos:', error);
          return of([]);
        })
      );
  }

  filterByAlcoholic(type: string): Observable<Cocktail[]> {
    return this.http.get<any>(`${this.API_URL}/filter.php?a=${type}`)
      .pipe(
        switchMap(response => {
          if (!response || !response.drinks || response.drinks.length === 0) {
            return of([]);
          }
          const cocktailIds = response.drinks.map((d: any) => d.idDrink);
          const detailRequests = cocktailIds.map((id: string) => this.getCocktailById(id));
          return forkJoin<(Cocktail | null)[]>(detailRequests).pipe(
            map((cocktails: (Cocktail | null)[]) => cocktails.filter((c): c is Cocktail => c !== null))
          );
        }),
        catchError(error => {
          console.error('problema filtrando por tipo alcoholico', error);
          return of([]);
        })
      );
  }

  getCocktailById(id: string): Observable<Cocktail | null> {
    return this.http.get<any>(`${this.API_URL}/lookup.php?i=${id}`)
      .pipe(
        map(response => {
          if (response && response.drinks && response.drinks.length > 0) {
            return response.drinks[0];
          }
          return null;
        }),
        catchError(error => {
          console.log('error obteniendo cocktail:', error);
          return of(null);
        })
      );
  }

  getRandomCocktail(): Observable<Cocktail | null> {
    return this.http.get<any>(`${this.API_URL}/random.php`)
      .pipe(
        map(response => {
          if (response && response.drinks && response.drinks.length > 0) {
            return response.drinks[0];
          }
          return null;
        }),
        catchError(() => of(null))
      );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<any>(`${this.API_URL}/list.php?c=list`)
      .pipe(
        map(response => {
          if (!response || !response.drinks) {
            return [];
          }
          console.log('ok, cargue', response.drinks.length, 'categorias');
          return response.drinks.map((d: any) => d.strCategory);
        })
      );
  }

  getGlasses(): Observable<string[]> {
    return this.http.get<any>(`${this.API_URL}/list.php?g=list`)
      .pipe(
        map(response => {
          if (!response || !response.drinks) {
            return [];
          }
          console.log('vasos:', response.drinks.length);
          return response.drinks.map((d: any) => d.strGlass);
        })
      );
  }

  // la API viene con los ingredientes numerados del 1 al 15
  getIngredients(cocktail: Cocktail): any[] {
    const ingredients: any[] = [];

    for (let i = 1; i <= 15; i++) {
      const ingredient = (cocktail as any)[`strIngredient${i}`];
      const measure = (cocktail as any)[`strMeasure${i}`];

      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          name: ingredient.trim(),
          measure: measure ? measure.trim() : 'Al gusto'
        });
      }
    }

    return ingredients;
  }

  getIngredientImageUrl(ingredientName: string, size: string = 'small'): string {
    const sizeText = size === 'small' ? '-Small' : '-Medium';
    return `${this.INGREDIENT_IMAGE_URL}/${ingredientName}${sizeText}.png`;
  }
}
