
export interface Panel {
  id: string;
  length: number | string; // Now in meters, string during editing
  width: number | string; // Now in meters, string during editing
  quantity: number | string; // Number, string during editing
  label: string;
  color?: string;
}

export interface StockSheet {
  id: string;
  length: number | string; // Now in meters, string during editing
  width: number | string; // Now in meters, string during editing
  quantity: number | string; // Number, string during editing
  label: string;
}

export interface CutOptions {
  kerfThickness: number; // Still in millimeters
  allowRotation: boolean;
  prioritizeMinimalWaste: boolean;
  prioritizeMinimalCuts: boolean;
  considerGrainDirection: boolean;
  edgeBanding: boolean;
  edgeBandingThickness: number; // Still in millimeters
  useOnlyOneSheetType: boolean;
}

export interface CutPlan {
  stockSheetId: string;
  stockSheetDimensions: { length: number; width: number }; // In meters
  placements: CutPlacement[];
  usedArea: number; // In square meters
  wastedArea: number; // In square meters
  wastedPercentage: number;
  totalCuts: number;
  totalCutLength: number; // In meters
}

export interface CutPlacement {
  panelId: string;
  x: number;
  y: number;
  width: number;
  length: number;
  rotation: boolean;
  label: string;
  color: string;
}

export interface UnplacedPanelInfo {
  id: string;
  label: string;
  length: number;
  width: number;
  count: number;
}

export interface AdditionalSheetInfo {
  type: string; // Stock sheet type identifier
  label: string;
  length: number;
  width: number;
  count: number; // Number of additional sheets needed
}

export interface OptimizationResult {
  cutPlans: CutPlan[];
  totalUsedArea: number; // In square meters
  totalWastedArea: number; // In square meters
  wastedPercentage: number;
  totalCuts: number;
  totalCutLength: number; // In meters
  usedStockSheets: number;
  unplacedPanelsCount: number; // Number of panels that couldn't be placed
  unplacedPanelsByType: UnplacedPanelInfo[]; // Information about unplaced panels grouped by type
  additionalSheetsNeeded: number; // Estimated number of additional sheets needed
  additionalSheetsByType: AdditionalSheetInfo[]; // Information about additional sheets needed by type
}

export interface ProjectData {
  id?: number;  // Added for database storage
  panels: Panel[];
  stockSheets: StockSheet[];
  options: CutOptions;
  result?: OptimizationResult;
  name: string;
  createdAt: string;
  updatedAt: string;
}
