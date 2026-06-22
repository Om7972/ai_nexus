import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import Papa from 'papaparse';

/**
 * Extract text from different file types
 */
export class TextExtractor {
  /**
   * Extract text from PDF file
   */
  static async extractFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);

      return {
        text: data.text,
        metadata: {
          pageCount: data.numpages,
          wordCount: data.text.split(/\s+/).length,
          info: data.info
        }
      };
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from DOCX file
   */
  static async extractFromDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;

      return {
        text,
        metadata: {
          wordCount: text.split(/\s+/).length,
          messages: result.messages
        }
      };
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from TXT file
   */
  static async extractFromTXT(filePath) {
    try {
      const text = await fs.readFile(filePath, 'utf-8');

      return {
        text,
        metadata: {
          wordCount: text.split(/\s+/).length,
          lineCount: text.split('\n').length
        }
      };
    } catch (error) {
      throw new Error(`TXT extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from CSV file
   */
  static async extractFromCSV(filePath) {
    try {
      const csvContent = await fs.readFile(filePath, 'utf-8');
      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true
      });

      // Convert CSV to readable text format
      const text = parsed.data.map(row => {
        return Object.entries(row)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      }).join('\n');

      return {
        text,
        metadata: {
          rowCount: parsed.data.length,
          columnCount: parsed.meta.fields?.length || 0,
          fields: parsed.meta.fields
        }
      };
    } catch (error) {
      throw new Error(`CSV extraction failed: ${error.message}`);
    }
  }

  /**
   * Main extraction method
   */
  static async extract(filePath, fileType) {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return this.extractFromPDF(filePath);
      case 'docx':
        return this.extractFromDOCX(filePath);
      case 'txt':
        return this.extractFromTXT(filePath);
      case 'csv':
        return this.extractFromCSV(filePath);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}

export default TextExtractor;
