
import { Panel, StockSheet, CutOptions, OptimizationResult, CutPlan } from "./types";
import { expandAndSortPanels, expandAndSortStockSheets } from "./materialPreprocessor";
import { processStockSheet } from "./stockSheetProcessor";

/**
 * Main optimization function using a simple bin packing algorithm
 */
export const optimizeCutting = (
  panels: Panel[],
  stockSheets: StockSheet[],
  options: CutOptions
): OptimizationResult => {
  const expandedPanels = expandAndSortPanels(panels);
  const expandedStockSheets = expandAndSortStockSheets(stockSheets);

  const cutPlans: CutPlan[] = [];
  let placedPanels: string[] = [];

  // Process each stock sheet
  for (const stockSheet of expandedStockSheets) {
    // Skip if we've placed all panels
    if (placedPanels.length === expandedPanels.length) break;

    const { cutPlan, newPlacedPanels } = processStockSheet(
      stockSheet,
      expandedPanels,
      placedPanels,
      options
    );

    if (cutPlan) {
      cutPlans.push(cutPlan);
      placedPanels = newPlacedPanels;
    }
  }

  // Calculate overall statistics
  const totalUsedArea = cutPlans.reduce((sum, plan) => sum + plan.usedArea, 0);
  const totalWastedArea = cutPlans.reduce((sum, plan) => sum + plan.wastedArea, 0);
  const totalArea = totalUsedArea + totalWastedArea;
  const wastedPercentage = totalArea > 0 ? (totalWastedArea / totalArea) * 100 : 0;
  const totalCuts = cutPlans.reduce((sum, plan) => sum + plan.totalCuts, 0);
  const totalCutLength = cutPlans.reduce((sum, plan) => sum + plan.totalCutLength, 0);

  // Calculate the number of panels that couldn't be placed
  const unplacedPanelsCount = expandedPanels.length - placedPanels.length;

  // Calculate unplaced panels by type
  const unplacedPanelsByType: { [key: string]: { id: string, label: string, length: number, width: number, count: number } } = {};

  if (unplacedPanelsCount > 0) {
    // Get all unplaced panel IDs
    const unplacedPanelIds = expandedPanels
      .filter(panel => !placedPanels.includes(panel.id))
      .map(panel => panel.id);

    // Group unplaced panels by their original panel ID (before expansion)
    unplacedPanelIds.forEach(panelId => {
      // Extract the base panel ID (e.g., "panel-123" from "panel-123-0")
      const baseId = panelId.replace(/-\d+$/, '');

      // Find the original panel to get its properties
      const originalPanel = panels.find(p => p.id === baseId);

      if (originalPanel) {
        const length = typeof originalPanel.length === 'string' ? Number(originalPanel.length) : originalPanel.length;
        const width = typeof originalPanel.width === 'string' ? Number(originalPanel.width) : originalPanel.width;

        if (!unplacedPanelsByType[baseId]) {
          unplacedPanelsByType[baseId] = {
            id: baseId,
            label: originalPanel.label,
            length,
            width,
            count: 1
          };
        } else {
          unplacedPanelsByType[baseId].count++;
        }
      }
    });
  }

  // Estimate additional sheets needed
  let additionalSheetsNeeded = 0;
  const additionalSheetsByType: { [key: string]: { type: string, label: string, length: number, width: number, count: number } } = {};

  if (unplacedPanelsCount > 0) {
    // Get the most common sheet type used
    const sheetTypes: { [key: string]: { count: number, sheet: StockSheet } } = {};

    stockSheets.forEach(sheet => {
      const sheetTypeKey = `${sheet.length}-${sheet.width}`;
      if (!sheetTypes[sheetTypeKey]) {
        sheetTypes[sheetTypeKey] = {
          count: 1,
          sheet
        };
      } else {
        sheetTypes[sheetTypeKey].count++;
      }
    });

    // Find the most common sheet type
    let mostCommonSheetType = Object.values(sheetTypes)[0];
    for (const sheetType of Object.values(sheetTypes)) {
      if (sheetType.count > mostCommonSheetType.count) {
        mostCommonSheetType = sheetType;
      }
    }

    // Calculate total area of unplaced panels
    const totalUnplacedArea = Object.values(unplacedPanelsByType).reduce(
      (sum, panel) => sum + (panel.length * panel.width * panel.count),
      0
    );

    // Calculate area of the most common sheet type
    const sheetLength = typeof mostCommonSheetType.sheet.length === 'string'
      ? Number(mostCommonSheetType.sheet.length)
      : mostCommonSheetType.sheet.length;

    const sheetWidth = typeof mostCommonSheetType.sheet.width === 'string'
      ? Number(mostCommonSheetType.sheet.width)
      : mostCommonSheetType.sheet.width;

    const sheetArea = sheetLength * sheetWidth;

    // Estimate number of additional sheets needed based on area
    // Using a 70% efficiency factor as a conservative estimate
    const efficiencyFactor = 0.7;
    additionalSheetsNeeded = Math.ceil(totalUnplacedArea / (sheetArea * efficiencyFactor));

    // Add to additionalSheetsByType
    const sheetTypeKey = `${sheetLength}-${sheetWidth}`;
    additionalSheetsByType[sheetTypeKey] = {
      type: sheetTypeKey,
      label: mostCommonSheetType.sheet.label,
      length: sheetLength,
      width: sheetWidth,
      count: additionalSheetsNeeded
    };
  }

  return {
    cutPlans,
    totalUsedArea,
    totalWastedArea,
    wastedPercentage,
    totalCuts,
    totalCutLength,
    usedStockSheets: cutPlans.length,
    unplacedPanelsCount,
    unplacedPanelsByType: Object.values(unplacedPanelsByType),
    additionalSheetsNeeded,
    additionalSheetsByType: Object.values(additionalSheetsByType)
  };
};
