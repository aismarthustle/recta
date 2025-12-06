
import { type Panel } from "@/types";
import PanelCard from "./PanelCard";

interface PanelListProps {
  panels: Panel[];
  onRemovePanel: (id: string) => void;
  onUpdatePanel: (id: string, property: keyof Panel, value: any) => void;
}

const PanelList = ({ panels, onRemovePanel, onUpdatePanel }: PanelListProps) => {
  return (
    <div className="space-y-3">
      {panels.map((panel) => (
        <PanelCard
          key={panel.id}
          panel={panel}
          onRemove={onRemovePanel}
          onUpdate={onUpdatePanel}
        />
      ))}
    </div>
  );
};

export default PanelList;
