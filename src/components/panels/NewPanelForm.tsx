
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type Panel } from "@/types";
import PanelCard from "./PanelCard";

interface NewPanelFormProps {
  newPanel: Partial<Panel>;
  onNewPanelChange: (panel: Partial<Panel>) => void;
  onAddPanel: () => void;
}

const NewPanelForm = ({ newPanel, onNewPanelChange, onAddPanel }: NewPanelFormProps) => {
  const updateNewPanelProperty = (id: string, property: keyof Panel, value: any) => {
    onNewPanelChange({
      ...newPanel,
      [property]: property === 'length' || property === 'width' || property === 'quantity' 
        ? Number(value) 
        : value
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <Button
          size="icon"
          className="h-7 w-7 bg-[#0FA0CE] hover:bg-[#0c8aaf] text-white"
          onClick={onAddPanel}
        >
          <Plus size={14} />
        </Button>
      </div>

      <PanelCard 
        panel={{ 
          ...newPanel,
          id: 'new-panel' 
        } as Panel}
        onRemove={() => {}}
        onUpdate={updateNewPanelProperty}
        isNew={true}
      />
    </div>
  );
};

export default NewPanelForm;
