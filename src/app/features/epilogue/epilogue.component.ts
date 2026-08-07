import { Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { QrService } from '../../core/services/qr.service';

@Component({
  selector: 'app-epilogue',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page page-enter epilogue-gate">
      @if (state.completedCount() < 6) {
        <div class="locked-final"><span>⌁</span><h1>La última puerta sigue cerrada</h1><p>Primero reúne los seis fragmentos.</p><a class="primary-button" routerLink="/capitulos">Volver a los capítulos</a></div>
      } @else if (!arrivedHome()) {
        <p class="eyebrow">El último tramo</p>
        <h1>Vuelve a casa</h1>
        <p class="lead">Guarda bien tus seis fragmentos y llévalos contigo. Cuando hayas llegado, vuelve a esta pantalla.</p>
        <div class="home-arrival-card">
          <span aria-hidden="true">♡</span>
          <p>No necesitas buscar nada más durante el camino.</p>
          <button class="primary-button glow" type="button" (click)="confirmArrival()">Ya llegué a casa</button>
        </div>
      } @else {
        <p class="eyebrow">Una última pista</p><h1>Ve a tu pieza</h1>
        <p class="lead">Ve directamente hasta tu pieza y entra despacio. No necesitas buscar en ningún otro lugar de la casa.</p>
        <p class="epilogue-direction">La última señal está esperando ahí. Cuando la encuentres, escanea el QR para continuar.</p>
        @if (!manualMode()) {
          <div class="camera-shell epilogue-camera"><video #preview muted playsinline aria-label="Vista previa de la cámara"></video><div class="scan-frame"><i></i><i></i><i></i><i></i></div><p>Mantén la última señal dentro del marco</p></div>
          @if (cameraStatus() === 'loading') { <p class="status-message">Preparando la cámara…</p> }
          @if (cameraStatus() === 'denied') { <div class="notice error-notice"><strong>La cámara no está disponible.</strong><span>Usa el código escrito junto al QR.</span></div> }
          <button class="text-button centered" type="button" (click)="openManual()">Ingresar código manual</button>
        } @else {
          <div class="manual-card"><div class="manual-icon">✦</div><h2>La última señal</h2><p>Escribe el código que aparece junto al QR.</p><label for="epilogueCode">Código de respaldo</label><input id="epilogueCode" [formControl]="manualCode" autocomplete="off" /><button class="primary-button" type="button" (click)="validateManual()" [disabled]="manualCode.invalid">Continuar</button><button class="text-button" type="button" (click)="restartCamera()">Volver a la cámara</button></div>
        }
        @if (message()) { <div class="notice" [class.success-notice]="success()" [class.error-notice]="!success()" role="status"><strong>{{ message() }}</strong></div> }
      }
    </section>
  `,
})
export class EpilogueComponent implements OnDestroy {
  @ViewChild('preview') preview?: ElementRef<HTMLVideoElement>;
  readonly state = inject(AdventureStateService);
  readonly arrivedHome = signal(false);
  readonly manualMode = signal(false);
  readonly cameraStatus = signal<'idle' | 'loading' | 'active' | 'denied'>('idle');
  readonly message = signal('');
  readonly success = signal(false);
  readonly manualCode = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(4)] });
  private readonly qr = inject(QrService);
  private readonly router = inject(Router);
  private reader?: BrowserMultiFormatReader;
  private controls?: IScannerControls;
  private validating = false;

  ngOnDestroy(): void { this.stopCamera(); }
  confirmArrival(): void {
    this.arrivedHome.set(true);
    setTimeout(() => void this.startCamera());
  }
  async startCamera(): Promise<void> {
    if (!this.preview) return;
    this.cameraStatus.set('loading'); this.reader = new BrowserMultiFormatReader();
    try {
      this.controls = await this.reader.decodeFromConstraints({ video: { facingMode: { ideal: 'environment' } }, audio: false }, this.preview.nativeElement, (result) => {
        if (result && !this.validating) this.validate(result.getText(), false);
      });
      this.cameraStatus.set('active');
    } catch { this.cameraStatus.set('denied'); this.manualMode.set(true); }
  }
  openManual(): void { this.stopCamera(); this.manualMode.set(true); this.message.set(''); }
  restartCamera(): void { this.manualMode.set(false); this.message.set(''); setTimeout(() => void this.startCamera()); }
  validateManual(): void { if (!this.manualCode.invalid) this.validate(this.manualCode.value, true); }
  private validate(value: string, manual: boolean): void {
    const valid = manual ? this.qr.validateManual(value, this.state.config.epilogue) : this.qr.validateScanned(value, this.state.config.epilogue);
    if (!valid) { this.success.set(false); this.message.set('Esa no es la señal que estás buscando.'); navigator.vibrate?.(60); return; }
    this.validating = true; this.stopCamera(); this.state.completeEpilogue(); this.success.set(true); this.message.set('Aventura completada.'); navigator.vibrate?.([70, 40, 100]);
    setTimeout(() => void this.router.navigate(['/final']), 700);
  }
  private stopCamera(): void { this.controls?.stop(); this.controls = undefined; const stream = this.preview?.nativeElement.srcObject as MediaStream | null; stream?.getTracks().forEach((track) => track.stop()); if (this.preview) this.preview.nativeElement.srcObject = null; }
}
