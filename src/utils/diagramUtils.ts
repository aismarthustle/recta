
// Convert mm to m (keep for backward compatibility)
export const mmToM = (mm: number) => mm / 1000;

// Convert m to mm (for internal calculations that still use mm)
export const mToMm = (m: number) => m * 1000;

// Set to track which gradients have already been defined
// This is used to avoid defining the same gradient multiple times
export const definedGradients = new Set<string>();

/**
 * Resets the set of defined gradients
 * This should be called when a new diagram is rendered
 */
export const resetDefinedGradients = () => {
  definedGradients.clear();
};

// Calculate SVG dimensions and scale factors
export const calculateSvgDimensions = (
  stockSheetWidth: number,
  stockSheetLength: number
) => {
  // Calculate aspect ratio based on the actual dimensions
  const aspectRatio = stockSheetWidth / stockSheetLength;

  // Set a fixed width for the viewBox
  const viewBoxWidth = 1000;

  // Calculate height based on the aspect ratio
  const viewBoxHeight = viewBoxWidth * aspectRatio;

  // Calculate scaling factors to map real dimensions to SVG coordinates
  const scaleX = viewBoxWidth / stockSheetLength;
  const scaleY = viewBoxHeight / stockSheetWidth;

  return {
    viewBoxWidth,
    viewBoxHeight,
    scaleX,
    scaleY,
    aspectRatio
  };
};
