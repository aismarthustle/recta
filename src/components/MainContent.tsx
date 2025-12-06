
import React from 'react';
import { useOptimization } from "@/contexts/OptimizationContext";
import CuttingDiagram from "@/components/CuttingDiagram";
import { Factory, Loader2 } from "lucide-react";

interface MainContentProps {
  onExport: (format: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ onExport }) => {
  const { isProcessing, result } = useOptimization();

  return (
    <div className="flex-1 bg-gray-100 flex flex-col overflow-y-auto">
      <div className="flex-1 p-2">
        {result ? <CuttingDiagram onExport={onExport} /> : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-6 bg-white border border-gray-300 rounded-md shadow-sm">
              <Factory size={48} className="mx-auto mb-3 text-industrial-neutral" />
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Pas Encore de Résultats d'Optimisation</h2>
              <p className="text-gray-600 text-xs mb-3">Remplissez les données des découpes et des plaques, puis cliquez sur "Calculer Optimisation"</p>
            </div>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <Loader2 className="animate-spin h-6 w-6 text-industrial-blue" />
            <div>
              <h3 className="font-bold text-xs">Traitement...</h3>
              <p className="text-[10px] text-gray-500">Optimisation des découpes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
