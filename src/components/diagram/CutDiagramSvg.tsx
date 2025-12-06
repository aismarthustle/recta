
import { useRef, useEffect } from "react";
import { CutPlan } from "@/types";
import { calculateSvgDimensions, resetDefinedGradients } from "@/utils/diagramUtils";
import { resetPanelColorMap } from "@/utils/gradientUtils";
import StockSheetBackground from "./diagram-components/StockSheetBackground";
import PlacementRect from "./diagram-components/PlacementRect";
import StockSheetLabel from "./diagram-components/StockSheetLabel";
import DimensionLines from "./diagram-components/DimensionLines";

interface CutDiagramSvgProps {
  currentPlan: CutPlan;
  scale: number;
  sheetCount?: number;
}

const CutDiagramSvg = ({ currentPlan, scale, sheetCount = 1 }: CutDiagramSvgProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Reset defined gradients and panel color map when the component mounts or when the current plan changes
  useEffect(() => {
    resetDefinedGradients();
    resetPanelColorMap();
  }, [currentPlan]);

  const stockSheetWidth = currentPlan.stockSheetDimensions.width;
  const stockSheetLength = currentPlan.stockSheetDimensions.length;

  // Use the sheetCount prop to indicate how many identical sheets are used
  const totalSheets = sheetCount;

  const {
    viewBoxWidth,
    viewBoxHeight,
    scaleX,
    scaleY
  } = calculateSvgDimensions(stockSheetWidth, stockSheetLength);

  // Panel count indicators have been removed, so we no longer need to count identical panels

  // Calculate a fixed aspect ratio based on the viewBox dimensions
  const aspectRatio = (viewBoxHeight + 100) / (viewBoxWidth + 60);

  return (
    <div className="overflow-hidden border rounded-md w-full">
      {/* Wrapper div with aspect ratio to maintain consistent size */}
      <div
        className="aspect-ratio-container"
        style={{ paddingBottom: `${aspectRatio * 100}%` }} /* This is dynamic based on diagram dimensions */
      >
        <div
          className="diagram-container"
          style={{
            transform: `scale(${scale})` /* This is dynamic based on user zoom level */
          }}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`-10 -30 ${viewBoxWidth + 60} ${viewBoxHeight + 100}`}
            preserveAspectRatio="xMinYMin meet"
            className="border border-gray-200"
          >
          <StockSheetBackground
            viewBoxWidth={viewBoxWidth}
            viewBoxHeight={viewBoxHeight}
          />

          <StockSheetLabel
            viewBoxWidth={viewBoxWidth}
            viewBoxHeight={viewBoxHeight}
            stockSheetId={currentPlan.stockSheetId}
            stockSheetLength={stockSheetLength}
            stockSheetWidth={stockSheetWidth}
            totalSheets={totalSheets}
          />

          {/* Render all placements */}
          {currentPlan.placements.map((placement, index) => {
            return (
              <PlacementRect
                key={index}
                placement={placement}
                scaleX={scaleX}
                scaleY={scaleY}
              />
            );
          })}

          <DimensionLines
            viewBoxWidth={viewBoxWidth}
            viewBoxHeight={viewBoxHeight}
            stockSheetLength={stockSheetLength}
            stockSheetWidth={stockSheetWidth}
          />
        </svg>
        </div>
      </div>
    </div>
  );
};

export default CutDiagramSvg;
