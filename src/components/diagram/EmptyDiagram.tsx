
const EmptyDiagram = () => {
  return (
    <div className="bg-white shadow-md rounded-md p-4 h-[500px] flex items-center justify-center">
      <p className="text-lg text-gray-500">
        Aucun plan de découpe disponible. Veuillez calculer un plan.
      </p>
    </div>
  );
};

export default EmptyDiagram;
