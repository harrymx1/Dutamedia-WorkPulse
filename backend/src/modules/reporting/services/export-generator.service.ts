import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as zlib from 'node:zlib';
import { S3StorageService } from '../../file-storage/services/s3-storage.service.js';
import { AuditService } from '../../audit/audit.service.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';

export interface ExportTableData {
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

export interface ExportPayload {
  reportType: string;
  title: string;
  subtitle?: string;
  generatedAt: Date;
  generatedBy: string;
  tables: {
    title?: string;
    data: ExportTableData;
  }[];
}

export interface ExportResult {
  downloadUrl: string;
  expiresIn: number;
  filename: string;
  format: 'pdf' | 'xlsx';
  storagePath: string;
}

@Injectable()
export class ExportGeneratorService {
  private readonly logger = new Logger(ExportGeneratorService.name);

  constructor(
    private readonly s3StorageService: S3StorageService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Menghasilkan file export (PDF atau XLSX) dan mengunggahnya ke Object Storage (SAD §13.5, §14.2).
   */
  async generateAndUploadExport(
    user: CurrentUserPayload,
    reportType: string,
    format: 'pdf' | 'xlsx',
    payload: ExportPayload,
  ): Promise<ExportResult> {
    const fileId = randomUUID();
    const requestId = randomUUID().slice(0, 8);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `WorkPulse_${reportType}_${dateStr}.${format}`;
    const storagePath = `exports/${reportType}/${requestId}/${fileId}.${format}`;

    let buffer: Buffer;
    let contentType: string;

    if (format === 'pdf') {
      buffer = this.buildPdfBuffer(payload);
      contentType = 'application/pdf';
    } else {
      buffer = this.buildXlsxBuffer(payload);
      contentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    // Upload buffer ke Object Storage (SAD §13.5)
    await this.s3StorageService.uploadBuffer(storagePath, buffer, contentType);

    // Dapatkan signed GET URL berdurasi 15 menit = 900 detik (SAD §13.5, §14.4)
    const expiresIn = 900;
    const downloadUrl = await this.s3StorageService.createPresignedGetUrl(
      storagePath,
      expiresIn,
    );

    // Catat audit log (SAD §15.2, §13.3)
    await this.auditService.record({
      actorUserId: user.userId,
      action: 'REPORT_EXPORTED',
      relatedEntityType: 'Report',
      relatedEntityId: reportType,
      valueAfter: {
        reportType,
        format,
        filename,
        storagePath,
        fileSizeBytes: buffer.length,
        expiresIn,
      },
    });

    return {
      downloadUrl,
      expiresIn,
      filename,
      format,
      storagePath,
    };
  }

  /**
   * Membangun binary PDF 1.4 murni yang valid tanpa dependensi eksternal.
   */
  buildPdfBuffer(payload: ExportPayload): Buffer {
    const pages: string[] = [];
    let currentStream = '';
    let currentY = 790;

    const escapePdf = (str: string): string => {
      return str
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
    };

    const addHeaderToPage = (isFirstPage = false) => {
      if (isFirstPage) {
        currentStream += `BT /F2 16 Tf 50 790 Td (WorkPulse - Daily Accountability System) Tj ET\n`;
        currentStream += `BT /F2 13 Tf 50 770 Td (${escapePdf(payload.title)}) Tj ET\n`;
        if (payload.subtitle) {
          currentStream += `BT /F1 10 Tf 50 755 Td (${escapePdf(payload.subtitle)}) Tj ET\n`;
        }
        currentStream += `BT /F1 9 Tf 50 738 Td (Waktu Generate: ${escapePdf(payload.generatedAt.toLocaleString('id-ID'))} | Oleh: ${escapePdf(payload.generatedBy)}) Tj ET\n`;
        // Horizontal line
        currentStream += `0.7 0.7 0.7 RG 1 w 50 728 m 545 728 l S\n`;
        currentY = 710;
      } else {
        currentStream += `BT /F2 10 Tf 50 800 Td (${escapePdf(payload.title)} (Lanjutan)) Tj ET\n`;
        currentStream += `0.8 0.8 0.8 RG 0.5 w 50 792 m 545 792 l S\n`;
        currentY = 770;
      }
    };

    const flushPage = () => {
      pages.push(currentStream);
      currentStream = '';
      currentY = 790;
    };

    // First page
    addHeaderToPage(true);

    for (const tableItem of payload.tables) {
      if (currentY < 120) {
        flushPage();
        addHeaderToPage(false);
      }

      if (tableItem.title) {
        currentStream += `BT /F2 11 Tf 50 ${currentY} Td (${escapePdf(tableItem.title)}) Tj ET\n`;
        currentY -= 18;
      }

      const { headers, rows } = tableItem.data;
      if (headers.length === 0) continue;

      const colWidth = Math.max(40, Math.floor(495 / headers.length));

      // Table Header Background & Text
      currentStream += `0.92 0.94 0.96 rg 50 ${currentY - 4} ${headers.length * colWidth} 16 re f\n`;
      headers.forEach((h, idx) => {
        const x = 54 + idx * colWidth;
        const text = escapePdf(String(h).slice(0, Math.floor(colWidth / 6)));
        currentStream += `BT /F2 9 Tf ${x} ${currentY} Td (${text}) Tj ET\n`;
      });
      currentY -= 18;

      // Table Rows
      for (const row of rows) {
        if (currentY < 60) {
          flushPage();
          addHeaderToPage(false);
        }

        // Draw light divider
        currentStream += `0.9 0.9 0.9 RG 0.5 w 50 ${currentY + 10} m ${50 + headers.length * colWidth} ${currentY + 10} l S\n`;

        row.forEach((cell, idx) => {
          if (idx >= headers.length) return;
          const x = 54 + idx * colWidth;
          const cellStr = cell === null || cell === undefined ? '-' : String(cell);
          const text = escapePdf(cellStr.slice(0, Math.floor(colWidth / 6)));
          currentStream += `BT /F1 8.5 Tf ${x} ${currentY} Td (${text}) Tj ET\n`;
        });
        currentY -= 15;
      }

      currentY -= 15;
    }

    flushPage();

    // Assemble PDF 1.4 structure
    // Placeholders for page object IDs
    const pageObjectIds: number[] = [];
    const streamObjectIds: number[] = [];

    // Precalculate object indices:
    // 1: Catalog
    // 2: Pages
    // 3: Font F1
    // 4: Font F2
    // For each page: PageObj, StreamObj

    let nextId = 5;
    for (let i = 0; i < pages.length; i++) {
      pageObjectIds.push(nextId++);
      streamObjectIds.push(nextId++);
    }

    const catalogObj = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const kidsStr = pageObjectIds.map((id) => `${id} 0 R`).join(' ');
    const pagesObj = `2 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${pages.length} >>\nendobj\n`;
    const fontF1Obj = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
    const fontF2Obj = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;

    const allObjectsText: string[] = [catalogObj, pagesObj, fontF1Obj, fontF2Obj];

    for (let i = 0; i < pages.length; i++) {
      const pageId = pageObjectIds[i];
      const streamId = streamObjectIds[i];
      const streamBytes = Buffer.from(pages[i], 'utf-8');

      const pageObj = `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents ${streamId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>\nendobj\n`;
      const streamObj = `${streamId} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${pages[i]}\nendstream\nendobj\n`;

      allObjectsText.push(pageObj);
      allObjectsText.push(streamObj);
    }

    const header = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
    let body = header;
    const xrefOffsets: number[] = [0];

    for (const obj of allObjectsText) {
      xrefOffsets.push(Buffer.byteLength(body, 'utf-8'));
      body += obj;
    }

    const startXref = Buffer.byteLength(body, 'utf-8');
    let xref = `xref\n0 ${xrefOffsets.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < xrefOffsets.length; i++) {
      xref += `${xrefOffsets[i].toString().padStart(10, '0')} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${xrefOffsets.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

    return Buffer.from(body + xref + trailer, 'utf-8');
  }

  /**
   * Membangun binary OpenXML Spreadsheet (.xlsx) yang valid menggunakan format ZIP murni.
   */
  buildXlsxBuffer(payload: ExportPayload): Buffer {
    const escapeXml = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    // Bangun sheetData XML
    let sheetDataXml = '';
    let rowIdx = 1;

    // Title row
    sheetDataXml += `<row r="${rowIdx}"><c r="A${rowIdx}" t="inlineStr"><is><t>${escapeXml(payload.title)}</t></is></c></row>`;
    rowIdx++;

    if (payload.subtitle) {
      sheetDataXml += `<row r="${rowIdx}"><c r="A${rowIdx}" t="inlineStr"><is><t>${escapeXml(payload.subtitle)}</t></is></c></row>`;
      rowIdx++;
    }

    sheetDataXml += `<row r="${rowIdx}"><c r="A${rowIdx}" t="inlineStr"><is><t>Waktu: ${escapeXml(payload.generatedAt.toISOString())} | Oleh: ${escapeXml(payload.generatedBy)}</t></is></c></row>`;
    rowIdx += 2; // Blank row

    for (const tableItem of payload.tables) {
      if (tableItem.title) {
        sheetDataXml += `<row r="${rowIdx}"><c r="A${rowIdx}" t="inlineStr"><is><t>${escapeXml(tableItem.title)}</t></is></c></row>`;
        rowIdx++;
      }

      const { headers, rows } = tableItem.data;
      if (headers.length === 0) continue;

      // Headers row
      sheetDataXml += `<row r="${rowIdx}">`;
      headers.forEach((h, colIdx) => {
        const colLetter = this.getColumnLetter(colIdx + 1);
        sheetDataXml += `<c r="${colLetter}${rowIdx}" t="inlineStr"><is><t>${escapeXml(String(h))}</t></is></c>`;
      });
      sheetDataXml += `</row>`;
      rowIdx++;

      // Data rows
      for (const row of rows) {
        sheetDataXml += `<row r="${rowIdx}">`;
        row.forEach((val, colIdx) => {
          const colLetter = this.getColumnLetter(colIdx + 1);
          if (val === null || val === undefined) {
            sheetDataXml += `<c r="${colLetter}${rowIdx}" t="inlineStr"><is><t>-</t></is></c>`;
          } else if (typeof val === 'number') {
            sheetDataXml += `<c r="${colLetter}${rowIdx}"><v>${val}</v></c>`;
          } else if (typeof val === 'boolean') {
            sheetDataXml += `<c r="${colLetter}${rowIdx}" t="b"><v>${val ? 1 : 0}</v></c>`;
          } else {
            sheetDataXml += `<c r="${colLetter}${rowIdx}" t="inlineStr"><is><t>${escapeXml(String(val))}</t></is></c>`;
          }
        });
        sheetDataXml += `</row>`;
        rowIdx++;
      }

      rowIdx++; // Blank row between tables
    }

    const sheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetDataXml}</sheetData>
</worksheet>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Report" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

    const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

    const zipEntries: { path: string; data: Buffer }[] = [
      { path: '[Content_Types].xml', data: Buffer.from(contentTypesXml, 'utf-8') },
      { path: '_rels/.rels', data: Buffer.from(rootRelsXml, 'utf-8') },
      { path: 'xl/workbook.xml', data: Buffer.from(workbookXml, 'utf-8') },
      { path: 'xl/_rels/workbook.xml.rels', data: Buffer.from(workbookRelsXml, 'utf-8') },
      { path: 'xl/worksheets/sheet1.xml', data: Buffer.from(sheet1Xml, 'utf-8') },
    ];

    return this.createZipBuffer(zipEntries);
  }

  private getColumnLetter(colNumber: number): string {
    let temp = colNumber;
    let letter = '';
    while (temp > 0) {
      const mod = (temp - 1) % 26;
      letter = String.fromCharCode(65 + mod) + letter;
      temp = Math.floor((temp - mod) / 26);
    }
    return letter;
  }

  /**
   * ZIP generator murni berbasis Buffer dan DEFLATE zlib standard.
   */
  private createZipBuffer(entries: { path: string; data: Buffer }[]): Buffer {
    const localHeaders: Buffer[] = [];
    const centralHeaders: Buffer[] = [];
    let offset = 0;

    for (const entry of entries) {
      const pathBuf = Buffer.from(entry.path, 'utf-8');
      const compressedData = zlib.deflateRawSync(entry.data);
      const crc = this.crc32(entry.data);

      // Local file header (30 bytes + pathBuf.length)
      const localHeader = Buffer.alloc(30 + pathBuf.length);
      localHeader.writeUInt32LE(0x04034b50, 0); // signature
      localHeader.writeUInt16LE(20, 4); // version needed (2.0)
      localHeader.writeUInt16LE(0, 6); // flags
      localHeader.writeUInt16LE(8, 8); // compression: 8 = deflate
      localHeader.writeUInt16LE(0, 10); // mod time
      localHeader.writeUInt16LE(0, 12); // mod date
      localHeader.writeUInt32LE(crc, 14); // crc-32
      localHeader.writeUInt32LE(compressedData.length, 18); // compressed size
      localHeader.writeUInt32LE(entry.data.length, 22); // uncompressed size
      localHeader.writeUInt16LE(pathBuf.length, 26); // file name length
      localHeader.writeUInt16LE(0, 28); // extra field length
      pathBuf.copy(localHeader, 30);

      localHeaders.push(localHeader, compressedData);

      // Central directory header (46 bytes + pathBuf.length)
      const centralHeader = Buffer.alloc(46 + pathBuf.length);
      centralHeader.writeUInt32LE(0x02014b50, 0); // signature
      centralHeader.writeUInt16LE(20, 4); // version made by
      centralHeader.writeUInt16LE(20, 6); // version needed
      centralHeader.writeUInt16LE(0, 8); // flags
      centralHeader.writeUInt16LE(8, 10); // compression: 8 = deflate
      centralHeader.writeUInt16LE(0, 12); // mod time
      centralHeader.writeUInt16LE(0, 14); // mod date
      centralHeader.writeUInt32LE(crc, 16); // crc-32
      centralHeader.writeUInt32LE(compressedData.length, 20); // compressed size
      centralHeader.writeUInt32LE(entry.data.length, 24); // uncompressed size
      centralHeader.writeUInt16LE(pathBuf.length, 28); // file name length
      centralHeader.writeUInt16LE(0, 30); // extra field length
      centralHeader.writeUInt16LE(0, 32); // comment length
      centralHeader.writeUInt16LE(0, 34); // disk number start
      centralHeader.writeUInt16LE(0, 36); // internal file attrs
      centralHeader.writeUInt32LE(0, 38); // external file attrs
      centralHeader.writeUInt32LE(offset, 42); // relative offset of local header
      pathBuf.copy(centralHeader, 46);

      centralHeaders.push(centralHeader);

      offset += localHeader.length + compressedData.length;
    }

    const centralDirOffset = offset;
    let centralDirSize = 0;
    for (const ch of centralHeaders) {
      centralDirSize += ch.length;
    }

    // End of central directory record (22 bytes)
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // signature
    eocd.writeUInt16LE(0, 4); // number of this disk
    eocd.writeUInt16LE(0, 6); // disk where central dir starts
    eocd.writeUInt16LE(entries.length, 8); // number of central dir records on disk
    eocd.writeUInt16LE(entries.length, 10); // total number of central dir records
    eocd.writeUInt32LE(centralDirSize, 12); // size of central dir
    eocd.writeUInt32LE(centralDirOffset, 16); // offset of start of central dir
    eocd.writeUInt16LE(0, 20); // comment length

    return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
  }

  /**
   * Standard CRC32 implementation untuk file ZIP.
   */
  private crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      const byte = buf[i];
      crc = (crc >>> 8) ^ ExportGeneratorService.CRC_TABLE[(crc ^ byte) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  private static readonly CRC_TABLE: Uint32Array = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c >>> 0;
    }
    return table;
  })();
}
