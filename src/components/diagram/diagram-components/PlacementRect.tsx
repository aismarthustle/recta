
import { CutPlacement } from "@/types";
import { getPanelGradient, getGradientId } from "@/utils/gradientUtils";
import { definedGradients } from "@/utils/diagramUtils";

interface PlacementRectProps {
  placement: CutPlacement;
  scaleX: number;
  scaleY: number;
  identicalCount?: number; // Kept for backward compatibility but no longer used
}

const PlacementRect = ({ placement, scaleX, scaleY }: PlacementRectProps) => {
  // Convert real dimensions to SVG coordinates with fixed precision to avoid inconsistencies
  const x = Math.round(placement.x * scaleX * 100) / 100;
  const y = Math.round(placement.y * scaleY * 100) / 100;

  // Calculate width and height for the SVG rectangle with fixed precision
  // For rotated panels, swap length and width
  const width = Math.round((placement.rotation
    ? placement.width * scaleX
    : placement.length * scaleX) * 100) / 100;
  const height = Math.round((placement.rotation
    ? placement.length * scaleY
    : placement.width * scaleY) * 100) / 100;

  // Get gradient colors based on panel ID and base color
  const { startColor, endColor } = getPanelGradient(placement.panelId, placement.color);
  const gradientId = getGradientId(placement.panelId);

  // Check if we need to define this gradient
  const needsGradientDefinition = !definedGradients.has(gradientId);

  // Add to the set of defined gradients
  if (needsGradientDefinition) {
    definedGradients.add(gradientId);
  }

  return (
    <g>
      {/* Define gradient for this panel only if it hasn't been defined yet */}
      {needsGradientDefinition && (
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            gradientUnits="objectBoundingBox"
            spreadMethod="pad"
          >
            <stop offset="0%" stopColor={startColor} />
            <stop offset="50%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
      )}

      {/* Panel rectangle with gradient fill and solid color fallback */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={startColor} /* Solid color fallback */
        stroke="#6c757d"
        strokeWidth="1"
        rx="2"
        ry="2"
        filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.1))"
      />
      {/* Overlay with gradient that will be visible at normal zoom levels */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
        stroke="#6c757d"
        strokeWidth="1"
        rx="2"
        ry="2"
        className="panel-gradient-overlay"
      />

      {/* Display panel label in center with smaller font */}
      {(width > 40 && height > 30) && (
        <g>
          {/* Determine if panel is drawn vertically (height > width) */}
          {height > width ? (
            <>
              {/* Vertical panel - rotate text 90 degrees */}
              {/* Text shadow effect using a duplicate text element */}
              <text
                x={x + width / 2 + 1}
                y={y + height / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(12, height / 12)}
                fill="rgba(255,255,255,0.7)"
                fontWeight="500"
                transform={`rotate(90, ${x + width / 2 + 1}, ${y + height / 2 + 1})`}
              >
                {placement.label}
              </text>
              <text
                x={x + width / 2}
                y={y + height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(12, height / 12)}
                fill="#333"
                fontWeight="500"
                transform={`rotate(90, ${x + width / 2}, ${y + height / 2})`}
              >
                {placement.label}
              </text>
            </>
          ) : (
            <>
              {/* Horizontal panel - normal text */}
              {/* Text shadow effect using a duplicate text element */}
              <text
                x={x + width / 2 + 1}
                y={y + height / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(12, width / 12)}
                fill="rgba(255,255,255,0.7)"
                fontWeight="500"
              >
                {placement.label}
              </text>
              <text
                x={x + width / 2}
                y={y + height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(12, width / 12)}
                fill="#333"
                fontWeight="500"
              >
                {placement.label}
              </text>
            </>
          )}
        </g>
      )}

      {/* Display dimensions inside the panel */}
      <PanelDimensions
        x={x}
        y={y}
        width={width}
        height={height}
        placement={placement}
      />

      {/* Panel count indicators removed as requested */}
    </g>
  );
};

interface PanelDimensionsProps {
  x: number;
  y: number;
  width: number;
  height: number;
  placement: CutPlacement;
}

const PanelDimensions = ({ x, y, width, height, placement }: PanelDimensionsProps) => {
  // Calculate real dimensions for display
  // For rotated panels, width and length are swapped
  const realWidth = placement.rotation ? placement.length : placement.width;
  const realLength = placement.rotation ? placement.width : placement.length;

  return (
    <>
      {/* Length dimension - displayed horizontally in top-left corner with specified spacing */}
      {height > 30 && (
        <g>
          <text
            x={x + 20}
            y={y + 10}
            textAnchor="start"
            dominantBaseline="middle"
            fontSize={8}
            fill="#333"
            fontWeight="bold"
          >
            {realLength.toFixed(2)} m
          </text>
        </g>
      )}

      {/* Width dimension - displayed vertically in top-left corner with specified spacing */}
      {width > 30 && (
        <g>
          <text
            x={x + 10}
            y={y + 35}
            textAnchor="start"
            dominantBaseline="middle"
            fontSize={8}
            fill="#333"
            fontWeight="bold"
            transform={`rotate(270, ${x + 10}, ${y + 35})`}
          >
            {realWidth.toFixed(2)} m
          </text>
        </g>
      )}
    </>
  );
};

export default PlacementRect;
