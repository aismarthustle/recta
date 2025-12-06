
import { CutOptions } from "@/types";

/**
 * Helper function to calculate if a panel can fit at a given position
 * All dimensions (length, width) are in meters, kerfThickness is in mm
 */
export const canFit = (
  panel: { length: number; width: number },
  position: { x: number; y: number },
  stockSheet: { length: number; width: number },
  usedSpaces: { x: number; y: number; width: number; height: number }[],
  kerfThickness: number // in mm, needs to be converted to meters for calculations
): boolean => {
  // Check if panel exceeds stock sheet dimensions
  if (
    position.x + panel.length > stockSheet.length ||
    position.y + panel.width > stockSheet.width
  ) {
    return false;
  }

  // Check for intersection with any used space (including kerf)
  // Convert kerfThickness from mm to meters for calculations
  const kerfInMeters = kerfThickness / 1000;

  return !usedSpaces.some(space => {
    return !(
      position.x + panel.length + kerfInMeters <= space.x ||
      position.x >= space.x + space.width + kerfInMeters ||
      position.y + panel.width + kerfInMeters <= space.y ||
      position.y >= space.y + space.height + kerfInMeters
    );
  });
};

/**
 * Finds the best position to place a panel using a bottom-left strategy
 */
export const findBestPosition = (
  panelLength: number,
  panelWidth: number,
  stockSheet: { length: number; width: number },
  usedSpaces: { x: number; y: number; width: number; height: number }[],
  kerfThickness: number
): { success: boolean; x: number; y: number } => {
  // Start with top-left corners of existing placements as potential positions
  const possiblePositions = [{ x: 0, y: 0 }];
  usedSpaces.forEach(space => {
    // Convert kerf thickness from mm to meters
    const kerfInMeters = kerfThickness / 1000;
    possiblePositions.push({ x: space.x + space.width + kerfInMeters, y: space.y });
    possiblePositions.push({ x: space.x, y: space.y + space.height + kerfInMeters });
  });

  // Sort by Y first, then X
  possiblePositions.sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  for (const pos of possiblePositions) {
    if (canFit({ length: panelLength, width: panelWidth }, pos, stockSheet, usedSpaces, kerfThickness)) {
      return { success: true, x: pos.x, y: pos.y };
    }
  }

  return { success: false, x: 0, y: 0 };
};
