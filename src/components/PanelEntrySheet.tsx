
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { type Panel } from "@/types";
import { useOptimization } from "@/contexts/OptimizationContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { SquareStack, Upload } from "lucide-react";
import { generateRandomColor } from "@/utils/colorUtils";
import PanelList from "./panels/PanelList";
import NewPanelForm from "./panels/NewPanelForm";
import { readCSVFile, parsePanelsFromCSV } from "@/utils/csvUtils";
import { toast } from "@/components/ui/use-toast";

const PanelEntrySheet = () => {
  const { panels, setPanels } = useOptimization();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPanel, setNewPanel] = useState<Partial<Panel>>({
    length: 0,
    width: 0,
    quantity: 1,
    label: ""
  });

  const addPanel = () => {
    if (!newPanel.length || !newPanel.width || !newPanel.quantity) {
      return;
    }

    const panel: Panel = {
      id: `panel-${Date.now()}`,
      length: Number(newPanel.length),
      width: Number(newPanel.width),
      quantity: Number(newPanel.quantity),
      label: newPanel.label || `Découpe ${panels.length + 1}`,
      color: generateRandomColor()
    };

    setPanels([...panels, panel]);
    setNewPanel({
      length: 0,
      width: 0,
      quantity: 1,
      label: ""
    });
  };

  const removePanel = (id: string) => {
    setPanels(panels.filter(panel => panel.id !== id));
  };

  const updatePanelProperty = (id: string, property: keyof Panel, value: string | number) => {
    setPanels(panels.map(panel => panel.id === id ? {
      ...panel,
      [property]: property === 'length' || property === 'width' || property === 'quantity' ? Number(value) : value
    } : panel));
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvContent = await readCSVFile(file);
      const importedPanels = parsePanelsFromCSV(csvContent);

      if (importedPanels.length === 0) {
        toast({
          title: "Import Error",
          description: "No valid découpes found in the CSV file.",
          variant: "destructive",
        });
        return;
      }

      setPanels([...panels, ...importedPanels]);
      toast({
        title: "Import Successful",
        description: `Imported ${importedPanels.length} découpes.`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to import CSV file. Please check the file format.",
        variant: "destructive",
      });
      console.error("CSV import error:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="w-full h-auto py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300 justify-start">
          <div className="bg-industrial-dark text-white p-0.5 rounded mr-1">
            <SquareStack size={14} />
          </div>
          <span className="text-xs">Découpes ({panels.length})</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-gray-100 border-gray-300 w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-sm font-semibold text-gray-800 flex items-center">
            <div className="bg-industrial-dark text-white p-0.5 rounded mr-1">
              <SquareStack size={14} />
            </div>
            Découpes
          </SheetTitle>
        </SheetHeader>

        <div className="mt-2 flex justify-end">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImportCSV}
            className="hidden"
            aria-label="Import découpes from CSV"
            title="Import découpes from CSV"
          />
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 border-gray-400"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={12} className="mr-1" /> Importer CSV
          </Button>
        </div>

        <div className="mt-2 space-y-3">
          <PanelList
            panels={panels}
            onRemovePanel={removePanel}
            onUpdatePanel={updatePanelProperty}
          />

          <NewPanelForm
            newPanel={newPanel}
            onNewPanelChange={setNewPanel}
            onAddPanel={addPanel}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PanelEntrySheet;
