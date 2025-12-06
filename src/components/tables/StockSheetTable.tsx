import React, { useState, useEffect, useRef } from 'react';
import { useOptimization } from "@/contexts/OptimizationContext";
import { Factory, ChevronDown, ChevronUp, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { readCSVFile, parseStockSheetsFromCSV } from "@/utils/csvUtils";
import { toast } from "@/components/ui/use-toast";

const StockSheetTable: React.FC = () => {
  const { stockSheets, setStockSheets } = useOptimization();
  const [isOpen, setIsOpen] = useState(true);
  const [editableSheets, setEditableSheets] = useState([...stockSheets]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emptyRow, setEmptyRow] = useState({
    id: `stock-empty-${Date.now()}`,
    length: "",
    width: "",
    quantity: "",
    label: ""
  });

  // This effect syncs the editableSheets with stockSheets from context
  useEffect(() => {
    const validSheets = stockSheets.filter(sheet =>
      sheet.length !== undefined && sheet.width !== undefined && sheet.quantity !== undefined
    );
    setEditableSheets(validSheets);
  }, [stockSheets]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, id: string) => {
    const value = e.target.value;

    // If this is the empty row being edited
    if (id === emptyRow.id) {
      const newEmptyRow = { ...emptyRow, [field]: value };
      setEmptyRow(newEmptyRow);

      // If all required fields are filled, add it as a new stock sheet
      if (newEmptyRow.length && newEmptyRow.width && newEmptyRow.quantity) {
        const newSheet = {
          id: `stock-${Date.now()}`,
          length: Number(newEmptyRow.length),
          width: Number(newEmptyRow.width),
          quantity: Number(newEmptyRow.quantity),
          label: newEmptyRow.label || `Plaque ${editableSheets.length + 1}`
        };

        const updatedSheets = [...editableSheets, newSheet];
        setStockSheets(updatedSheets);

        // Reset empty row
        setEmptyRow({
          id: `stock-empty-${Date.now()}`,
          length: "",
          width: "",
          quantity: "",
          label: ""
        });
      }
    } else {
      // Update an existing sheet
      const updatedSheets = editableSheets.map(sheet => {
        if (sheet.id === id) {
          // For numeric fields, only convert to number if the value is not empty
          const newValue = field === 'label' ? value : (value === "" ? value : Number(value));
          return { ...sheet, [field]: newValue };
        }
        return sheet;
      });

      setStockSheets(updatedSheets);
    }
  };

  const removeSheet = (id: string) => {
    setStockSheets(editableSheets.filter(sheet => sheet.id !== id));
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
          description: "No valid stock sheets found in the CSV file.",
          variant: "destructive",
        });
        return;
      }

      setStockSheets([...stockSheets, ...importedSheets]);
      toast({
        title: "Import Successful",
        description: `Imported ${importedSheets.length} stock sheets.`,
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-white border border-gray-300 rounded mb-2">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center">
          <div className="bg-industrial-dark text-white p-1 rounded mr-1.5">
            <Factory size={14} />
          </div>
          <span className="font-medium text-sm">Plaques ({editableSheets.length})</span>
        </div>
        <div className="flex items-center gap-1">
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
            className="text-xs h-6 border-gray-400 px-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={12} className="mr-1" /> Import
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium">Qty</TableHead>
                <TableHead className="text-xs font-medium">Length</TableHead>
                <TableHead className="text-xs font-medium">Width</TableHead>
                <TableHead className="text-xs font-medium">Label</TableHead>
                <TableHead className="text-xs font-medium w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableSheets.map(sheet => (
                <TableRow key={sheet.id}>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={sheet.quantity}
                      onChange={(e) => handleInputChange(e, 'quantity', sheet.id)}
                      className="h-7 text-xs border-0 focus:ring-0 px-1 py-1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sheet.length}
                      onChange={(e) => handleInputChange(e, 'length', sheet.id)}
                      className="h-7 text-xs border-0 focus:ring-0 px-1 py-1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sheet.width}
                      onChange={(e) => handleInputChange(e, 'width', sheet.id)}
                      className="h-7 text-xs border-0 focus:ring-0 px-1 py-1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={sheet.label}
                      onChange={(e) => handleInputChange(e, 'label', sheet.id)}
                      className="h-7 text-xs border-0 focus:ring-0"
                    />
                  </TableCell>
                  <TableCell className="p-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600"
                      onClick={() => removeSheet(sheet.id)}
                    >
                      <X size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {/* Empty row that automatically creates a new sheet when filled */}
              <TableRow>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={emptyRow.quantity}
                    onChange={(e) => handleInputChange(e, 'quantity', emptyRow.id)}
                    className="h-7 text-xs border-0 focus:ring-0 px-1 py-1"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={emptyRow.length}
                    onChange={(e) => handleInputChange(e, 'length', emptyRow.id)}
                    className="h-7 text-xs border-0 focus:ring-0 px-1 py-1"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={emptyRow.width}
                    onChange={(e) => handleInputChange(e, 'width', emptyRow.id)}
                    className="h-7 text-xs border-0 focus:ring-0 px-1 py-1"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={emptyRow.label}
                    onChange={(e) => handleInputChange(e, 'label', emptyRow.id)}
                    className="h-7 text-xs border-0 focus:ring-0"
                  />
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default StockSheetTable;
