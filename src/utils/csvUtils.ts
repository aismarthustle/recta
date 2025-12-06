import { Panel, StockSheet } from "@/types";
import { generateRandomColor } from "./colorUtils";

/**
 * Parse CSV content for panels
 * Expected format: length,width,qty,label
 */
export const parsePanelsFromCSV = (csvContent: string): Panel[] => {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  const panels: Panel[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const [length, width, quantity, label] = line.split(',').map(item => item.trim());

    if (length && width && quantity) {
      panels.push({
        id: `panel-${Date.now()}-${i}`,
        length: Number(length),
        width: Number(width),
        quantity: Number(quantity),
        label: label || `Panel ${i}`,
        color: generateRandomColor()
      });
    }
  }

  return panels;
};

/**
 * Parse CSV content for stock sheets
 * Expected format: length,width,qty,label
 */
export const parseStockSheetsFromCSV = (csvContent: string): StockSheet[] => {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  const stockSheets: StockSheet[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const [length, width, quantity, label] = line.split(',').map(item => item.trim());

    if (length && width && quantity) {
      stockSheets.push({
        id: `stock-${Date.now()}-${i}`,
        length: Number(length),
        width: Number(width),
        quantity: Number(quantity),
        label: label || `Sheet ${i}`
      });
    }
  }

  return stockSheets;
};

/**
 * Read a CSV file and return its content as a string
 */
export const readCSVFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
};
