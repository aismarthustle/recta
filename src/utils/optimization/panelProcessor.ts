
import { Panel, StockSheet, CutOptions, CutPlacement } from "./types";
import { findBestPosition } from "./fitHelpers";

/**
 * Attempts to place a panel on a stock sheet with optional rotation
 */
export const tryPlacePanel = (
  panel: Panel,
  stockSheet: StockSheet,
  usedSpaces: { x: number; y: number; width: number; height: number }[],
  options: CutOptions
): {
  placed: boolean;
  x: number;
  y: number;
  rotated: boolean;
  cuts: number;
  cutLength: number;
  usedSpace?: { x: number; y: number; width: number; height: number };
  placement?: CutPlacement;
} => {
  // Adjust dimensions based on edge banding if enabled
  let adjustedLength = typeof panel.length === 'string' ? Number(panel.length) : panel.length;
  let adjustedWidth = typeof panel.width === 'string' ? Number(panel.width) : panel.width;

  if (options.edgeBanding) {
    // Convert edge banding thickness from mm to meters
    const edgeBandingInMeters = options.edgeBandingThickness / 1000;
    adjustedLength += 2 * edgeBandingInMeters;
    adjustedWidth += 2 * edgeBandingInMeters;
  }

  // Ensure stock sheet dimensions are numbers
  const stockSheetDims = {
    length: typeof stockSheet.length === 'string' ? Number(stockSheet.length) : stockSheet.length,
    width: typeof stockSheet.width === 'string' ? Number(stockSheet.width) : stockSheet.width
  };

  // Try without rotation first
  const normalPlacement = findBestPosition(
    adjustedLength,
    adjustedWidth,
    stockSheetDims,
    usedSpaces,
    options.kerfThickness
  );

  if (normalPlacement.success) {
    const horizontalCuts = 2;
    const verticalCuts = 2;
    const totalCuts = horizontalCuts + verticalCuts;

    // Calculate cut length in meters
    const cutLength = 2 * adjustedLength + 2 * adjustedWidth;

    const usedSpace = {
      x: normalPlacement.x,
      y: normalPlacement.y,
      width: adjustedLength,
      height: adjustedWidth
    };

    const placement: CutPlacement = {
      panelId: panel.id,
      x: normalPlacement.x,
      y: normalPlacement.y,
      width: Number(panel.width),
      length: Number(panel.length),
      rotation: false,
      label: panel.label,
      color: panel.color || '#ccc'
    };

    return {
      placed: true,
      x: normalPlacement.x,
      y: normalPlacement.y,
      rotated: false,
      cuts: totalCuts,
      cutLength,
      usedSpace,
      placement
    };
  }

  // If allowed, try with rotation
  else if (options.allowRotation && !options.considerGrainDirection) {
    const rotatedPlacement = findBestPosition(
      adjustedWidth,
      adjustedLength,
      stockSheetDims,
      usedSpaces,
      options.kerfThickness
    );

    if (rotatedPlacement.success) {
      const horizontalCuts = 2;
      const verticalCuts = 2;
      const totalCuts = horizontalCuts + verticalCuts;

      // Calculate cut length in meters
      const cutLength = 2 * adjustedWidth + 2 * adjustedLength;

      const usedSpace = {
        x: rotatedPlacement.x,
        y: rotatedPlacement.y,
        width: adjustedWidth,
        height: adjustedLength
      };

      const placement: CutPlacement = {
        panelId: panel.id,
        x: rotatedPlacement.x,
        y: rotatedPlacement.y,
        width: Number(panel.width),
        length: Number(panel.length),
        rotation: true,
        label: panel.label,
        color: panel.color || '#ccc'
      };

      return {
        placed: true,
        x: rotatedPlacement.x,
        y: rotatedPlacement.y,
        rotated: true,
        cuts: totalCuts,
        cutLength,
        usedSpace,
        placement
      };
    }
  }

  // If we get here, we couldn't place the panel
  return {
    placed: false,
    x: 0,
    y: 0,
    rotated: false,
    cuts: 0,
    cutLength: 0
  };
};
