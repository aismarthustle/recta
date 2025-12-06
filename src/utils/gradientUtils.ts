/**
 * Utility functions for generating gradient colors for the cutting diagram
 */

// Base colors from the application's color palette - using more saturated colors for better visibility at all zoom levels
const baseColors = {
  // Original colors
  blue: ['#d0e1ff', '#a0c4ff', '#70a5ff', '#4086ff', '#1066ff'],
  indigo: ['#e2d0ff', '#c9a0ff', '#b070ff', '#9740ff', '#7e10ff'],
  purple: ['#ead0ff', '#d5a0ff', '#c070ff', '#ab40ff', '#9610ff'],
  pink: ['#ffd0e6', '#ffa0ce', '#ff70b5', '#ff409d', '#ff1084'],
  red: ['#ffd0d0', '#ffa0a0', '#ff7070', '#ff4040', '#ff1010'],
  orange: ['#ffe0d0', '#ffc0a0', '#ffa070', '#ff8040', '#ff6010'],
  yellow: ['#fff5d0', '#ffeba0', '#ffe170', '#ffd740', '#ffcd10'],
  green: ['#d0ffd0', '#a0ffa0', '#70ff70', '#40ff40', '#10ff10'],
  teal: ['#d0fff0', '#a0ffe0', '#70ffd0', '#40ffc0', '#10ffb0'],
  cyan: ['#d0f5ff', '#a0ebff', '#70e0ff', '#40d6ff', '#10ccff'],

  // Additional colors
  navy: ['#d0d4ff', '#a0a8ff', '#7080ff', '#4050ff', '#1020ff'],
  lavender: ['#e8d0ff', '#d5a0ff', '#c270ff', '#af40ff', '#9c10ff'],
  magenta: ['#ffd0ff', '#ffa0ff', '#ff70ff', '#ff40ff', '#ff10ff'],
  crimson: ['#ffd0d0', '#ffa0a0', '#ff5050', '#ff2020', '#ff0000'],
  coral: ['#ffd5d0', '#ffb0a0', '#ff8070', '#ff5040', '#ff2010'],
  amber: ['#fff0d0', '#ffe0a0', '#ffd070', '#ffc040', '#ffb010'],
  lime: ['#e0ffd0', '#c0ffa0', '#a0ff70', '#80ff40', '#60ff10'],
  emerald: ['#d0ffe0', '#a0ffc0', '#70ffa0', '#40ff80', '#10ff60'],
  turquoise: ['#d0ffff', '#a0ffff', '#70ffff', '#40ffff', '#10ffff'],
  skyblue: ['#d0f0ff', '#a0e0ff', '#70d0ff', '#40c0ff', '#10b0ff'],
  slate: ['#d0d8e0', '#a0b0c0', '#7090a0', '#407080', '#105060'],
  brown: ['#e0d0c0', '#c0a080', '#a07040', '#805020', '#603000'],
  olive: ['#e0e0c0', '#c0c080', '#a0a040', '#808000', '#606000'],
  gold: ['#fff8d0', '#fff0a0', '#ffe870', '#ffe040', '#ffd810'],
  silver: ['#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080', '#606060'],
};

// Color families for different panel types
const colorFamilies = [
  // Original colors
  baseColors.blue,
  baseColors.indigo,
  baseColors.purple,
  baseColors.pink,
  baseColors.red,
  baseColors.orange,
  baseColors.yellow,
  baseColors.green,
  baseColors.teal,
  baseColors.cyan,

  // Additional colors
  baseColors.navy,
  baseColors.lavender,
  baseColors.magenta,
  baseColors.crimson,
  baseColors.coral,
  baseColors.amber,
  baseColors.lime,
  baseColors.emerald,
  baseColors.turquoise,
  baseColors.skyblue,
  baseColors.slate,
  baseColors.brown,
  baseColors.olive,
  baseColors.gold,
  baseColors.silver,
];

// Map to store panel ID to color family mapping
const panelColorMap = new Map<string, string[]>();

// Set to track which color families have been used
// This helps ensure each panel group gets a unique color
// Instead of Set<string[]>, use an array of color families (arrays of strings)
const usedColorFamilies: string[][] = [];

// Minimum color distance (in HSL space) between two color families to consider them unique
const MIN_COLOR_DISTANCE = 0.18; // 0.0-1.0, tweak as needed for more/less strictness

/**
 * Converts a hex color string to HSL
 * @param hex The hex color string (e.g., "#ff0000")
 * @returns [h, s, l] where h is 0-360, s and l are 0-1
 */
const hexToHsl = (hex: string): [number, number, number] => {
  // Remove # if present
  hex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s, l];
};

/**
 * Computes the Euclidean distance between two HSL colors (ignoring hue wraparound for simplicity)
 * @param hsl1 [h, s, l]
 * @param hsl2 [h, s, l]
 * @returns Distance (0-1)
 */
const hslDistance = (hsl1: [number, number, number], hsl2: [number, number, number]): number => {
  // Normalize hue to 0-1
  const dh = Math.abs(hsl1[0] - hsl2[0]) / 360;
  const ds = hsl1[1] - hsl2[1];
  const dl = hsl1[2] - hsl2[2];
  return Math.sqrt(dh * dh + ds * ds + dl * dl);
};

/**
 * Checks if a color family is already used by another panel (by value, not reference)
 * @param colorFamily The color family to check
 * @returns True if the color family is already used, false otherwise
 */
const isColorFamilyUsed = (colorFamily: string[]): boolean => {
  for (const usedFamily of usedColorFamilies) {
    // Compare all colors in the family
    let allClose = true;
    for (let i = 0; i < colorFamily.length; i++) {
      const hsl1 = hexToHsl(colorFamily[i]);
      const hsl2 = hexToHsl(usedFamily[i]);
      if (hslDistance(hsl1, hsl2) > MIN_COLOR_DISTANCE) {
        allClose = false;
        break;
      }
    }
    if (allClose) return true;
  }
  return false;
};

/**
 * Assigns an unused color family to a panel
 * @param basePanelId The base panel ID
 */
const assignUnusedColorFamily = (basePanelId: string): void => {
  // Find an unused color family from the palette
  const availableColorFamilies = colorFamilies.filter(family => !isColorFamilyUsed(family));

  if (availableColorFamilies.length > 0) {
    // If there are unused families, use the panel ID hash to select one deterministically
    const hash = getHashCode(basePanelId);
    const index = hash % availableColorFamilies.length;
    const selectedFamily = availableColorFamilies[index];
    panelColorMap.set(basePanelId, selectedFamily);
    usedColorFamilies.push(selectedFamily);
  } else {
    // If all color families are used, generate a new, unique color family
    let attempts = 0;
    let newFamily: string[];
    let hue = Math.random() * 360; // Start with a random hue
    const goldenRatioConjugate = 0.618033988749895;
    do {
      // Use golden angle to spread hues
      hue = (hue + goldenRatioConjugate * 360) % 360;
      newFamily = generateColorFamily(hue);
      attempts++;
      // Avoid infinite loop: after 100 attempts, relax the threshold
      if (attempts > 100) break;
    } while (isColorFamilyUsed(newFamily));
    panelColorMap.set(basePanelId, newFamily);
    usedColorFamilies.push(newFamily);
  }
};

/**
 * Resets the panel color map and used color families
 * This should be called when a new optimization is run to ensure unique colors for each panel group
 */
export const resetPanelColorMap = () => {
  panelColorMap.clear();
  usedColorFamilies.length = 0;
};

/**
 * Extract the base panel ID from a full panel ID
 * When panels are expanded based on quantity, each instance gets a unique ID like "panel-123-0", "panel-123-1"
 * This function extracts the base ID "panel-123" to ensure all instances of the same panel get the same color
 * @param fullPanelId The full panel ID (e.g., "panel-123-0")
 * @returns The base panel ID (e.g., "panel-123")
 */
const extractBasePanelId = (fullPanelId: string): string => {
  // Match the pattern: anything up to the last dash followed by a number
  const match = fullPanelId.match(/^(.*?)(?:-\d+)?$/);
  return match ? match[1] : fullPanelId;
};

/**
 * Gets a gradient color pair for a panel based on its ID
 * @param panelId The ID of the panel
 * @returns An object with start and end colors for the gradient
 */
export const getPanelGradient = (panelId: string, baseColor?: string) => {
  // Extract the base panel ID to ensure all instances of the same panel get the same color
  const basePanelId = extractBasePanelId(panelId);

  // If we already have a color family assigned to this base panel ID, use it
  if (!panelColorMap.has(basePanelId)) {
    // If a base color is provided, find the closest color family
    if (baseColor) {
      // Simple matching - find a color family that contains the base color or is close to it
      const matchingFamily = Object.values(baseColors).find(family =>
        family.some(color => color.toLowerCase() === baseColor.toLowerCase())
      );

      if (matchingFamily && !isColorFamilyUsed(matchingFamily)) {
        panelColorMap.set(basePanelId, matchingFamily);
        usedColorFamilies.push(matchingFamily);
      } else {
        // If no match or the matching family is already used, assign an unused color family
        assignUnusedColorFamily(basePanelId);
      }
    } else {
      // Assign an unused color family
      assignUnusedColorFamily(basePanelId);
    }
  }

  const colorFamily = panelColorMap.get(basePanelId)!;

  return {
    startColor: colorFamily[1], // Light-medium color (more saturated than the lightest)
    endColor: colorFamily[3],   // Dark-medium color (more saturated than the medium)
  };
};

/**
 * Gets a simple hash code from a string
 * @param str The string to hash
 * @returns A number hash code
 */
const getHashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Generates a new color family based on a specific hue
 * @param hue The base hue for the color family (0-360)
 * @returns An array of 5 colors forming a gradient from light to dark
 */
const generateColorFamily = (hue: number): string[] => {
  const family: string[] = [];

  // Create 5 colors with the same hue but different lightness and saturation
  // Lightness goes from light to dark (0.9 to 0.3)
  // Saturation increases for darker colors (0.7 to 0.9)

  family.push(hslToHex(hue, 0.7, 0.9)); // Very light
  family.push(hslToHex(hue, 0.75, 0.75)); // Light-medium
  family.push(hslToHex(hue, 0.8, 0.6)); // Medium
  family.push(hslToHex(hue, 0.85, 0.45)); // Dark-medium
  family.push(hslToHex(hue, 0.9, 0.3)); // Dark

  return family;
};

/**
 * Converts HSL color values to a hex color string
 * @param h Hue (0-360)
 * @param s Saturation (0-1)
 * @param l Lightness (0-1)
 * @returns A hex color string (e.g., "#ff0000")
 */
const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number): string => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Generates a unique gradient ID for a panel
 * @param panelId The ID of the panel
 * @returns A unique gradient ID string
 */
export const getGradientId = (panelId: string) => {
  // Extract the base panel ID to ensure all instances of the same panel use the same gradient
  const basePanelId = extractBasePanelId(panelId);
  return `panel-gradient-${basePanelId.replace(/[^a-zA-Z0-9]/g, '-')}`;
};
