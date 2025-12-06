
import { Panel, StockSheet, CutOptions, CutPlan, CutPlacement } from "./types";
import { tryPlacePanel } from "./panelProcessor";

/**
 * Processes a stock sheet, attempting to place panels on it and calculating statistics
 */
export const processStockSheet = (
  stockSheet: StockSheet,
  expandedPanels: Panel[],
  placedPanels: string[],
  options: CutOptions
): {
  cutPlan: CutPlan | null;
  newPlacedPanels: string[];
} => {
  const usedSpaces: { x: number; y: number; width: number; height: number }[] = [];
  const placements: CutPlacement[] = [];
  let totalCuts = 0;
  let totalCutLength = 0;
  const newPlacedPanels: string[] = [...placedPanels];

  // Try to place panels on this stock sheet
  for (const panel of expandedPanels) {
    // Skip if already placed
    if (newPlacedPanels.includes(panel.id)) continue;

    const result = tryPlacePanel(panel, stockSheet, usedSpaces, options);

    if (result.placed && result.usedSpace && result.placement) {
      totalCuts += result.cuts;
      totalCutLength += result.cutLength;

      usedSpaces.push(result.usedSpace);
      placements.push(result.placement);
      newPlacedPanels.push(panel.id);
    }
  }

  // If we placed any panels on this sheet, return a cut plan
  if (placements.length > 0) {
    // Calculate areas in square meters
    const totalArea = stockSheet.length * stockSheet.width;
    const usedArea = placements.reduce((sum, placement) =>
      sum + placement.length * placement.width, 0);
    const wastedArea = totalArea - usedArea;
    const wastedPercentage = (wastedArea / totalArea) * 100;

    return {
      cutPlan: {
        stockSheetId: stockSheet.id,
        stockSheetDimensions: {
          length: stockSheet.length,
          width: stockSheet.width
        },
        placements,
        usedArea,
        wastedArea,
        wastedPercentage,
        totalCuts,
        totalCutLength
      },
      newPlacedPanels
    };
  }

  // No panels were placed
  return {
    cutPlan: null,
    newPlacedPanels
  };
};
