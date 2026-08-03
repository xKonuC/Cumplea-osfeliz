import { AfterViewInit, Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BrowserCodeReader, BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { QrService } from '../../core/services/qr.service';
import { StageConfig } from '../../core/models/adventure.models';

@Component({
  selector: 'app-scanner',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    @if (stage; as current) {
      <section class="scanner-page page-enter">
        <header class="scanner-header">
          <a [routerLink]="['/etapa', current.id]" aria-label="Cancelar escaneo">×</a>
          <div><small>Capítulo {{ current.order }}</small><h1>Encuentra la señal</h1></div>
          <span></span>
        </header>

        @if (!manualMode()) {
          <div class="camera-shell" [class.camera-awaiting]="cameraStatus() === 'idle'">
            <video #preview muted playsinline aria-label="Vista previa de la cámara"></video>
            @if (cameraStatus() === 'idle') {
              <div class="camera-permission-card">
                <div class="manual-icon" aria-hidden="true">⌗</div>
                <h2>Escanea el QR del sobre</h2>
                <p>Safari te pedirá permiso para usar la cámara.</p>
                <button class="primary-button" type="button" (click)="activateCamera()">Activar cámara</button>
              </div>
            } @else {
              <div class="scan-frame"><i></i><i></i><i></i><i></i></div>
              <p>Mantén el código dentro del marco</p>
            }
          </div>
          @if (cameraStatus() === 'loading') { <p class="status-message">Preparando la cámara…</p> }
          @if (cameraStatus() === 'denied') {
            <div class="notice error-notice"><strong>No pudimos usar la cámara.</strong><span>Puedes continuar con el código manual.</span></div>
          }
          @if (devices().length > 1) {
            <button class="secondary-button full-button" type="button" (click)="switchCamera()">Cambiar cámara</button>
          }
          <button class="text-button centered" type="button" (click)="openManual()">Ingresar código manual</button>
        } @else {
          <div class="manual-card">
            <div class="manual-icon">⌁</div>
            <h1>Ingresa el código</h1>
            <p>{{ current.validationMode === 'code-only' ? 'Está escondido junto a la rosa. No distingue mayúsculas ni tildes.' : 'Está impreso junto al QR. No distingue mayúsculas ni tildes.' }}</p>
            @if (cameraIssue()) { <div class="notice error-notice"><strong>No pudimos abrir la cámara.</strong><span>{{ cameraIssue() }}</span></div> }
            <label for="manualCode">Código de respaldo</label>
            <input id="manualCode" type="text" autocomplete="off" [formControl]="manualCode" placeholder="Ej. PALABRA-1234" />
            <button class="primary-button" type="button" (click)="validateManual()" [disabled]="manualCode.invalid">Desbloquear recuerdo</button>
            @if (current.validationMode !== 'code-only') { <button class="text-button" type="button" (click)="restartCamera()">Volver a la cámara</button> }
          </div>
        }

        @if (message()) {
          <div class="notice" [class.success-notice]="messageType() === 'success'" [class.error-notice]="messageType() === 'error'" role="status">
            <strong>{{ message() }}</strong>
            @if (messageType() === 'error') { <span>Revisa que estés en el lugar correcto o utiliza una pista.</span> }
          </div>
        }

        @if (unlocking()) {
          <div class="unlock-transition" role="status" aria-live="assertive">
            <div class="unlock-transition__glow" aria-hidden="true"></div>
            <div class="unlock-transition__seal" aria-hidden="true"><span>✓</span><i></i><i></i><i></i></div>
            <p class="eyebrow">Código reconocido</p>
            <h2>¡Correcto!</h2>
            <p>Desbloqueando el siguiente recuerdo<span class="loading-dots" aria-hidden="true"><i></i><i></i><i></i></span></p>
          </div>
        }
      </section>
    }
  `,
})
export class ScannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('preview') preview?: ElementRef<HTMLVideoElement>;
  readonly state = inject(AdventureStateService);
  private readonly qr = inject(QrService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly stage: StageConfig | undefined = this.state.stageById(this.route.snapshot.paramMap.get('id') ?? '');
  readonly manualMode = signal(this.stage?.validationMode === 'code-only' || this.route.snapshot.queryParamMap.get('manual') === 'true');
  readonly cameraStatus = signal<'idle' | 'loading' | 'active' | 'denied'>('idle');
  readonly devices = signal<MediaDeviceInfo[]>([]);
  readonly message = signal('');
  readonly messageType = signal<'success' | 'error'>('error');
  readonly unlocking = signal(false);
  readonly cameraIssue = signal('');
  readonly manualCode = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(4)] });
  private reader?: BrowserMultiFormatReader;
  private controls?: IScannerControls;
  private deviceIndex = 0;
  private validating = false;

  ngAfterViewInit(): void {
    // En iPhone la cámara debe iniciarse desde un toque explícito del usuario.
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera(deviceId?: string): Promise<void> {
    if (!this.preview || !this.stage) return;
    if (!window.isSecureContext) {
      this.cameraIssue.set('En iPhone la cámara necesita una dirección HTTPS. Mientras haces pruebas puedes usar el código manual.');
      this.cameraStatus.set('denied');
      this.manualMode.set(true);
      return;
    }
    this.cameraIssue.set('');
    this.cameraStatus.set('loading');
    this.reader = new BrowserMultiFormatReader();
    try {
      this.devices.set(await BrowserCodeReader.listVideoInputDevices());
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: 'environment' } },
        audio: false,
      };
      this.controls = await this.reader.decodeFromConstraints(constraints, this.preview.nativeElement, (result) => {
        if (result && !this.validating) this.handleScan(result.getText());
      });
      this.cameraStatus.set('active');
    } catch {
      this.cameraIssue.set('Revisa en Ajustes › Safari › Cámara que el permiso esté habilitado y vuelve a intentarlo. También puedes usar el código manual.');
      this.cameraStatus.set('denied');
      this.manualMode.set(true);
    }
  }

  activateCamera(): void {
    void this.startCamera();
  }

  switchCamera(): void {
    const list = this.devices();
    if (!list.length) return;
    this.deviceIndex = (this.deviceIndex + 1) % list.length;
    this.stopCamera();
    void this.startCamera(list[this.deviceIndex].deviceId);
  }

  openManual(): void {
    this.stopCamera();
    this.manualMode.set(true);
    this.message.set('');
  }

  restartCamera(): void {
    if (this.stage?.validationMode === 'code-only') return;
    this.manualMode.set(false);
    this.message.set('');
    this.cameraIssue.set('Toca “Activar cámara” para volver a intentarlo.');
  }

  validateManual(): void {
    if (!this.stage || this.manualCode.invalid) return;
    if (this.qr.validateManual(this.manualCode.value, this.stage)) this.success();
    else this.failure();
  }

  private handleScan(value: string): void {
    if (!this.stage) return;
    if (this.qr.validateScanned(value, this.stage)) this.success();
    else this.failure();
  }

  private success(): void {
    if (!this.stage || this.validating) return;
    this.validating = true;
    this.stopCamera();
    this.state.unlockVideo(this.stage.id);
    this.messageType.set('success');
    this.message.set('Código correcto.');
    this.unlocking.set(true);
    navigator.vibrate?.([80, 40, 120]);
    setTimeout(() => void this.router.navigate(['/recuerdo', this.stage?.id]), 1900);
  }

  private failure(): void {
    this.messageType.set('error');
    this.message.set('Este código pertenece a otro momento de la aventura.');
    navigator.vibrate?.(80);
  }

  private stopCamera(): void {
    this.controls?.stop();
    this.controls = undefined;
    const stream = this.preview?.nativeElement.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    if (this.preview) this.preview.nativeElement.srcObject = null;
  }
}
