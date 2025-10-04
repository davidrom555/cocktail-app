import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { CocktailService } from '../../core/services/cocktail.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToolbarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(
    private router: Router,
    private cocktailService: CocktailService
  ) {}

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  goToRandomCocktail(): void {
    this.cocktailService.getRandomCocktail().subscribe(cocktail => {
      if (cocktail) {
        this.router.navigate(['/cocktail', cocktail.idDrink]);
      }
    });
  }
}
