import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as QRCode from 'qrcode';
import { AdventureStateService } from '../../core/services/adventure-state.service';
import { StageConfig } from '../../core/models/adventure.models';

interface PrintableQr {
  stage: StageConfig;
  dataUrl: string;
}

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  template: `
    <section class="admin-page page-enter">
      @if (!authenticated()) {
        <div class="admin-login">
          <div class="final-seal">⌁</div>
          <p class="eyebrow">Herramienta de emergencia</p>
          <h1>Panel secreto</h1>
          <p>Esta ruta es solo para quien organiza la aventura.</p>
          <label for="adminKey">Clave</label>
          <input id="adminKey" type="password" [(ngModel)]="key" (keyup.enter)="login()" />
          <button class="primary-button" type="button" (click)="login()">Entrar</button>
          @if (loginError()) { <p class="form-error" role="alert">La clave no es correcta.</p> }
        </div>
      } @else {
        <div class="admin-content">
          <div class="admin-heading">
            <div><p class="eyebrow">Control local</p><h1>Panel secreto</h1></div>
            <button class="text-button" type="button" (click)="authenticated.set(false)">Cerrar</button>
          </div>

          <div class="admin-stats">
            <article><small>Capítulo actual</small><strong>{{ currentStage()?.title ?? '—' }}</strong></article>
            <article><small>Completadas</small><strong>{{ state.completedCount() }} / {{ state.config.stages.length }}</strong></article>
            <article><small>Pistas usadas</small><strong>{{ totalHints() }}</strong></article>
          </div>

          <section class="admin-section">
            <h2>Capítulos y rescate</h2>
            @for (stage of state.config.stages; track stage.id) {
              <article class="admin-stage">
                <div><small>Capítulo {{ stage.order }}</small><strong>{{ stage.title }}</strong><span>{{ state.statusFor(stage) }}</span></div>
                <div class="admin-actions">
                  <button type="button" (click)="unlock(stage)">Desbloquear</button>
                  <button type="button" (click)="skipQr(stage)">Saltar QR</button>
                  <button type="button" (click)="complete(stage)">Completar</button>
                  <button type="button" (click)="testVideo(stage)">Probar video</button>
                </div>
              </article>
            }
            <div class="inline-actions">
              <button class="secondary-button" type="button" (click)="activateKind('homecoming')">Activar regreso a casa</button>
              <button class="secondary-button" type="button" (click)="completeEpilogue()">Abrir epílogo de emergencia</button>
              <button class="secondary-button" type="button" (click)="restoreCurrent()">Restaurar capítulo actual</button>
            </div>
          </section>

          <section class="admin-section">
            <h2>Respaldo del progreso</h2>
            <textarea [(ngModel)]="jsonData" rows="10" aria-label="Progreso en formato JSON"></textarea>
            <div class="inline-actions">
              <button class="secondary-button" type="button" (click)="exportProgress()">Actualizar / descargar JSON</button>
              <button class="secondary-button" type="button" (click)="importProgress()">Importar JSON</button>
              <button class="danger-button" type="button" (click)="reset()">Reiniciar todo</button>
            </div>
            @if (adminMessage()) { <p class="status-message" role="status">{{ adminMessage() }}</p> }
          </section>

          <section class="admin-section print-area">
            <div class="admin-heading"><h2>Códigos para imprimir</h2><button class="secondary-button no-print" type="button" (click)="print()">Imprimir QR</button></div>
            <p class="no-print">Cada tarjeta contiene el QR y su código manual de respaldo. Mantenlas privadas.</p>
            <div class="qr-grid">
              @for (stage of state.config.stages; track stage.id) {
                @if (stage.validationMode === 'code-only') {
                  <article class="qr-print-card code-print-card">
                    <small>Capítulo {{ stage.order }} · Sin QR</small>
                    <h3>{{ stage.title }}</h3>
                    <p>Código para esconder junto a la rosa</p>
                    <strong>{{ stage.manualCode }}</strong>
                  </article>
                }
              }
              @for (item of printableQrs(); track item.stage.id) {
                <article class="qr-print-card">
                  <small>Capítulo {{ item.stage.order }}</small>
                  <h3>{{ item.stage.title }}</h3>
                  <img [src]="item.dataUrl" [alt]="'Código QR de ' + item.stage.title" />
                  <p>Código de respaldo</p>
                  <strong>{{ item.stage.manualCode }}</strong>
                </article>
              }
              @if (epilogueQr()) {
                <article class="qr-print-card">
                  <small>Solo para la habitación decorada</small><h3>Epílogo</h3>
                  <img [src]="epilogueQr()" alt="Código QR del epílogo" />
                  <p>Código de respaldo</p><strong>{{ state.config.epilogue.manualCode }}</strong>
                </article>
              }
            </div>
          </section>
        </div>
      }
    </section>
  `,
})
export class AdminComponent {
  readonly state = inject(AdventureStateService);
  readonly authenticated = signal(false);
  readonly loginError = signal(false);
  readonly adminMessage = signal('');
  readonly printableQrs = signal<PrintableQr[]>([]);
  readonly epilogueQr = signal('');
  key = '';
  jsonData = this.state.exportJson();

  login(): void {
    const valid = this.key === this.state.config.adminKey;
    this.authenticated.set(valid);
    this.loginError.set(!valid);
    if (valid) void this.generateQrs();
  }

  currentStage(): StageConfig | undefined {
    return this.state.stageById(this.state.progress().currentStageId);
  }

  totalHints(): number {
    return Object.values(this.state.progress().hintsUsed).reduce((sum, value) => sum + value, 0);
  }

  unlock(stage: StageConfig): void {
    if (confirm(`¿Desbloquear "${stage.title}"?`)) this.state.unlockStage(stage.id);
  }

  skipQr(stage: StageConfig): void {
    if (confirm(`¿Saltar el QR de "${stage.title}"?`)) this.state.unlockVideo(stage.id);
  }

  complete(stage: StageConfig): void {
    if (confirm(`¿Marcar "${stage.title}" como completada?`)) {
      this.state.unlockVideo(stage.id);
      this.state.markVideoWatched(stage.id);
      this.state.completeStage(stage.id);
    }
  }

  testVideo(stage: StageConfig): void {
    window.open(stage.videoUrl, '_blank', 'noopener,noreferrer');
  }

  activateKind(kind: 'homecoming'): void {
    const stage = this.state.config.stages.find((item) => item.kind === kind);
    if (stage && confirm(`¿Activar "${stage.title}"?`)) this.state.unlockStage(stage.id);
  }

  completeEpilogue(): void {
    if (!confirm('¿Abrir el epílogo sin escanear el QR de la habitación?')) return;
    for (const stage of this.state.config.stages) this.state.completeStage(stage.id);
    this.state.completeEpilogue();
  }

  restoreCurrent(): void {
    if (confirm('¿Restaurar el capítulo actual sin borrar el resto del progreso?')) this.state.restoreCurrentStage();
  }

  exportProgress(): void {
    this.jsonData = this.state.exportJson();
    const blob = new Blob([this.jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nuestra-aventura-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.adminMessage.set('Progreso exportado.');
  }

  importProgress(): void {
    if (!confirm('¿Reemplazar el progreso actual con este JSON?')) return;
    this.adminMessage.set(this.state.importJson(this.jsonData) ? 'Progreso importado correctamente.' : 'El JSON no tiene un formato válido.');
  }

  reset(): void {
    if (confirm('¿Seguro que quieres borrar todo el progreso? Esta acción no se puede deshacer.')) {
      this.state.reset();
      this.jsonData = this.state.exportJson();
      this.adminMessage.set('El progreso fue reiniciado.');
    }
  }

  print(): void {
    window.print();
  }

  private async generateQrs(): Promise<void> {
    const items = await Promise.all(
      this.state.config.stages.filter((stage) => stage.validationMode !== 'code-only').map(async (stage) => ({
        stage,
        dataUrl: await QRCode.toDataURL(stage.expectedQrCode, { width: 320, margin: 2, color: { dark: '#29141d', light: '#fffaf5' } }),
      })),
    );
    this.printableQrs.set(items);
    this.epilogueQr.set(await QRCode.toDataURL(this.state.config.epilogue.expectedQrCode, { width: 320, margin: 2, color: { dark: '#29141d', light: '#fffaf5' } }));
  }
}
