
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { type Panel } from "@/types";

interface PanelCardProps {
  panel: Panel;
  onRemove: (id: string) => void;
  onUpdate: (id: string, property: keyof Panel, value: any) => void;
  isNew?: boolean;
}

const PanelCard = ({ panel, onRemove, onUpdate, isNew = false }: PanelCardProps) => {
  return (
    <div className={`flex flex-col gap-2 ${isNew ? 'bg-gray-50 border-dashed' : 'bg-white'} p-3 border border-gray-300 rounded`}>
      <div className="flex justify-end">
        {!isNew && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100"
            onClick={() => onRemove(panel.id)}
          >
            <Trash size={16} />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={panel.length || ""}
            onChange={(e) => onUpdate(panel.id, 'length', e.target.value)}
            className="w-full text-xs h-7"
            placeholder="Length (m)"
          />
        </div>

        <div>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={panel.width || ""}
            onChange={(e) => onUpdate(panel.id, 'width', e.target.value)}
            className="w-full text-xs h-7"
            placeholder="Width (m)"
          />
        </div>

        <div>
          <Input
            type="number"
            min="1"
            value={panel.quantity || ""}
            onChange={(e) => onUpdate(panel.id, 'quantity', e.target.value)}
            className="w-full text-xs h-7"
            placeholder="Qty"
          />
        </div>

        <div>
          <Input
            value={panel.label || ""}
            onChange={(e) => onUpdate(panel.id, 'label', e.target.value)}
            className="w-full text-xs h-7"
            placeholder="Label"
          />
        </div>
      </div>
    </div>
  );
};

export default PanelCard;
