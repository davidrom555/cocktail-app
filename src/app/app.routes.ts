import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/cocktails/cocktails-list/cocktail-list.component')
      .then(m => m.CocktailListComponent),
    title: 'Cocktail Explorer - Home'
  },
  {
    path: 'cocktail/:id',
    loadComponent: () => import('./features/cocktail-detail/cocktail-detail.component')
      .then(m => m.CocktailDetailComponent),
    title: 'Cocktail Details'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
