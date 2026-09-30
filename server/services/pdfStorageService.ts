/**
 * SOLNEXA PDF Storage Service
 * Handles disk storage of uploaded datasheets and generates unique IDs.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Datasheet } from '../../src/types';

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

export class PdfStorageService {
  constructor() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  public storePdf(originalFilename: string, buffer: Buffer, mimeType: string = 'application/pdf'): Datasheet {
    const id = `ds-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const sanitizedName = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageFilename = `${id}_${sanitizedName}`;
    const storagePath = path.join(UPLOADS_DIR, storageFilename);

    fs.writeFileSync(storagePath, buffer);

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      id,
      originalFilename,
      storagePath,
      fileSize: buffer.length,
      mimeType,
      pageCount: 1, // Will be updated after text extraction
      uploadDate: new Date().toISOString(),
      sha256: hash
    };
  }

  public getPdfBuffer(storagePath: string): Buffer | null {
    if (fs.existsSync(storagePath)) {
      return fs.readFileSync(storagePath);
    }
    return null;
  }

  public deletePdf(storagePath: string): boolean {
    if (fs.existsSync(storagePath)) {
      fs.unlinkSync(storagePath);
      return true;
    }
    return false;
  }
}

export const pdfStorageService = new PdfStorageService();
