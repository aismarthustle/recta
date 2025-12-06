
import { Panel, StockSheet } from "./types";

/**
 * Expands panels based on quantity and sorts them by area
 */
export const expandAndSortPanels = (panels: Panel[]): Panel[] => {
  // Expand panels based on quantity
  const expandedPanels: Panel[] = [];
  panels.forEach(panel => {
    // Convert string values to numbers for processing
    const length = typeof panel.length === 'string' ? Number(panel.length) || 0 : panel.length;
    const width = typeof panel.width === 'string' ? Number(panel.width) || 0 : panel.width;
    const quantity = typeof panel.quantity === 'string' ? Number(panel.quantity) || 0 : panel.quantity;

    // Skip invalid panels
    if (length <= 0 || width <= 0 || quantity <= 0) return;

    for (let i = 0; i < quantity; i++) {
      expandedPanels.push({
        ...panel,
        length,
        width,
        quantity,
        id: `${panel.id}-${i}`,
      });
    }
  });

  // Sort panels by area (descending) for better packing
  expandedPanels.sort((a, b) => {
    const aLength = typeof a.length === 'string' ? Number(a.length) : a.length;
    const aWidth = typeof a.width === 'string' ? Number(a.width) : a.width;
    const bLength = typeof b.length === 'string' ? Number(b.length) : b.length;
    const bWidth = typeof b.width === 'string' ? Number(b.width) : b.width;

    return (bLength * bWidth) - (aLength * aWidth);
  });

  return expandedPanels;
};

/**
 * Expands stock sheets based on quantity and sorts them by area
 */
export const expandAndSortStockSheets = (stockSheets: StockSheet[]): StockSheet[] => {
  // Expand stock sheets based on quantity
  const expandedStockSheets: StockSheet[] = [];
  stockSheets.forEach(sheet => {
    // Convert string values to numbers for processing
    const length = typeof sheet.length === 'string' ? Number(sheet.length) || 0 : sheet.length;
    const width = typeof sheet.width === 'string' ? Number(sheet.width) || 0 : sheet.width;
    const quantity = typeof sheet.quantity === 'string' ? Number(sheet.quantity) || 0 : sheet.quantity;

    // Skip invalid sheets
    if (length <= 0 || width <= 0 || quantity <= 0) return;

    for (let i = 0; i < quantity; i++) {
      expandedStockSheets.push({
        ...sheet,
        length,
        width,
        quantity,
        id: `${sheet.id}-${i}`,
      });
    }
  });

  // Sort stock sheets by area (ascending) to use smaller sheets first if possible
  expandedStockSheets.sort((a, b) => {
    const aLength = typeof a.length === 'string' ? Number(a.length) : a.length;
    const aWidth = typeof a.width === 'string' ? Number(a.width) : a.width;
    const bLength = typeof b.length === 'string' ? Number(b.length) : b.length;
    const bWidth = typeof b.width === 'string' ? Number(b.width) : b.width;

    return (aLength * aWidth) - (bLength * bWidth);
  });

  return expandedStockSheets;
};
