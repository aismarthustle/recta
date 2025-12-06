
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Upload, Factory } from "lucide-react";
import { useState, useRef } from "react";
import { type StockSheet } from "@/types";
import { useOptimization } from "@/contexts/OptimizationContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { readCSVFile, parseStockSheetsFromCSV } from "@/utils/csvUtils";
import { toast } from "@/components/ui/use-toast";

const StockSheetEntrySheet = () => {
  const { stockSheets, setStockSheets } = useOptimization();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newStockSheet, setNewStockSheet] = useState<Partial<StockSheet>>({
    length: 0,
    width: 0,
    quantity: 1,
    label: ""
  });

  const addStockSheet = () => {
    if (!newStockSheet.length || !newStockSheet.width || !newStockSheet.quantity) {
      return;
    }

    const stockSheet: StockSheet = {
      id: `stock-${Date.now()}`,
      length: Number(newStockSheet.length),
      width: Number(newStockSheet.width),
      quantity: Number(newStockSheet.quantity),
      label: newStockSheet.label || `Plaque ${stockSheets.length + 1}`
    };

    setStockSheets([...stockSheets, stockSheet]);
    setNewStockSheet({
      length: 0,
      width: 0,
      quantity: 1,
      label: ""
    });
  };

  const removeStockSheet = (id: string) => {
    setStockSheets(stockSheets.filter(sheet => sheet.id !== id));
  };

  const updateStockSheetProperty = (id: string, property: keyof StockSheet, value: string | number) => {
    setStockSheets(stockSheets.map(sheet => sheet.id === id ? {
      ...sheet,
      [property]: property === 'length' || property === 'width' || property === 'quantity' ? Number(value) : value
    } : sheet));
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvContent = await readCSVFile(file);
      const importedSheets = parseStockSheetsFromCSV(csvContent);

      if (importedSheets.length === 0) {
        toast({
          title: "Import Error",
          description: "No valid plaques found in the CSV file.",
          variant: "destructive",
        });
        return;
      }

      setStockSheets([...stockSheets, ...importedSheets]);
      toast({
        title: "Import Successful",
        description: `Imported ${importedSheets.length} plaques.`,
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
            <Factory size={14} />
          </div>
          <span className="text-xs">Plaques ({stockSheets.length})</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-gray-100 border-gray-300 w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-sm font-semibold text-gray-800 flex items-center">
            <div className="bg-industrial-dark text-white p-0.5 rounded mr-1">
              <Factory size={14} />
            </div>
            Plaques
          </SheetTitle>
        </SheetHeader>

        <div className="mt-2 flex justify-end">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImportCSV}
            className="hidden"
            aria-label="Import plaques from CSV"
            title="Import plaques from CSV"
          />
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 border-gray-400"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={12} className="mr-1" /> Import CSV
          </Button>
        </div>

        <div className="mt-2 space-y-3">
          {stockSheets.map(sheet => (
            <div key={sheet.id} className="flex flex-col gap-2 bg-white p-3 border border-gray-300 rounded">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100"
                  onClick={() => removeStockSheet(sheet.id)}
                >
                  <Trash size={16} />
                </Button>
              </div>

              <div className="space-y-2">
                <div>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sheet.length}
                    onChange={e => updateStockSheetProperty(sheet.id, 'length', e.target.value)}
                    className="w-full text-xs h-7"
                    placeholder="Length (m)"
                  />
                </div>

                <div>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sheet.width}
                    onChange={e => updateStockSheetProperty(sheet.id, 'width', e.target.value)}
                    className="w-full text-xs h-7"
                    placeholder="Width (m)"
                  />
                </div>

                <div>
                  <Input
                    type="number"
                    min="1"
                    value={sheet.quantity}
                    onChange={e => updateStockSheetProperty(sheet.id, 'quantity', e.target.value)}
                    className="w-full text-xs h-7"
                    placeholder="Qty"
                  />
                </div>

                <div>
                  <Input
                    value={sheet.label}
                    onChange={e => updateStockSheetProperty(sheet.id, 'label', e.target.value)}
                    className="w-full text-xs h-7"
                    placeholder="Étiquette"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2 bg-gray-50 p-3 border border-gray-300 border-dashed rounded">
            <div className="flex justify-end">
              <Button
                size="icon"
                className="h-7 w-7 bg-[#0FA0CE] hover:bg-[#0c8aaf] text-white"
                onClick={addStockSheet}
              >
                <Plus size={14} />
              </Button>
            </div>

            <div className="space-y-2">
              <div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Length (m)"
                  value={newStockSheet.length || ""}
                  onChange={e => setNewStockSheet({...newStockSheet, length: Number(e.target.value)})}
                  className="w-full text-xs h-7"
                />
              </div>

              <div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Width (m)"
                  value={newStockSheet.width || ""}
                  onChange={e => setNewStockSheet({...newStockSheet, width: Number(e.target.value)})}
                  className="w-full text-xs h-7"
                />
              </div>

              <div>
                <Input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={newStockSheet.quantity || ""}
                  onChange={e => setNewStockSheet({...newStockSheet, quantity: Number(e.target.value)})}
                  className="w-full text-xs h-7"
                />
              </div>

              <div>
                <Input
                  placeholder="Étiquette"
                  value={newStockSheet.label || ""}
                  onChange={e => setNewStockSheet({...newStockSheet, label: e.target.value})}
                  className="w-full text-xs h-7"
                />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StockSheetEntrySheet;
