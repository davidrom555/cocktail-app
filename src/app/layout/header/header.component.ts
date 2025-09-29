import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
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
  showRandomButton: boolean = true;

  constructor(
    private router: Router,
    private cocktailService: CocktailService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showRandomButton = !event.url.includes('/cocktail/');
    });
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  goToRandomCocktail(): void {
    this.cocktailService.getRandomCocktail().subscribe(cocktail => {
      if (cocktail) {
        console.log('navegando a coctel random:', cocktail.idDrink);
        this.router.navigate(['/cocktail', cocktail.idDrink]);
      }
    });
  }
}
