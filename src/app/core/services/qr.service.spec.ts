import { describe, expect, it } from 'vitest';
import { ADVENTURE_CONFIG } from '../../config/adventure.config';
import { QrService } from './qr.service';

describe('QrService', () => {
  const service = new QrService();
  const stage = ADVENTURE_CONFIG.stages[0];

  it('valida el contenido exacto del QR', () => {
    expect(service.validateScanned(stage.expectedQrCode, stage)).toBe(true);
    expect(service.validateScanned('CODIGO-EQUIVOCADO', stage)).toBe(false);
  });

  it('normaliza espacios, mayúsculas y tildes en el código manual', () => {
    expect(service.validateManual(`  ${stage.manualCode.toLowerCase()}  `, stage)).toBe(true);
  });
});
