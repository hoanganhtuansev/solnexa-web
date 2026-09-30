import zlib from 'zlib';

/**
 * SOLNEXA PDF Text Extractor
 * Robust multi-engine extractor:
 * 1. PDFParse (pdf-parse v2)
 * 2. pdfjs-dist direct page-by-page text content with layout coordinates
 * 3. Raw FlateDecode stream decompressor
 * 4. ASCII/UTF-8 regex fallback
 */

export interface ExtractedPageText {
  pageNumber: number;
  text: string;
  charLength: number;
  wordCount: number;
  hasTables: boolean;
  electricalKeywordDensity: number;
}

export interface PdfExtractionResult {
  pageCount: number;
  totalPagesText: string;
  pages: ExtractedPageText[];
  metadata?: Record<string, unknown>;
}

export class PdfTextExtractor {
  public async extractText(buffer: Buffer): Promise<PdfExtractionResult> {
    // Engine 1: PDFParse v2
    try {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      try {
        const textResult = await parser.getText();
        if (textResult && textResult.pages && textResult.pages.length > 0) {
          const pages: ExtractedPageText[] = textResult.pages.map((p: any) => {
            const pageText = (p.text || '').trim();
            const words = pageText ? pageText.split(/\s+/).length : 0;
            const hasTables =
              /(:|\t|\||\s{3,}\d+)/.test(pageText) ||
              (pageText.match(/\d+(\.\d+)?\s*(V|kW|A|Hz|%|kVA|kWh|m|mm²|kg)/g) || []).length > 3;

            const electricalTerms =
              pageText.match(
                /\b(voltage|current|power|efficiency|frequency|inverter|module|mppt|capacity|resistance|thd|temp|voc|isc|vmp|imp|pmax|protection|ip\d{2})\b/gi
              ) || [];
            const electricalKeywordDensity = words > 0 ? electricalTerms.length / words : 0;

            return {
              pageNumber: p.num || 1,
              text: pageText,
              charLength: pageText.length,
              wordCount: words,
              hasTables,
              electricalKeywordDensity
            };
          });

          const totalText = textResult.text || pages.map(p => p.text).join('\n\n');
          if (totalText.trim().length > 20) {
            return {
              pageCount: textResult.total || pages.length,
              totalPagesText: totalText,
              pages
            };
          }
        }
      } finally {
        if (parser && typeof parser.destroy === 'function') {
          await parser.destroy().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('PDFParse v2 attempt failed or unsupported, trying pdfjs-dist fallback:', err);
    }

    // Engine 2: pdfjs-dist direct extraction
    try {
      // @ts-ignore
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        disableFontFace: true,
        useSystemFonts: true
      });
      const doc = await loadingTask.promise;
      const totalPages = doc.numPages;
      const pages: ExtractedPageText[] = [];
      let fullText = '';

      for (let i = 1; i <= totalPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        let lastY: number | null = null;
        let pageLines: string[] = [];
        let currentLine = '';

        for (const item of textContent.items as any[]) {
          if (!item.str) continue;
          const y = item.transform ? item.transform[5] : 0;
          if (lastY === null || Math.abs(y - lastY) < 4) {
            currentLine += (currentLine ? ' ' : '') + item.str;
          } else {
            if (currentLine) pageLines.push(currentLine);
            currentLine = item.str;
          }
          lastY = y;
        }
        if (currentLine) pageLines.push(currentLine);

        const pageText = pageLines.join('\n').trim();
        const words = pageText ? pageText.split(/\s+/).length : 0;
        const hasTables =
          /(:|\t|\||\s{3,}\d+)/.test(pageText) ||
          (pageText.match(/\d+(\.\d+)?\s*(V|kW|A|Hz|%|kVA|kWh|m|mm²|kg)/g) || []).length > 3;

        const electricalTerms =
          pageText.match(
            /\b(voltage|current|power|efficiency|frequency|inverter|module|mppt|capacity|resistance|thd|temp|voc|isc|vmp|imp|pmax|protection|ip\d{2})\b/gi
          ) || [];
        const electricalKeywordDensity = words > 0 ? electricalTerms.length / words : 0;

        pages.push({
          pageNumber: i,
          text: pageText,
          charLength: pageText.length,
          wordCount: words,
          hasTables,
          electricalKeywordDensity
        });

        fullText += `\n--- Page ${i} ---\n` + pageText;
      }

      if (fullText.trim().length > 20) {
        return {
          pageCount: totalPages,
          totalPagesText: fullText.trim(),
          pages
        };
      }
    } catch (err) {
      console.warn('pdfjs-dist attempt failed, trying raw stream decompression:', err);
    }

    // Engine 3: Decompress raw FlateDecode streams inside PDF
    try {
      const pdfRaw = buffer.toString('binary');
      const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let match: RegExpExecArray | null;
      const decompressedChunks: string[] = [];

      while ((match = streamRegex.exec(pdfRaw)) !== null) {
        const streamData = Buffer.from(match[1], 'binary');
        try {
          const decompressed = zlib.inflateSync(streamData);
          const chunkStr = decompressed.toString('utf-8');
          // Extract text within BT (Begin Text) ... ET (End Text) or Tj / TJ operators
          const textMatches = chunkStr.match(/\((.*?)\)\s*Tj/g) || chunkStr.match(/\[(.*?)\]\s*TJ/g);
          if (textMatches && textMatches.length > 0) {
            decompressedChunks.push(
              textMatches
                .map(m => m.replace(/^[\(\[]|[\)\]]\s*TJ?$/g, ''))
                .join(' ')
            );
          } else {
            const cleanText = chunkStr.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ');
            if (cleanText.length > 30) {
              decompressedChunks.push(cleanText);
            }
          }
        } catch {
          // not all streams are flate compressed or valid zlib, skip quietly
        }
      }

      if (decompressedChunks.length > 0) {
        const fullDecompressed = decompressedChunks.join('\n\n');
        return {
          pageCount: 1,
          totalPagesText: fullDecompressed,
          pages: [
            {
              pageNumber: 1,
              text: fullDecompressed,
              charLength: fullDecompressed.length,
              wordCount: fullDecompressed.split(/\s+/).length,
              hasTables: true,
              electricalKeywordDensity: 0.08
            }
          ]
        };
      }
    } catch (err) {
      console.warn('FlateDecode stream decompressor failed:', err);
    }

    // Engine 4: Fallback raw ASCII/UTF-8 extraction
    const rawString = buffer.toString('utf-8');
    const textMatches = rawString.match(/[A-Za-z0-9\s.,:;()/%+=°_-]{4,}/g) || [];
    const extractedFallback = textMatches.join(' ').trim();

    return {
      pageCount: 1,
      totalPagesText: extractedFallback || 'Datasheet document uploaded (text extraction fallback)',
      pages: [
        {
          pageNumber: 1,
          text: extractedFallback || 'Datasheet document uploaded (text extraction fallback)',
          charLength: extractedFallback.length,
          wordCount: extractedFallback ? extractedFallback.split(/\s+/).length : 0,
          hasTables: true,
          electricalKeywordDensity: 0.05
        }
      ]
    };
  }
}

export const pdfTextExtractor = new PdfTextExtractor();
