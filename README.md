# Cocktail App

App de cocteles usando Angular y la API de TheCocktailDB.

## Instalar

```bash

git clone https://github.com/davidrom555/cocktail-app.git
cd cocktail-app
=======

npm install
npm start
```

Abrir en `http://localhost:4200`

## Que tiene

- buscar cocteles por nombre
- filtros (categoria, vaso, alcoholico)
- filtro alfabetico
- detalle de cada coctel
- cambio de idioma en instrucciones
- modal con ingredientes
- responsive

## Stack

- Angular 20
- PrimeNG para los componentes UI
- RxJS
- SCSS

## API

TheCocktailDB: https://www.thecocktaildb.com/api.php

endpoints que use:
- search por nombre
- search por letra
- filtrar por categoria/vaso/alcoholico
- detalle por id
- random

## Comandos

```bash
# desarrollo
npm start

# build
npm run build

# tests
npm test
```

## Recursos que use

Durante el desarrollo fui consultando:

**Docs:**
- Angular (https://angular.dev/)
- PrimeNG (https://primeng.org/)
- RxJS (https://rxjs.dev/)

**API:**
- TheCocktailDB (https://www.thecocktaildb.com/api.php)

**Librerías que instale:**
```bash
npm install primeng primeicons
npm install @angular/animations
```

**Comandos que use:**
```bash
ng generate component features/cocktails/cocktails-list
ng generate service core/services/cocktail
ng serve --open
ng build
```
