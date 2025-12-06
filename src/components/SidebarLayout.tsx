
import React from 'react';
import { useOptimization } from "@/contexts/OptimizationContext";
import Header from "@/components/Header";
import DataSidebar from "@/components/sidebar/DataSidebar";
import MainContent from "@/components/MainContent";
import ResultsSidebar from "@/components/sidebar/ResultsSidebar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface SidebarLayoutProps {
  onExport: (format: string) => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ onExport }) => {
  const { calculateOptimization } = useOptimization();

  const handleCalculate = () => {
    calculateOptimization();
  };

  // We don't need to do anything here as the save functionality is now handled in the Header component
  const handleSave = () => {};

  return (
    <div className="flex flex-col min-h-screen">
      <Header onCalculate={handleCalculate} onSave={handleSave} />
      <ResizablePanelGroup className="flex w-full flex-1" direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <DataSidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <MainContent onExport={onExport} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <ResultsSidebar />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default SidebarLayout;
