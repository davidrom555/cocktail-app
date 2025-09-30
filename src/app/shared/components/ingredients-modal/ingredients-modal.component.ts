import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ChipModule } from 'primeng/chip';
import { CocktailService } from '../../../core/services/cocktail.service';
import { Cocktail } from '../../../core/models';

@Component({
  selector: 'app-ingredients-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ChipModule
  ],
  templateUrl: './ingredients-modal.component.html',
  styleUrls: ['./ingredients-modal.component.scss']
})
export class IngredientsModalComponent {
  @Input() visible: boolean = false;
  @Input() cocktail: Cocktail | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  ingredients: any[] = [];

  constructor(private cocktailService: CocktailService) {}

  ngOnChanges(): void {
    if (this.visible && this.cocktail) {
      this.loadIngredients();
    } else if (!this.visible) {
      this.ingredients = [];
    }
  }

  loadIngredients(): void {
    if (!this.cocktail) return;

    const ings = this.cocktailService.getIngredients(this.cocktail);
    console.log('ingredientes encontrados:', ings.length);

   
    const temp = ings.map(ing => {
      return {
        name: ing.name,
        measure: ing.measure,
        imageUrl: this.cocktailService.getIngredientImageUrl(ing.name, 'small'),
        imageLoaded: false,
        retryCount: 0 
      };
    });
    this.ingredients = temp;
  }

  onImageLoad(ingredient: any): void {
    ingredient.imageLoaded = true;
  }

  onImageError(event: any, ingredient: any): void {
   
    if (ingredient.retryCount < 2) {
      ingredient.retryCount++;
      const delay = 300 * ingredient.retryCount;
      console.log('reintentando imagen:', ingredient.name);
      setTimeout(() => {
        event.target.src = ingredient.imageUrl + '?retry=' + ingredient.retryCount;
      }, delay);
    } else {
      event.target.style.display = 'none';
      ingredient.imageLoaded = true;
    }
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }
}
