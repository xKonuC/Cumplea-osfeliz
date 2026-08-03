import { AfterViewInit, Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { QrService } from '../../core/services/qr.service';
import { FragmentBoardComponent } from '../../shared/fragment-board/fragment-board.component';

@Component({
  selector: 'app-epilogue',
  imports: [ReactiveFormsModule, RouterLink, FragmentBoardComponent],
  template: `
    <section class="page page-enter epilogue-gate">
      @if (state.completedCount() < 6) {
        <div class="locked-final"><span>⌁</span><h1>La última puerta sigue cerrada</h1><p>Primero reúne los seis fragmentos.</p><a class="primary-button" routerLink="/capitulos">Volver a los capítulos</a></div>
      } @else {
        <p class="eyebrow">De regreso a casa</p><h1>La habitación guarda el epílogo</h1>
        <p class="lead">Ya están aquí los seis fragmentos. Busca una última señal dentro de la habitación decorada.</p>
        <app-fragment-board [fragments]="fragments" [unlockedIds]="state.progress().unlockedRewardIds" [assembled]="true" />
        @if (!manualMode()) {
          <div class="camera-shell epilogue-camera"><video #preview muted playsinline aria-label="Vista previa de la cámara"></video><div class="scan-frame"><i></i><i></i><i></i><i></i></div><p>Mantén el QR de la habitación dentro del marco</p></div>
          @if (cameraStatus() === 'loading') { <p class="status-message">Preparando la cámara…</p> }
          @if (cameraStatus() === 'denied') { <div class="notice error-notice"><strong>La cámara no está disponible.</strong><span>Usa el código escrito junto al QR.</span></div> }
          <button class="text-button centered" type="button" (click)="openManual()">Ingresar código manual</button>
        } @else {
          <div class="manual-card"><div class="manual-icon">✦</div><h2>La última señal</h2><p>Escribe el código que está dentro de la habitación.</p><label for="epilogueCode">Código de respaldo</label><input id="epilogueCode" [formControl]="manualCode" autocomplete="off" /><button class="primary-button" type="button" (click)="validateManual()" [disabled]="manualCode.invalid">Abrir el epílogo</button><button class="text-button" type="button" (click)="restartCamera()">Volver a la cámara</button></div>
        }
        @if (message()) { <div class="notice" [class.success-notice]="success()" [class.error-notice]="!success()" role="status"><strong>{{ message() }}</strong></div> }
      }
    </section>
  `,
})
export class EpilogueComponent implements AfterViewInit, OnDestroy {
  @ViewChild('preview') preview?: ElementRef<HTMLVideoElement>;
  readonly state = inject(AdventureStateService);
  readonly fragments = this.state.config.stages.map((stage) => stage.fragment);
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

  ngAfterViewInit(): void { if (this.state.completedCount() === 6) void this.startCamera(); }
  ngOnDestroy(): void { this.stopCamera(); }
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
    if (!valid) { this.success.set(false); this.message.set('Esa no es la señal de la habitación.'); navigator.vibrate?.(60); return; }
    this.validating = true; this.stopCamera(); this.state.completeEpilogue(); this.success.set(true); this.message.set('Aventura completada.'); navigator.vibrate?.([70, 40, 100]);
    setTimeout(() => void this.router.navigate(['/final']), 700);
  }
  private stopCamera(): void { this.controls?.stop(); this.controls = undefined; const stream = this.preview?.nativeElement.srcObject as MediaStream | null; stream?.getTracks().forEach((track) => track.stop()); if (this.preview) this.preview.nativeElement.srcObject = null; }
}
