import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { ErrorHandlerService } from './core/services/error-handler.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, DialogModule, ButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  error$;

  constructor(
    private errorHandler: ErrorHandlerService
  ) {
    this.error$ = this.errorHandler.error;
  }

  closeErrorDialog() {
    this.errorHandler.hideError();
  }
}