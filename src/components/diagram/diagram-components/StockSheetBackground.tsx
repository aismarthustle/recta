
interface StockSheetBackgroundProps {
  viewBoxWidth: number;
  viewBoxHeight: number;
}

const StockSheetBackground = ({ viewBoxWidth, viewBoxHeight }: StockSheetBackgroundProps) => {
  // Define gradient ID
  const gradientId = "stockSheetGradient";

  return (
    <>
      {/* Define the gradient */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </linearGradient>
      </defs>

      {/* Stock sheet with gradient fill */}
      <rect
        x="0"
        y="0"
        width={viewBoxWidth}
        height={viewBoxHeight}
        fill={`url(#${gradientId})`}
        stroke="#6c757d"
        strokeWidth="1.5"
        rx="2"
        ry="2"
      />
    </>
  );
};

export default StockSheetBackground;
