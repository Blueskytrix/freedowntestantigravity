import { readFileSync, existsSync } from 'fs';
import { extname } from 'path';

// Parse PDF files
export async function parsePDF(input: { filePath: string; maxPages?: number }): Promise<string> {
  try {
    if (!existsSync(input.filePath)) {
      throw new Error(`File not found: ${input.filePath}`);
    }

    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = readFileSync(input.filePath);
    
    const data = await pdfParse(dataBuffer, {
      max: input.maxPages || 50
    });

    return JSON.stringify({
      success: true,
      text: data.text,
      numPages: data.numpages,
      info: data.info,
      metadata: data.metadata
    }, null, 2);
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Parse DOCX files
export async function parseDocx(input: { filePath: string }): Promise<string> {
  try {
    if (!existsSync(input.filePath)) {
      throw new Error(`File not found: ${input.filePath}`);
    }

    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ path: input.filePath });
    
    const htmlResult = await mammoth.convertToHtml({ path: input.filePath });

    return JSON.stringify({
      success: true,
      text: result.value,
      html: htmlResult.value,
      messages: result.messages.map(m => m.message)
    }, null, 2);
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Parse Excel files
export async function parseExcel(input: { 
  filePath: string; 
  sheetName?: string;
  asJson?: boolean;
}): Promise<string> {
  try {
    if (!existsSync(input.filePath)) {
      throw new Error(`File not found: ${input.filePath}`);
    }

    const XLSX = await import('xlsx');
    const workbook = XLSX.readFile(input.filePath);
    
    const sheetName = input.sheetName || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}. Available: ${workbook.SheetNames.join(', ')}`);
    }

    if (input.asJson) {
      const data = XLSX.utils.sheet_to_json(sheet);
      return JSON.stringify({
        success: true,
        sheetName,
        availableSheets: workbook.SheetNames,
        rowCount: data.length,
        data
      }, null, 2);
    } else {
      const text = XLSX.utils.sheet_to_txt(sheet);
      return JSON.stringify({
        success: true,
        sheetName,
        availableSheets: workbook.SheetNames,
        text
      }, null, 2);
    }
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Parse CSV files
export async function parseCSV(input: { 
  filePath: string;
  delimiter?: string;
  asJson?: boolean;
}): Promise<string> {
  try {
    if (!existsSync(input.filePath)) {
      throw new Error(`File not found: ${input.filePath}`);
    }

    const XLSX = await import('xlsx');
    const workbook = XLSX.readFile(input.filePath, {
      FS: input.delimiter || ','
    });
    
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    if (input.asJson) {
      const data = XLSX.utils.sheet_to_json(sheet);
      return JSON.stringify({
        success: true,
        rowCount: data.length,
        data
      }, null, 2);
    } else {
      const text = XLSX.utils.sheet_to_txt(sheet);
      return JSON.stringify({
        success: true,
        text
      }, null, 2);
    }
  } catch (error) {
    throw new Error(`CSV parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Parse JSON files
export async function parseJSON(input: { filePath: string }): Promise<string> {
  try {
    if (!existsSync(input.filePath)) {
      throw new Error(`File not found: ${input.filePath}`);
    }

    const content = readFileSync(input.filePath, 'utf-8');
    const data = JSON.parse(content);

    return JSON.stringify({
      success: true,
      data,
      type: Array.isArray(data) ? 'array' : 'object',
      size: Array.isArray(data) ? data.length : Object.keys(data).length
    }, null, 2);
  } catch (error) {
    throw new Error(`JSON parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Auto-detect and parse any document
export async function parseDocument(input: { 
  filePath: string;
  options?: any;
}): Promise<string> {
  const ext = extname(input.filePath).toLowerCase();

  switch (ext) {
    case '.pdf':
      return parsePDF({ filePath: input.filePath, maxPages: input.options?.maxPages });
    case '.docx':
    case '.doc':
      return parseDocx({ filePath: input.filePath });
    case '.xlsx':
    case '.xls':
      return parseExcel({ 
        filePath: input.filePath, 
        sheetName: input.options?.sheetName,
        asJson: input.options?.asJson 
      });
    case '.csv':
      return parseCSV({ 
        filePath: input.filePath,
        delimiter: input.options?.delimiter,
        asJson: input.options?.asJson
      });
    case '.json':
      return parseJSON({ filePath: input.filePath });
    case '.txt':
    case '.md':
    case '.markdown':
      const content = readFileSync(input.filePath, 'utf-8');
      return JSON.stringify({
        success: true,
        text: content,
        lines: content.split('\n').length
      }, null, 2);
    default:
      throw new Error(`Unsupported file type: ${ext}. Supported: .pdf, .docx, .xlsx, .csv, .json, .txt, .md`);
  }
}

// Tool definitions
export const documentParserTools = [
  {
    name: 'parse_pdf',
    description: 'Extract text and metadata from PDF files.',
    input_schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to PDF file' },
        maxPages: { type: 'number', description: 'Maximum pages to parse (default: 50)' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'parse_docx',
    description: 'Extract text and HTML from Word documents (.docx).',
    input_schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to DOCX file' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'parse_excel',
    description: 'Extract data from Excel files (.xlsx, .xls).',
    input_schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to Excel file' },
        sheetName: { type: 'string', description: 'Specific sheet to parse (default: first sheet)' },
        asJson: { type: 'boolean', description: 'Return as JSON objects instead of text (default: false)' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'parse_csv',
    description: 'Parse CSV files.',
    input_schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to CSV file' },
        delimiter: { type: 'string', description: 'Column delimiter (default: comma)' },
        asJson: { type: 'boolean', description: 'Return as JSON objects instead of text (default: false)' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'parse_document',
    description: 'Auto-detect file type and parse any supported document (PDF, DOCX, XLSX, CSV, JSON, TXT, MD).',
    input_schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to document file' },
        options: {
          type: 'object',
          description: 'Parser-specific options (maxPages for PDF, sheetName for Excel, delimiter for CSV, etc.)',
          properties: {
            maxPages: { type: 'number' },
            sheetName: { type: 'string' },
            delimiter: { type: 'string' },
            asJson: { type: 'boolean' }
          }
        }
      },
      required: ['filePath']
    }
  }
];
