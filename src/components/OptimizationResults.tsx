
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  SquareStack,
  ScissorsLineDashed,
  Percent,
  ListTodo,
  Gauge
} from "lucide-react";
import { useOptimization } from "@/contexts/OptimizationContext";

const StatCard = ({ title, value, subtext, icon: Icon }) => (
  <Card className="bg-gray-100 border-gray-300">
    <CardHeader className="pb-1 pt-2 px-3 flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-xs font-medium text-gray-700">{title}</CardTitle>
      <Icon className="h-3 w-3 text-industrial-steel" />
    </CardHeader>
    <CardContent className="pt-1 pb-2 px-3">
      <div className="text-base font-bold text-gray-800">{value}</div>
      <p className="text-[10px] text-gray-600">
        {subtext}
      </p>
    </CardContent>
  </Card>
);

const OptimizationResults = () => {
  const { result, stockSheets } = useOptimization();

  if (!result) {
    return null;
  }

  // Calculate total area of all used stock sheets in m²
  const totalSheetsArea = result.cutPlans.reduce((sum, plan) => {
    const sheetArea = plan.stockSheetDimensions.length * plan.stockSheetDimensions.width;
    return sum + sheetArea;
  }, 0);

  // Calculate total number of sheets in stock
  const totalStockSheets = stockSheets.reduce((sum, sheet) => {
    const quantity = typeof sheet.quantity === 'string' ? Number(sheet.quantity) : sheet.quantity;
    return sum + quantity;
  }, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-200 p-2 border-b border-gray-300">
        <h2 className="text-xs font-semibold text-gray-800 flex items-center">
          <div className="bg-industrial-dark text-white p-0.5 rounded mr-1">
            <Gauge size={14} />
          </div>
          Global statistics
        </h2>
      </div>

      <div className="p-2 space-y-3 overflow-y-auto">
        <div className="grid grid-cols-1 gap-2">
          <StatCard
            title="Plaques utilisées"
            value={result.usedStockSheets}
            subtext={`sur ${totalStockSheets} plaques en stock`}
            icon={SquareStack}
          />

          <StatCard
            title="Efficacité"
            value={`${(100 - result.wastedPercentage).toFixed(1)}%`}
            subtext={<>Perte: <span className="text-industrial-red font-medium">{result.wastedPercentage.toFixed(1)}%</span></>}
            icon={Percent}
          />
        </div>

        <div className="bg-gray-200 p-2 border-b border-gray-300 -mx-2">
          <h2 className="text-xs font-semibold text-gray-800 flex items-center">
            <div className="bg-industrial-dark text-white p-0.5 rounded mr-1">
              <SquareStack size={14} />
            </div>
            Statistiques des plaques
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <StatCard
            title="Surface des plaques utilisées"
            value={`${totalSheetsArea.toFixed(2)} m²`}
            subtext={<>Surface utilisée: <span className="font-medium">{result.totalUsedArea.toFixed(2)} m²</span>, Perte: <span className="text-industrial-red font-medium">{result.totalWastedArea.toFixed(2)} m²</span></>}
            icon={ListTodo}
          />
        </div>

        <div className="bg-gray-200 p-2 border-b border-gray-300 -mx-2">
          <h2 className="text-xs font-semibold text-gray-800 flex items-center">
            <div className="bg-industrial-dark text-white p-0.5 rounded mr-1">
              <ScissorsLineDashed size={14} />
            </div>
            Découpes
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <StatCard
            title="Total des découpes"
            value={result.cutPlans.reduce((sum, plan) => sum + plan.placements.length, 0)}
            subtext={`Surface totale: ${result.totalUsedArea.toFixed(2)} m²`}
            icon={ScissorsLineDashed}
          />

          {result.additionalSheetsNeeded > 0 && (
            <Card className="bg-gray-100 border-gray-300">
              <CardHeader className="pb-1 pt-2 px-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-medium text-gray-700">Plaques supplémentaires nécessaires</CardTitle>
                <SquareStack className="h-3 w-3 text-industrial-steel" />
              </CardHeader>
              <CardContent className="pt-1 pb-2 px-3">
                <div className="text-base font-bold text-gray-800">{result.additionalSheetsNeeded} au total</div>
                <p className="text-[10px] text-gray-600 mb-1">
                  Vous avez besoin de plus de plaques pour toutes les découpes ({result.unplacedPanelsCount} découpes non placées)
                </p>

                <div className="mt-2">
                  <div className="text-[11px] font-semibold border-b border-gray-300 pb-1 mb-2">
                    Plaques supplémentaires par type:
                  </div>

                  <div className="space-y-2">
                    {result.additionalSheetsByType.map((sheet) => (
                      <div key={sheet.type} className="bg-white rounded border border-gray-200 p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-medium">{sheet.label}</span>
                          <span className="text-[11px] font-bold bg-industrial-red text-white px-2 py-0.5 rounded-full">
                            {sheet.count}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          Dimensions: {sheet.length.toFixed(2)}m × {sheet.width.toFixed(2)}m
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizationResults;
