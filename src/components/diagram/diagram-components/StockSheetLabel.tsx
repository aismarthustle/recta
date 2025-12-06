
interface StockSheetLabelProps {
  viewBoxWidth: number;
  viewBoxHeight: number;
  stockSheetId?: string; // Made optional since we're not using it
  stockSheetLength?: number; // Made optional since we're not using it
  stockSheetWidth?: number; // Made optional since we're not using it
  totalSheets?: number; // Prop for total sheet count
}

const StockSheetLabel = ({
  viewBoxWidth,
  viewBoxHeight,
  totalSheets
}: StockSheetLabelProps) => {
  // Define gradient ID for the sheet count badge
  const sheetCountGradientId = "sheetCountGradient";

  return (
    <>

      {/* Sheet count if provided (e.g., x12) */}
      {totalSheets && (
        <g>
          {/* Define gradient for sheet count badge */}
          <defs>
            <linearGradient id={sheetCountGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#495057" />
              <stop offset="100%" stopColor="#343a40" />
            </linearGradient>
          </defs>

          {/* Sheet count badge with gradient */}
          <rect
            x={viewBoxWidth - 60}
            y={viewBoxHeight - 60} /* Adjusted position to account for extra height */
            width={50}
            height={30}
            rx={8}
            fill={`url(#${sheetCountGradientId})`}
            filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.2))"
          />

          {/* Sheet count text */}
          <text
            x={viewBoxWidth - 15}
            y={viewBoxHeight - 38} /* Adjusted position to account for extra height */
            textAnchor="end"
            dominantBaseline="auto"
            fontSize={18}
            fontWeight="bold"
            fill="#fff"
          >
            x{totalSheets}
          </text>
        </g>
      )}
    </>
  );
};

export default StockSheetLabel;
