
import React from 'react';
import OptimizationResults from '@/components/OptimizationResults';

const ResultsSidebar: React.FC = () => {
  return (
    <div className="h-full bg-gray-100 overflow-y-auto">
      <OptimizationResults />
    </div>
  );
};

export default ResultsSidebar;
