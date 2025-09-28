import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  loading = signal<boolean>(false);

  setLoading(loading: boolean): void {
    this.loading.set(loading);
  }
}