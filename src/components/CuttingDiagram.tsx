import { useState, useEffect } from "react";
import { useOptimization } from "@/contexts/OptimizationContext";
import { type CutPlan } from "@/types";
import DiagramControls from "@/components/diagram/DiagramControls";
import CutDiagramSvg from "@/components/diagram/CutDiagramSvg";
import PlanDetails from "@/components/diagram/PlanDetails";
import EmptyDiagram from "@/components/diagram/EmptyDiagram";
import CuttingDiagram3D from "@/components/diagram/CuttingDiagram3D";
import { resetPanelColorMap } from "@/utils/gradientUtils";
import { Button } from "@/components/ui/button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FileDown } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CuttingDiagramProps {
  onExport: (format: string) => void;
  onExportPdf: () => void;
}

interface GroupedCutPlan {
  cutPlan: CutPlan;
  count: number;
}

// Function to create a unique key for a cut plan based on its properties
const createCutPlanKey = (cutPlan: CutPlan): string => {
  // Create a key based on stock sheet dimensions
  const dimensionsKey = `${cutPlan.stockSheetDimensions.length}-${cutPlan.stockSheetDimensions.width}`;

  // For grouping identical sheets, we need to focus on the pattern of cuts, not the specific panels
  // We'll create a simplified representation of the placements that ignores panel IDs and focuses on the pattern

  // First, normalize the placements by sorting them
  const sortedPlacements = [...cutPlan.placements].sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    if (a.y !== b.y) return a.y - b.y;
    return 0;
  });

  // Create a string representation that focuses on the pattern of cuts
  // We'll use the dimensions and positions, but not the panel IDs
  const placementsKey = sortedPlacements.map(p =>
    `${p.x.toFixed(4)}-${p.y.toFixed(4)}-${p.width.toFixed(4)}-${p.length.toFixed(4)}-${p.rotation}`
  ).join('|');

  // The key combines the sheet dimensions and the pattern of cuts
  return `${dimensionsKey}:${placementsKey}`;
};

// Function to group identical cut plans
const groupIdenticalCutPlans = (cutPlans: CutPlan[]): GroupedCutPlan[] => {
  const planGroups = new Map<string, GroupedCutPlan>();

  // First, group by stock sheet dimensions
  const dimensionGroups = new Map<string, CutPlan[]>();

  cutPlans.forEach(cutPlan => {
    const dimKey = `${cutPlan.stockSheetDimensions.length}-${cutPlan.stockSheetDimensions.width}`;
    if (!dimensionGroups.has(dimKey)) {
      dimensionGroups.set(dimKey, []);
    }
    dimensionGroups.get(dimKey)!.push(cutPlan);
  });

  // Then, for each dimension group, find identical cut patterns
  dimensionGroups.forEach((plans) => {
    plans.forEach(cutPlan => {
      const key = createCutPlanKey(cutPlan);

      if (planGroups.has(key)) {
        // Increment count for existing group
        const group = planGroups.get(key)!;
        group.count += 1;
      } else {
        // Create new group
        planGroups.set(key, {
          cutPlan,
          count: 1
        });
      }
    });
  });

  // Convert to array and sort by dimensions for consistent display
  return Array.from(planGroups.values()).sort((a, b) => {
    const aLength = a.cutPlan.stockSheetDimensions.length;
    const bLength = b.cutPlan.stockSheetDimensions.length;
    const aWidth = a.cutPlan.stockSheetDimensions.width;
    const bWidth = b.cutPlan.stockSheetDimensions.width;

    if (aLength !== bLength) return bLength - aLength; // Sort by length descending
    return bWidth - aWidth; // Then by width descending
  });
};

const CuttingDiagram = ({ onExport, onExportPdf }: CuttingDiagramProps) => {
  const { result, projectName } = useOptimization();
  const [scale, setScale] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Reset panel color map when the component mounts or when the result changes
  useEffect(() => {
    resetPanelColorMap();
  }, [result]);

  if (!result || !result.cutPlans || result.cutPlans.length === 0) {
    return <EmptyDiagram />;
  }

  // Group identical cut plans
  const groupedCutPlans = groupIdenticalCutPlans(result.cutPlans);

  const zoomIn = () => {
    if (scale < 2) setScale(scale + 0.1);
  };

  const zoomOut = () => {
    if (scale > 0.5) setScale(scale - 0.1);
  };

  const handleExportPdf = async () => {
    // Capture le premier schéma complet (visuel)
    const diagramElement = document.querySelector('.exportable-diagram');
    if (!diagramElement) {
      alert("Aucun schéma trouvé à exporter !");
      return;
    }
    await new Promise(res => setTimeout(res, 100));
    const canvas = await html2canvas(diagramElement as HTMLElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('schema.pdf');
  };

  const handleExportAllPdf = async () => {
    setExporting(true);
    setProgress(0);

    try {
      // Initialiser la progression à 5% pour indiquer que le processus a commencé
      setProgress(5);

      const diagramElements = document.querySelectorAll('.diagram-container-wrapper');
      if (!diagramElements.length) {
        alert("Aucun schéma trouvé à exporter !");
        setExporting(false);
        return;
      }

      // Créer un PDF en format A4 Portrait
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const a4Width = pdf.internal.pageSize.getWidth();
      const a4Height = pdf.internal.pageSize.getHeight();
      const margin = 10;

      // Ajouter le nom du projet et la date en haut du PDF
      const currentDate = new Date().toLocaleDateString('fr-FR');

      // Configurer les styles de texte pour l'en-tête
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Plan de découpe', a4Width / 2, margin, { align: 'center' });

      pdf.setFontSize(12);
      if (projectName && projectName.trim() !== '') {
        pdf.text(`Projet: ${projectName}`, margin, margin + 10);
      }
      pdf.text(`Date: ${currentDate}`, margin, margin + 15);

      // Ajouter les statistiques globales
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Statistiques globales:', margin, margin + 25);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      if (result) {
        const stats = [
          `Nombre total de plaques: ${result.usedStockSheets}`,
          `Surface totale utilisée: ${result.totalUsedArea.toFixed(2)} m²`,
          `Surface totale perdue: ${result.totalWastedArea.toFixed(2)} m² (${result.wastedPercentage.toFixed(1)}%)`,
          `Nombre total de découpes: ${result.cutPlans.reduce((sum, plan) => sum + plan.placements.length, 0)}`,
          `Nombre total de coupes: ${result.totalCuts}`
        ];

        // Ajouter des informations sur les panneaux non placés si nécessaire
        if (result.unplacedPanelsCount > 0) {
          stats.push(`Panneaux non placés: ${result.unplacedPanelsCount}`);
        }

        // Ajouter des informations sur les plaques supplémentaires nécessaires
        if (result.additionalSheetsNeeded > 0) {
          stats.push(`Plaques supplémentaires nécessaires: ${result.additionalSheetsNeeded}`);
        }

        // Afficher les statistiques
        stats.forEach((stat, idx) => {
          pdf.text(stat, margin, margin + 30 + (idx * 5));
        });
      }

      // Ajouter une ligne de séparation
      pdf.setLineWidth(0.3);
      pdf.line(margin, margin + 55, a4Width - margin, margin + 55);

      // Préparer tous les éléments
      const elements = Array.from(diagramElements).map(element => {
        const htmlElement = element as HTMLElement;
        const originalStyles = {
          position: htmlElement.style.position,
          overflow: htmlElement.style.overflow,
          transform: htmlElement.style.transform
        };
        htmlElement.style.position = 'relative';
        htmlElement.style.overflow = 'hidden';
        htmlElement.style.transform = 'none';
        return { element: htmlElement, originalStyles };
      });

      // Attendre le rendu initial
      await new Promise(res => setTimeout(res, 50));

      // Traiter les éléments par lots de 2 pour de meilleures performances
      const BATCH_SIZE = 2;
      const canvases = [];

      // Ajuster la distribution de la progression: 80% pour la capture des éléments (phase la plus longue)
      const CAPTURE_PROGRESS_WEIGHT = 80;

      for (let i = 0; i < elements.length; i += BATCH_SIZE) {
        const batch = elements.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async ({ element }) => {
          const canvas = await html2canvas(element, {
            scale: 0.9, // Augmenté légèrement pour une meilleure qualité
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff',
            imageTimeout: 0,
            removeContainer: true,
            onclone: (clonedDoc) => {
              const clonedElement = clonedDoc.querySelector('.diagram-container-wrapper');
              if (clonedElement) {
                (clonedElement as HTMLElement).style.transform = 'none';
              }
            }
          });
          return canvas;
        });

        const batchResults = await Promise.all(batchPromises);
        canvases.push(...batchResults);

        // Mise à jour de la progression pour la capture (80% du total)
        setProgress((i + batch.length) / elements.length * CAPTURE_PROGRESS_WEIGHT);
      }

      // Restaurer les styles originaux
      elements.forEach(({ element, originalStyles }) => {
        element.style.position = originalStyles.position;
        element.style.overflow = originalStyles.overflow;
        element.style.transform = originalStyles.transform;
      });

      // Ajouter les images au PDF
      for (let i = 0; i < canvases.length; i++) {
        if (i > 0) {
          pdf.addPage();

          // Ajouter un en-tête simplifié sur chaque page suivante
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.text('Plan de découpe', a4Width / 2, margin, { align: 'center' });
          if (projectName && projectName.trim() !== '') {
            pdf.text(`Projet: ${projectName}`, margin, margin + 7);
          }
          pdf.setLineWidth(0.3);
          pdf.line(margin, margin + 10, a4Width - margin, margin + 10);
        }

        const canvas = canvases[i];
        // Augmenter la qualité de l'image JPEG à 0.7
        const imgData = canvas.toDataURL('image/jpeg', 0.7);
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Ajuster la position Y pour laisser de la place à l'en-tête
        const yOffset = i === 0 ? 60 : 15; // Plus d'espace sur la première page pour les statistiques

        const ratio = Math.max(imgWidth / (a4Width - 2 * margin), imgHeight / (a4Height - 2 * margin - yOffset));
        const imgDisplayWidth = imgWidth / ratio;
        const imgDisplayHeight = imgHeight / ratio;

        const x = (a4Width - imgDisplayWidth) / 2;
        const y = margin + yOffset;

        pdf.addImage(imgData, 'JPEG', x, y, imgDisplayWidth, imgDisplayHeight);

        // Ajouter le numéro de page en bas de chaque page
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const pageText = `Page ${i + 1}/${canvases.length}`;
        pdf.text(pageText, a4Width / 2, a4Height - 5, { align: 'center' });

        // Mise à jour de la progression pour la génération du PDF (20% restants)
        setProgress(CAPTURE_PROGRESS_WEIGHT + ((i + 1) / canvases.length) * (100 - CAPTURE_PROGRESS_WEIGHT));
      }

      // Indiquer que le PDF est prêt à 100%
      setProgress(100);

      // Petit délai pour que l'utilisateur voie la barre à 100% avant de télécharger
      await new Promise(res => setTimeout(res, 300));

      pdf.save('schemas.pdf');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF');
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white shadow-md rounded-md">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <DiagramControls
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onExport={onExport}
          onExportPdf={handleExportAllPdf}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        {exporting && (
          <div className="px-4 py-2">
            <div className="flex items-center justify-center mb-2">
              <Loader2 className="animate-spin mr-2" />
              <span>Génération du PDF en cours...</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <div className="text-center text-sm text-gray-500 mt-1">
              {Math.round(progress)}%
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {groupedCutPlans.map((group, index) => (
            <div key={index} className="border-b pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0 diagram-container-wrapper">
              <h3 className="text-sm font-semibold mb-2 flex justify-between items-center">
                <span>
                  Plaque {index + 1}: {group.cutPlan.stockSheetDimensions.width.toFixed(2)} m × {group.cutPlan.stockSheetDimensions.length.toFixed(2)} m
                </span>
                <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-bold">
                  x{group.count}
                </span>
              </h3>

              <div className="diagram-svg-container exportable-diagram">
                {viewMode === '2d' ? (
                  <CutDiagramSvg
                    currentPlan={group.cutPlan}
                    scale={scale}
                    sheetCount={group.count}
                  />
                ) : (
                  <CuttingDiagram3D
                    currentPlan={group.cutPlan}
                    sheetCount={group.count}
                  />
                )}
                <PlanDetails currentPlan={group.cutPlan} sheetCount={group.count} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CuttingDiagram;
