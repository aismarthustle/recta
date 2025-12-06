
import { CutPlan } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface PlanDetailsProps {
  currentPlan: CutPlan;
  sheetCount?: number;
}

const PlanDetails = ({ currentPlan, sheetCount = 1 }: PlanDetailsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
      <Card>
        <CardHeader className="py-1 px-3">
          <CardTitle className="text-xs">Détails de la plaque</CardTitle>
        </CardHeader>
        <CardContent className="py-1 px-3">
          <p className="text-xs">
            <span className="font-semibold">Dimensions:</span> {currentPlan.stockSheetDimensions.width.toFixed(2)} m × {currentPlan.stockSheetDimensions.length.toFixed(2)} m
          </p>
          <p className="text-xs">
            <span className="font-semibold">Surface:</span> {(currentPlan.stockSheetDimensions.length * currentPlan.stockSheetDimensions.width).toFixed(2)} m²
          </p>
          <p className="text-xs mt-1">
            <span className="font-semibold">Nombre de plaque(s):</span> {sheetCount}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-1 px-3">
          <CardTitle className="text-xs">Utilisation</CardTitle>
        </CardHeader>
        <CardContent className="py-1 px-3">
          <p className="text-xs">
            <span className="font-semibold">Surface totale utilisée:</span> {(currentPlan.stockSheetDimensions.length * currentPlan.stockSheetDimensions.width * sheetCount).toFixed(2)} m²
          </p>
          <p className="text-xs">
            <span className="font-semibold">Surface utilisée:</span> {(currentPlan.usedArea * sheetCount).toFixed(2)} m² ({(100 - currentPlan.wastedPercentage).toFixed(0)}%)
          </p>
          <p className="text-xs">
            <span className="font-semibold">Surface perdue:</span> <span className="text-red-500 font-medium">{(currentPlan.wastedArea * sheetCount).toFixed(2)} m² ({currentPlan.wastedPercentage.toFixed(0)}%)</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-1 px-3">
          <CardTitle className="text-xs">Découpes</CardTitle>
        </CardHeader>
        <CardContent className="py-1 px-3">
          <p className="text-xs">
            <span className="font-semibold">Nombre de découpes:</span> {currentPlan.placements.length * sheetCount}
          </p>
          <p className="text-xs">
            <span className="font-semibold">Nombre de coupes:</span> {currentPlan.totalCuts * sheetCount}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanDetails;
