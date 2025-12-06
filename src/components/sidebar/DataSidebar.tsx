
import React from 'react';
import PanelTable from '@/components/tables/PanelTable';
import StockSheetTable from '@/components/tables/StockSheetTable';
import CutOptionsInput from '@/components/CutOptionsInput';
import { ScissorsLineDashed } from 'lucide-react';

const DataSidebar: React.FC = () => {
  return (
    <div className="h-full bg-gray-100 overflow-y-auto">
      <div className="h-full flex flex-col">
        <div className="p-1 flex flex-col space-y-1">
          <PanelTable />
          <StockSheetTable />

          <div className="bg-gray-200 p-1 border-b border-gray-300 mt-2">
            <h2 className="text-xs font-semibold text-gray-800 flex items-center">
              <div className="bg-industrial-dark text-white p-0.5 rounded mr-1">
                <ScissorsLineDashed size={14} />
              </div>
              Options
            </h2>
          </div>
          <div className="p-1">
            <CutOptionsInput />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSidebar;
