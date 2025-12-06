// Export functions for the application
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { OptimizationResult, CutPlan, ProjectData } from "@/types";
import storageService from '@/services/StorageService';

export const exportToCSV = async (projectId?: number) => {
  try {
    let panels = [];

    // If a project ID is provided, get the project data from the database
    if (projectId) {
      console.log('Getting project data from database for CSV export, ID:', projectId);
      const projectData = await storageService.getProjectById(projectId);

      if (projectData && projectData.panels && Array.isArray(projectData.panels)) {
        panels = projectData.panels;
        console.log('Successfully retrieved panels from database for CSV export');
      } else {
        console.error('No panel data found in project data from database');
        return;
      }
    } else {
      // Fallback to getting data from the hidden element for unsaved projects
      console.log('No project ID provided, getting panel data from DOM for CSV export');
      const contextElement = document.getElementById('optimization-context-data');
      if (!contextElement) {
        console.error('No optimization context data element found');
        return;
      }

      const contextDataStr = contextElement.getAttribute('data-context') || '{}';
      const contextData = JSON.parse(contextDataStr);

      if (!contextData.panels || !Array.isArray(contextData.panels)) {
        console.error('No panel data found in DOM');
        return;
      }

      panels = contextData.panels;
    }

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,Panel,Length,Width,Quantity\n";

    // Add each panel to the CSV
    panels.forEach((panel, index) => {
      const length = typeof panel.length === 'string' ? panel.length : panel.length.toString();
      const width = typeof panel.width === 'string' ? panel.width : panel.width.toString();
      const quantity = typeof panel.quantity === 'string' ? panel.quantity : panel.quantity.toString();

      csvContent += `${panel.label || 'Panel' + (index + 1)},${length},${width},${quantity}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cutting_plan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

export const exportToPNG = (svgElement: SVGSVGElement) => {
  if (!svgElement) return;

  // Find the container that holds both the SVG and its parent elements
  const container = svgElement.closest('.diagram-svg-container');

  if (container) {
    html2canvas(container as HTMLElement, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true,
      allowTaint: true,
    }).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'cutting_diagram.png');
        }
      }, 'image/png', 1.0);
    }).catch(error => {
      console.error('Error generating PNG:', error);
    });
  }
};

// Define a type for the context data
interface OptimizationContextData {
  result: OptimizationResult;
  panels?: any[]; // Using any to accommodate both Panel[] and the simplified version
  stockSheets?: any[];
  options?: any;
  [key: string]: unknown;
}

// Define a type for the processed cut plan
interface ProcessedCutPlan {
  stockSheetDimensions: { length: number; width: number };
  usedArea: number;
  wastedArea: number;
  wastedPercentage: number;
  placements: number;
  totalCuts: number;
  sheetCount: number;
}

// Helper to serialize an SVG element to a string
function serializeSvgToString(svgElement: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
}

export const exportToPDF = async (projectId?: number) => {
  // Get optimization data from the database if a project ID is provided
  // Otherwise, get it from the hidden element (for unsaved projects)
  let optimizationData: OptimizationContextData | null = null;

  try {
    if (projectId) {
      const projectData = await storageService.getProjectById(projectId);
      if (projectData && projectData.result && projectData.result.cutPlans) {
        optimizationData = {
          result: projectData.result,
          panels: projectData.panels,
          stockSheets: projectData.stockSheets,
          options: projectData.options
        };
      } else {
        console.error('No optimization result found in project data from database');
        return;
      }
    } else {
      const contextElement = document.getElementById('optimization-context-data');
      if (contextElement) {
        const contextDataStr = contextElement.getAttribute('data-context') || '{}';
        const contextData = JSON.parse(contextDataStr) as OptimizationContextData;
        if (contextData.result && contextData.result.cutPlans) {
          optimizationData = contextData;
        } else {
          console.error('No optimization result found in context data');
          return;
        }
      } else {
        console.error('No optimization context data element found');
        return;
      }
    }
  } catch (error) {
    console.error('Error getting optimization data:', error);
    return;
  }

  // Prepare statistics
  const result = optimizationData.result;
  const cutPlans = result.cutPlans;
  let totalUsedArea = result.totalUsedArea || 0;
  let totalWastedArea = result.totalWastedArea || 0;
  let globalWastedPercentage = result.wastedPercentage || 0;
  let totalSheets = result.usedStockSheets || 0;
  let additionalSheetsNeeded = result.additionalSheetsNeeded || 0;
  let unplacedPanelsCount = result.unplacedPanelsCount || 0;

  // Calculate total panels from the original panels data if available
  let totalPanelsFromInput = 0;
  if (optimizationData.panels && Array.isArray(optimizationData.panels)) {
    totalPanelsFromInput = optimizationData.panels.reduce((sum, panel) =>
      sum + (typeof panel.quantity === 'number' ? panel.quantity : parseInt(panel.quantity as string) || 0), 0);
  }

  // Calculate total placements (panels) by summing up all placements across all sheets
  let totalPlacements = cutPlans.reduce((sum: number, plan: any) =>
    sum + (plan.placements?.length || 0), 0);
  if (totalPanelsFromInput > 0) {
    totalPlacements = totalPanelsFromInput;
  }

  // Calculate total area of all sheets used
  let totalSheetsArea = cutPlans.reduce((sum: number, plan: any) =>
    sum + (plan.stockSheetDimensions.length * plan.stockSheetDimensions.width), 0);

  // Group identical cut plans (reuse the logic from CuttingDiagram)
  // We'll inline a simple grouping by dimensions and placements pattern
  function createCutPlanKey(plan: any): string {
    const dimKey = `${plan.stockSheetDimensions.length}-${plan.stockSheetDimensions.width}`;
    const placements = plan.placements || [];
    const sortedPlacements = [...placements].sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      if (a.y !== b.y) return a.y - b.y;
      return 0;
    });
    const placementsKey = sortedPlacements.map(p =>
      `${p.x.toFixed(4)}-${p.y.toFixed(4)}-${p.width.toFixed(4)}-${p.length.toFixed(4)}-${p.rotation}`
    ).join('|');
    return `${dimKey}:${placementsKey}`;
  }

  const planGroups = new Map<string, any>();
  cutPlans.forEach(plan => {
    const key = createCutPlanKey(plan);
    if (planGroups.has(key)) {
      planGroups.get(key).count += 1;
    } else {
      planGroups.set(key, {
        cutPlan: plan,
        count: 1
      });
    }
  });
  const groupedCutPlans = Array.from(planGroups.values());

  // Prepare groupedCutPlans for the template
  const groupedCutPlansForTemplate = groupedCutPlans.map((group, idx) => {
    const plan = group.cutPlan;
    const count = group.count;
    // Find the corresponding diagram SVG in the DOM
    let diagram = '';
    // Try to find the correct diagram by index (assumes order matches DOM)
    const diagramContainers = document.querySelectorAll('.diagram-container-wrapper');
    let svgString = '';
    if (diagramContainers[idx]) {
      const svg = diagramContainers[idx].querySelector('.diagram-svg-container svg');
      if (svg) {
        svgString = serializeSvgToString(svg as SVGSVGElement);
      }
    }
    diagram = svgString;
    // Compute stats for this plan
    const sheetArea = plan.stockSheetDimensions.length * plan.stockSheetDimensions.width;
    const totalSheetArea = sheetArea * count;
    const usedArea = plan.usedArea * count;
    const wastedArea = plan.wastedArea * count;
    const wastedPercentage = plan.wastedPercentage;
    const efficiency = (100 - wastedPercentage).toFixed(1);
    return {
      planNumber: idx + 1,
      totalPlans: groupedCutPlans.length,
      width: plan.stockSheetDimensions.width,
      length: plan.stockSheetDimensions.length,
      count,
      sheetArea: sheetArea.toFixed(2),
      totalSheetArea: totalSheetArea.toFixed(2),
      usedArea: usedArea.toFixed(2),
      efficiency,
      wastedArea: wastedArea.toFixed(2),
      wastedPercentage: wastedPercentage.toFixed(1),
      placements: Math.round((plan.placements?.length || 0) * count),
      totalCuts: Math.round((plan.totalCuts || 0) * count),
      diagram: diagram
    };
  });

  // Prepare the payload for the PHP API
  const payload = {
    date: new Date().toLocaleDateString('fr-FR'),
    totalSheets,
    efficiency: (100 - globalWastedPercentage).toFixed(1),
    waste: globalWastedPercentage.toFixed(1),
    totalSheetsArea: totalSheetsArea.toFixed(2),
    totalUsedArea: totalUsedArea.toFixed(2),
    totalWastedArea: totalWastedArea.toFixed(2),
    totalPlacements,
    additionalSheetsNeeded,
    additionalSheetsNeededClass: additionalSheetsNeeded > 0 ? '' : 'hidden-block',
    unplacedPanelsCount,
    unplacedPanelsCountClass: unplacedPanelsCount > 0 ? '' : 'hidden-block',
    groupedCutPlans: groupedCutPlansForTemplate
  };

  // Get the PHP API URL from the environment
  const apiUrl = import.meta.env.VITE_PDF_API_URL;
  if (!apiUrl) {
    console.error('PDF API URL is not set in the environment variables.');
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }
    const blob = await response.blob();
    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cutting_diagram.pdf';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};

export const saveProject = async (projectId?: number) => {
  try {
    let projectData;

    // If a project ID is provided, get the project data from the database
    if (projectId) {
      console.log('Getting project data from database for JSON export, ID:', projectId);
      projectData = await storageService.getProjectById(projectId);

      if (!projectData) {
        console.error('No project data found in database');
        return;
      }
      console.log('Successfully retrieved project data from database for JSON export');
    } else {
      // Fallback to getting data from the hidden element for unsaved projects
      console.log('No project ID provided, getting project data from DOM for JSON export');
      const contextElement = document.getElementById('optimization-context-data');
      if (!contextElement) {
        console.error('No optimization context data element found');
        return;
      }

      const contextDataStr = contextElement.getAttribute('data-context') || '{}';
      const contextData = JSON.parse(contextDataStr) as OptimizationContextData;

      // Create a project data object
      projectData = {
        panels: contextData.panels || [],
        stockSheets: contextData.stockSheets || [],
        options: contextData.options || {},
        result: contextData.result || null,
        name: 'Exported Project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Create JSON file for download
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    // Trigger download
    const exportName = 'cutting_project_' + new Date().toISOString().slice(0,10) + '.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  } catch (error) {
    console.error('Error exporting project:', error);
  }
};
