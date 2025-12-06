
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { type StockSheet } from "@/types";
import { useOptimization } from "@/contexts/OptimizationContext";

const StockSheetInput = () => {
  const { stockSheets, setStockSheets } = useOptimization();

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
      label: newStockSheet.label || `Sheet ${stockSheets.length + 1}`
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

  const updateStockSheetProperty = (id: string, property: keyof StockSheet, value: any) => {
    setStockSheets(stockSheets.map(sheet => sheet.id === id ? {
      ...sheet,
      [property]: property === 'length' || property === 'width' || property === 'quantity' ? Number(value) : value
    } : sheet));
  };

  return (
    <div className="space-y-3">
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
                className="w-full text-sm h-8"
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
                className="w-full text-sm h-8"
                placeholder="Width (m)"
              />
            </div>

            <div>
              <Input
                type="number"
                min="1"
                value={sheet.quantity}
                onChange={e => updateStockSheetProperty(sheet.id, 'quantity', e.target.value)}
                className="w-full text-sm h-8"
                placeholder="Qty"
              />
            </div>

            <div>
              <Input
                value={sheet.label}
                onChange={e => updateStockSheetProperty(sheet.id, 'label', e.target.value)}
                className="w-full text-sm h-8"
                placeholder="Label"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-2 bg-gray-50 p-3 border border-gray-300 border-dashed rounded">
        <div className="flex justify-end">
          <Button
            size="icon"
            className="h-8 w-8 bg-[#0FA0CE] hover:bg-[#0c8aaf] text-white"
            onClick={addStockSheet}
          >
            <Plus size={16} />
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
              className="w-full text-sm h-8"
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
              className="w-full text-sm h-8"
            />
          </div>

          <div>
            <Input
              type="number"
              min="1"
              placeholder="Qty"
              value={newStockSheet.quantity || ""}
              onChange={e => setNewStockSheet({...newStockSheet, quantity: Number(e.target.value)})}
              className="w-full text-sm h-8"
            />
          </div>

          <div>
            <Input
              placeholder="Label"
              value={newStockSheet.label || ""}
              onChange={e => setNewStockSheet({...newStockSheet, label: e.target.value})}
              className="w-full text-sm h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSheetInput;
