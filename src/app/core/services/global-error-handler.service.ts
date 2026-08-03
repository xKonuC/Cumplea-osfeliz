import { ErrorHandler, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  readonly message = signal('');

  handleError(error: unknown): void {
    console.error(error);
    this.message.set('Algo no salió como esperábamos. Tu progreso está guardado; puedes volver a intentarlo.');
  }

  dismiss(): void {
    this.message.set('');
  }
}
