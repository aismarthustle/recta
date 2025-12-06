
import { OptimizationProvider, useOptimization } from "@/contexts/OptimizationContext";
import SidebarLayout from "@/components/SidebarLayout";
import { exportToCSV, exportToPNG, exportToPDF, saveProject } from "@/utils/exportUtils";
import { toast } from "@/components/ui/use-toast";

// Create a component that uses the OptimizationContext
const IndexContent = () => {
  const { currentProjectId } = useOptimization();

  const handleExport = async (format: string) => {
    try {
      switch (format) {
        case 'csv':
          await exportToCSV(currentProjectId || undefined);
          break;
        case 'png': {
          // Get the first SVG element for PNG export
          const svgElement = document.querySelector('.diagram-svg-container svg') as SVGSVGElement;
          if (svgElement) {
            exportToPNG(svgElement);
          } else {
            toast({
              title: "Export Error",
              description: "No diagram found to export as PNG.",
              variant: "destructive"
            });
          }
          break;
        }
        case 'pdf':
          // Show loading toast
          toast({
            title: "Generating PDF",
            description: "Please wait while we generate your PDF...",
          });

          // Export to PDF with the current project ID
          await exportToPDF(currentProjectId || undefined);

          // Show success toast
          toast({
            title: "PDF Generated",
            description: "Your PDF has been successfully generated and downloaded.",
            variant: "default"
          });
          break;
        case 'json':
          // Export project as JSON
          await saveProject(currentProjectId || undefined);
          toast({
            title: "Project Exported",
            description: "Your project has been exported as JSON.",
            variant: "default"
          });
          break;
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your export. Please try again.",
        variant: "destructive"
      });
    }
  };

  return <SidebarLayout onExport={handleExport} />;
};

const Index = () => {
  return (
    <OptimizationProvider>
      <IndexContent />
    </OptimizationProvider>
  );
};

export default Index;
