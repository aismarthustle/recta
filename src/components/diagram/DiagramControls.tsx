import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Download,
  FileDown,
  Box,
  LayoutTemplate
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface DiagramControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExport: (format: string) => void;
  onExportPdf: () => void;
  viewMode: '2d' | '3d';
  onViewModeChange: (mode: '2d' | '3d') => void;
}

const DiagramControls = ({
  scale,
  onZoomIn,
  onZoomOut,
  onExport,
  onExportPdf,
  viewMode,
  onViewModeChange
}: DiagramControlsProps) => {
  return (
    <div className="sticky top-0 z-50 flex justify-between items-center mb-3 py-2 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm -mx-4 px-4">
      <div className="flex items-center space-x-1">
        <div className="bg-gray-100 p-0.5 rounded-lg flex border border-gray-200">
          <Button
            variant={viewMode === '2d' ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange('2d')}
            className={`h-7 px-2 text-xs ${viewMode === '2d' ? 'bg-white shadow-sm text-industrial-dark font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutTemplate size={14} className="mr-1.5" /> 2D
          </Button>
          <Button
            variant={viewMode === '3d' ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange('3d')}
            className={`h-7 px-2 text-xs ${viewMode === '3d' ? 'bg-white shadow-sm text-industrial-dark font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Box size={14} className="mr-1.5" /> 3D
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {viewMode === '2d' && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={onZoomOut}
              disabled={scale <= 0.5}
              className="h-6 w-6 border-gray-400"
            >
              <ZoomOut size={14} />
            </Button>

            <span className="text-xs font-mono w-10 text-center">{Math.round(scale * 100)}%</span>

            <Button
              variant="outline"
              size="icon"
              onClick={onZoomIn}
              disabled={scale >= 2}
              className="h-6 w-6 border-gray-400"
            >
              <ZoomIn size={14} />
            </Button>

            <div className="border-l border-gray-300 h-5 mx-1"></div>
          </>
        )}

        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            className="text-[10px] h-6 border-gray-400 px-1.5"
          >
            <FileDown size={12} className="mr-1" /> Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiagramControls;
