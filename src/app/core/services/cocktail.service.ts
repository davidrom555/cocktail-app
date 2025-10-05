import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Cocktail } from '../models';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class CocktailService {

  private API_URL = 'https://www.thecocktaildb.com/api/json/v1/1';
  private INGREDIENT_IMAGE_URL = 'https://www.thecocktaildb.com/images/ingredients';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  private handleError<T>(fallbackValue: T) {
    return (error: any): Observable<T> => {
      this.errorHandler.showError(
        'Hubo un problema al conectar con el servicio. Por favor, verifica tu conexión e intenta nuevamente.',
        'Error de conexión'
      );
      return of(fallbackValue);
    };
  }

  searchByLetter(letter: string): Observable<Cocktail[]> {
    return this.http.get<any>(`${this.API_URL}/search.php?f=${letter}`)
      .pipe(
        map(response => {
          if (!response || !response.drinks) {
            return [];
          }
          return response.drinks;
        }),
        catchError(this.handleError<Cocktail[]>([]))
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
        catchError(this.handleError<Cocktail[]>([]))
      );
  }

  filterByCategory(category: string): Observable<any[]> {
    return this.http.get<any>(`${this.API_URL}/filter.php?c=${category}`)
      .pipe(
        map(response => {
          if (!response || !response.drinks || response.drinks.length === 0) {
            return [];
          }
          return response.drinks;
        }),
        catchError(this.handleError<any[]>([]))
      );
  }

  filterByGlass(glass: string): Observable<any[]> {
    return this.http.get<any>(`${this.API_URL}/filter.php?g=${glass}`)
      .pipe(
        map(response => {
          if (!response || !response.drinks || response.drinks.length === 0) {
            return [];
          }
          return response.drinks;
        }),
        catchError(this.handleError<any[]>([]))
      );
  }

  filterByAlcoholic(type: string): Observable<any[]> {
    return this.http.get<any>(`${this.API_URL}/filter.php?a=${type}`)
      .pipe(
        map(response => {
          if (!response || !response.drinks || response.drinks.length === 0) {
            return [];
          }
          return response.drinks;
        }),
        catchError(this.handleError<any[]>([]))
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
        catchError(this.handleError<Cocktail | null>(null))
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
        catchError(this.handleError<Cocktail | null>(null))
      );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<any>(`${this.API_URL}/list.php?c=list`)
      .pipe(
        map(response => {
          if (!response || !response.drinks) {
            return [];
          }
          return response.drinks.map((d: any) => d.strCategory);
        }),
        catchError(this.handleError<string[]>([]))
      );
  }

  getGlasses(): Observable<string[]> {
    return this.http.get<any>(`${this.API_URL}/list.php?g=list`)
      .pipe(
        map(response => {
          if (!response || !response.drinks) {
            return [];
          }
          return response.drinks.map((d: any) => d.strGlass);
        }),
        catchError(this.handleError<string[]>([]))
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
