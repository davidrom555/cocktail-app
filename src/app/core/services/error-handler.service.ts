import { Injectable, signal } from '@angular/core';

export interface ErrorState {
  show: boolean;
  message: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorState = signal<ErrorState>({
    show: false,
    message: '',
    title: 'Error'
  });

  public error = this.errorState.asReadonly();

  showError(message: string, title: string = 'Error en el servicio') {
    this.errorState.set({
      show: true,
      message,
      title
    });
  }

  hideError() {
    this.errorState.set({
      show: false,
      message: '',
      title: 'Error'
    });
  }
}
