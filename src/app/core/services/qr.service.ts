import { Injectable } from '@angular/core';
interface QrPayload { expectedQrCode: string; manualCode: string }

@Injectable({ providedIn: 'root' })
export class QrService {
  validateScanned(value: string, stage: QrPayload): boolean {
    return this.normalize(value) === this.normalize(stage.expectedQrCode);
  }

  validateManual(value: string, stage: QrPayload): boolean {
    return this.normalize(value) === this.normalize(stage.manualCode);
  }

  private normalize(value: string): string {
    return value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
  }
}
