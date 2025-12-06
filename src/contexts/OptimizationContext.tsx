
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo
} from "react";
import {
  Panel,
  StockSheet,
  CutOptions,
  OptimizationResult,
  ProjectData
} from "@/types";
import { optimizeCutting } from "@/utils/optimizationAlgorithm";
import { toast } from "@/components/ui/use-toast";
import storageService from "@/services/StorageService";
import { resetPanelColorMap } from "@/utils/gradientUtils";

interface OptimizationContextType {
  panels: Panel[];
  setPanels: (panels: Panel[]) => void;
  stockSheets: StockSheet[];
  setStockSheets: (stockSheets: StockSheet[]) => void;
  options: CutOptions;
  setOptions: (options: CutOptions) => void;
  result: OptimizationResult | null;
  setResult: (result: OptimizationResult | null) => void;
  calculateOptimization: () => void;
  isProcessing: boolean;
  resetProject: () => void;
  saveProject: () => ProjectData;
  saveCurrentProject: () => Promise<boolean>;
  loadProject: (projectData: ProjectData) => void;
  currentProjectId: number | null;
  hasUnsavedChanges: boolean;
  projectName: string;
  setProjectName: (name: string) => void;
  confirmAction: (action: () => void, message: string) => void;
}

const defaultOptions: CutOptions = {
  kerfThickness: 3,
  allowRotation: true,
  prioritizeMinimalWaste: true,
  prioritizeMinimalCuts: false,
  considerGrainDirection: false,
  edgeBanding: false,
  edgeBandingThickness: 0.5,
  useOnlyOneSheetType: false,
};

const OptimizationContext = createContext<OptimizationContextType | undefined>(undefined);

export const OptimizationProvider = ({ children }: { children: ReactNode }) => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [stockSheets, setStockSheets] = useState<StockSheet[]>([]);
  const [options, setOptions] = useState<CutOptions>(defaultOptions);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [initialState, setInitialState] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const calculateOptimization = useCallback(() => {
    if (panels.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un panneau",
        variant: "destructive",
      });
      return;
    }

    if (stockSheets.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins une feuille de stock",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate processing time to show user that calculation is happening
    setTimeout(() => {
      try {
        const optimizationResult = optimizeCutting(panels, stockSheets, options);
        setResult(optimizationResult);

        if (optimizationResult.cutPlans.length === 0) {
          toast({
            title: "Avertissement",
            description: "Impossible de placer tous les panneaux. Révisez vos dimensions ou ajoutez plus de feuilles de stock.",
            variant: "destructive",
          });
        } else if (optimizationResult.additionalSheetsNeeded > 0) {
          toast({
            title: "Plaques supplémentaires nécessaires",
            description: `Vous avez besoin de ${optimizationResult.additionalSheetsNeeded} plaques supplémentaires pour toutes les découpes. Consultez les détails dans le panneau des résultats.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Calcul terminé",
            description: `Optimisation complétée avec ${optimizationResult.wastedPercentage.toFixed(1)}% de perte`,
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'optimisation:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du calcul d'optimisation",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }, 800);
  }, [panels, stockSheets, options]);

  // Helper to calculate the current state hash for change detection
  const calculateStateHash = useCallback(() => {
    return JSON.stringify({
      panels,
      stockSheets,
      options,
      result
    });
  }, [panels, stockSheets, options, result]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    console.log("Checking hasUnsavedChanges");
    console.log("initialState:", initialState ? "exists" : "empty");

    if (!initialState) {
      console.log("initialState is empty, returning false");
      return false;
    }

    const currentState = calculateStateHash();
    const hasChanges = currentState !== initialState;

    console.log("Current state:", currentState.substring(0, 50) + "...");
    console.log("Initial state:", initialState.substring(0, 50) + "...");
    console.log("Has changes:", hasChanges);

    return hasChanges;
  }, [initialState, calculateStateHash]);

  // Confirmation dialog for actions that might lose changes
  const confirmAction = useCallback((action: () => void, message: string) => {
    console.log("confirmAction called with message:", message);

    if (hasUnsavedChanges) {
      console.log("Has unsaved changes, showing dialog");
      setConfirmMessage(message);
      setPendingAction(() => action);
      setIsConfirmDialogOpen(true);
    } else {
      console.log("No unsaved changes, executing action immediately");
      action();
    }
  }, [hasUnsavedChanges]);

  const resetProject = useCallback(() => {
    console.log("resetProject function called");

    const doReset = () => {
      console.log("doReset function executing");

      // Reset all state variables
      setPanels([]);
      setStockSheets([]);
      setOptions(defaultOptions);
      setResult(null);
      setCurrentProjectId(null);
      setProjectName('');

      // Reset the panel color map for visualization
      resetPanelColorMap();

      // Reset the initial state to track changes from this clean state
      setTimeout(() => {
        setInitialState(calculateStateHash());
      }, 0);

      toast({
        title: "Projet réinitialisé",
        description: "Toutes les données ont été effacées",
      });

      console.log("Project reset completed");
    };

    // Only show confirmation if there are unsaved changes
    if (hasUnsavedChanges) {
      console.log("Has unsaved changes, showing confirmation dialog");
      confirmAction(
        doReset,
        "Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir réinitialiser le projet ?"
      );
    } else {
      console.log("No unsaved changes, resetting immediately");
      doReset();
    }
  }, [hasUnsavedChanges, confirmAction, calculateStateHash]);

  const saveProject = useCallback(() => {
    // This function returns the current project data
    // The actual saving to the database is handled by the ProjectManagementDialog
    const projectData: ProjectData = {
      id: currentProjectId || undefined,
      panels,
      stockSheets,
      options,
      result,
      name: projectName || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update the initial state after saving
    setInitialState(calculateStateHash());

    return projectData;
  }, [panels, stockSheets, options, result, currentProjectId, projectName, calculateStateHash]);

  // Direct save method for existing projects
  const saveCurrentProject = useCallback(async (): Promise<boolean> => {
    // If no current project ID, we can't save directly
    if (!currentProjectId) {
      toast({
        title: "Information",
        description: "Ce projet n'a pas encore été enregistré. Veuillez lui donner un nom.",
      });
      return false;
    }

    // If no project name, prompt the user
    if (!projectName.trim()) {
      toast({
        title: "Erreur",
        description: "Le projet doit avoir un nom",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Create project data object
      const projectData: ProjectData = {
        id: currentProjectId,
        name: projectName,
        panels,
        stockSheets,
        options,
        result,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update the existing project
      const success = await storageService.updateProject(currentProjectId, projectData);

      if (success) {
        // Update the initial state to reflect that changes are saved
        setInitialState(calculateStateHash());

        toast({
          title: 'Succès',
          description: `Le projet "${projectName}" a été mis à jour`,
        });
        return true;
      } else {
        throw new Error('Failed to update project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le projet',
        variant: 'destructive',
      });
      return false;
    }
  }, [currentProjectId, projectName, panels, stockSheets, options, result, calculateStateHash]);

  const loadProject = useCallback((projectData: ProjectData) => {
    const doLoad = () => {
      setPanels(projectData.panels || []);
      setStockSheets(projectData.stockSheets || []);
      setOptions(projectData.options || defaultOptions);
      setResult(projectData.result || null);
      setCurrentProjectId(projectData.id || null);
      setProjectName(projectData.name || '');

      // Set initial state to track changes
      setTimeout(() => {
        setInitialState(calculateStateHash());
      }, 0);

      toast({
        title: "Projet chargé",
        description: `Le projet "${projectData.name}" a été chargé avec succès`,
      });
    };

    if (hasUnsavedChanges) {
      confirmAction(
        doLoad,
        "Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir charger un autre projet ?"
      );
    } else {
      doLoad();
    }
  }, [hasUnsavedChanges, confirmAction, calculateStateHash]);

  // Add a confirmation dialog component
  const handleConfirmAction = () => {
    console.log("Confirmation dialog: User clicked Continue");
    if (pendingAction) {
      console.log("Executing pending action");
      pendingAction();
      setPendingAction(null);
    } else {
      console.log("No pending action to execute");
    }
    setIsConfirmDialogOpen(false);
  };

  const handleCancelAction = () => {
    console.log("Confirmation dialog: User clicked Cancel");
    setPendingAction(null);
    setIsConfirmDialogOpen(false);
  };

  // Create a context data object for PDF export
  const contextData = {
    panels,
    stockSheets,
    options,
    result
  };

  return (
    <OptimizationContext.Provider
      value={{
        panels,
        setPanels,
        stockSheets,
        setStockSheets,
        options,
        setOptions,
        result,
        setResult,
        calculateOptimization,
        isProcessing,
        resetProject,
        saveProject,
        saveCurrentProject,
        loadProject,
        currentProjectId,
        hasUnsavedChanges,
        projectName,
        setProjectName,
        confirmAction
      }}
    >
      {/* Hidden element with context data for PDF export */}
      <div
        id="optimization-context-data"
        data-context={JSON.stringify(contextData)}
        style={{ display: 'none' }}
      />

      {/* Confirmation Dialog */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirmation</h3>
            <p className="mb-6">{confirmMessage}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={handleCancelAction}
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleConfirmAction}
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </OptimizationContext.Provider>
  );
};

export const useOptimization = () => {
  const context = useContext(OptimizationContext);
  if (context === undefined) {
    throw new Error("useOptimization must be used within an OptimizationProvider");
  }
  return context;
};
