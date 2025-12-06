
interface DimensionLinesProps {
  viewBoxWidth: number;
  viewBoxHeight: number;
  stockSheetLength: number;
  stockSheetWidth: number;
}

const DimensionLines = ({
  viewBoxWidth,
  viewBoxHeight,
  stockSheetLength,
  stockSheetWidth
}: DimensionLinesProps) => {
  // Modern color for dimension lines
  const dimensionColor = "#6c757d";
  const dimensionStrokeWidth = "1.5";

  return (
    <g>
      {/* Bottom dimension line with modern styling */}
      <g>
        {/* Main dimension line */}
        <line
          x1="0"
          y1={viewBoxHeight + 40} /* Adjusted for extra height */
          x2={viewBoxWidth}
          y2={viewBoxHeight + 40} /* Adjusted for extra height */
          stroke={dimensionColor}
          strokeWidth={dimensionStrokeWidth}
          strokeDasharray="4 2"
        />

        {/* Left end marker */}
        <line
          x1="0"
          y1={viewBoxHeight + 35} /* Adjusted for extra height */
          x2="0"
          y2={viewBoxHeight + 45} /* Adjusted for extra height */
          stroke={dimensionColor}
          strokeWidth={dimensionStrokeWidth}
        />

        {/* Right end marker */}
        <line
          x1={viewBoxWidth}
          y1={viewBoxHeight + 35} /* Adjusted for extra height */
          x2={viewBoxWidth}
          y2={viewBoxHeight + 45} /* Adjusted for extra height */
          stroke={dimensionColor}
          strokeWidth={dimensionStrokeWidth}
        />

        {/* Dimension text with background for better visibility */}
        <rect
          x={(viewBoxWidth / 2) - 40}
          y={viewBoxHeight + 45} /* Adjusted for extra height */
          width={80}
          height={20}
          rx={10}
          fill="white"
          stroke={dimensionColor}
          strokeWidth="1"
        />
        <text
          x={viewBoxWidth / 2}
          y={viewBoxHeight + 55} /* Adjusted for extra height */
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fontWeight="500"
          fill={dimensionColor}
        >
          {stockSheetWidth.toFixed(2)} m
        </text>
      </g>

      {/* Right dimension line with modern styling */}
      <g>
        {/* Main dimension line */}
        <line
          x1={viewBoxWidth + 20}
          y1="0"
          x2={viewBoxWidth + 20}
          y2={viewBoxHeight}
          stroke={dimensionColor}
          strokeWidth={dimensionStrokeWidth}
          strokeDasharray="4 2"
        />

        {/* Top end marker */}
        <line
          x1={viewBoxWidth + 15}
          y1="0"
          x2={viewBoxWidth + 25}
          y2="0"
          stroke={dimensionColor}
          strokeWidth={dimensionStrokeWidth}
        />

        {/* Bottom end marker */}
        <line
          x1={viewBoxWidth + 15}
          y1={viewBoxHeight}
          x2={viewBoxWidth + 25}
          y2={viewBoxHeight}
          stroke={dimensionColor}
          strokeWidth={dimensionStrokeWidth}
        />

        {/* Dimension text with background for better visibility */}
        <g transform={`rotate(90, ${viewBoxWidth + 35}, ${viewBoxHeight / 2})`}>
          <rect
            x={(viewBoxWidth + 35) - 40}
            y={(viewBoxHeight / 2) - 10}
            width={80}
            height={20}
            rx={10}
            fill="white"
            stroke={dimensionColor}
            strokeWidth="1"
          />
          <text
            x={viewBoxWidth + 35}
            y={viewBoxHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fontWeight="500"
            fill={dimensionColor}
          >
            {stockSheetLength.toFixed(2)} m
          </text>
        </g>
      </g>
    </g>
  );
};

export default DimensionLines;
