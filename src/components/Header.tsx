
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOptimization } from "@/contexts/OptimizationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Factory, Save, Calculator, FolderOpen, FilePlus, User, LogOut } from "lucide-react";
import ProjectManagementDialog from "./dialogs/ProjectManagementDialog";
import { toast } from "@/components/ui/use-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onCalculate?: () => void;
  onSave?: () => void;
}

const Header = ({ onCalculate }: HeaderProps) => {
  const {
    isProcessing,
    resetProject,
    confirmAction,
    currentProjectId,
    projectName,
    hasUnsavedChanges,
    saveCurrentProject
  } = useOptimization();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectDialogMode, setProjectDialogMode] = useState<'save' | 'load'>('save');

  const handleOpenSaveDialog = async () => {
    // If we have a current project ID, save changes directly
    if (currentProjectId) {
      // If there are unsaved changes, confirm before saving
      if (hasUnsavedChanges) {
        confirmAction(
          async () => {
            await saveCurrentProject();
          },
          `Voulez-vous enregistrer les modifications apportées au projet "${projectName}" ?`
        );
      } else {
        // No changes to save
        toast({
          title: "Information",
          description: "Aucune modification à enregistrer.",
        });
      }
    } else {
      // No current project, open save dialog to create a new one
      setProjectDialogMode('save');
      setIsProjectDialogOpen(true);
    }
  };

  const handleOpenLoadDialog = () => {
    setProjectDialogMode('load');
    setIsProjectDialogOpen(true);
  };

  const handleNewProject = () => {
    console.log("handleNewProject clicked");
    resetProject();

    // If there are unsaved changes or a project is loaded, confirm before resetting
    // if (hasUnsavedChanges || currentProjectId) {
    //   console.log("Has unsaved changes or current project, showing confirmation");
    //   confirmAction(
    //     () => {
    //       console.log("Confirmation callback executing in handleNewProject");
    //       // Explicitly call the resetProject function to ensure it runs
    //       resetProject();
    //       console.log("resetProject called from confirmation callback");
    //     },
    //     "Vous allez créer un nouveau projet. Toutes les modifications non enregistrées seront perdues. Voulez-vous continuer ?"
    //   );
    // } else {
    //   console.log("No unsaved changes or current project, resetting immediately");
    //   // If no project is loaded and no unsaved changes, just reset
    //   resetProject();
    //   console.log("resetProject called directly");
    // }
  };

  return (
    <header className="metal-bg-dark text-white p-1 border-b border-gray-600 flex justify-between items-center w-full text-xs">
      <div className="flex items-center">
        <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
          <img
            src="/logo.png"
            alt="Recta"
            className="h-6 w-6 mr-2"
          />
          <span className="font-bold text-lg mr-2">Recta</span>
        </Link>
        <Factory className="h-3 w-3 text-industrial-blue ml-1" />
        <span className="font-mono text-[9px] ml-1 text-gray-400">v1.2.0</span>

        {/* Display current project name */}
        <div className="ml-4 border-l border-gray-600 pl-4 flex items-center">
          <span className="text-gray-400 text-[10px] mr-1">Projet:</span>
          <span className="text-white text-[10px] font-medium">
            {projectName || "Untitled"}
            {hasUnsavedChanges && <span className="text-yellow-400 ml-1">*</span>}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-700 text-white hover:bg-gray-600 border-gray-500 industrial-btn h-6 text-[10px] px-2 py-0.5"
          onClick={handleNewProject}>
          <FilePlus size={10} className="mr-1" />
          Nouveau Projet
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-700 text-white hover:bg-gray-600 border-gray-500 industrial-btn h-6 text-[10px] px-2 py-0.5"
          onClick={handleOpenSaveDialog}>
          <Save size={10} className="mr-1" />
          Enregistrer Projet
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-700 text-white hover:bg-gray-600 border-gray-500 industrial-btn h-6 text-[10px] px-2 py-0.5"
          onClick={handleOpenLoadDialog}>
          <FolderOpen size={10} className="mr-1" />
          Charger Projet
        </Button>
        <Button
          size="sm"
          className="bg-industrial-blue hover:bg-industrial-blue/80 text-white industrial-btn h-6 text-[10px] px-2 py-0.5"
          onClick={onCalculate}
          disabled={isProcessing}>
          <Calculator size={10} className="mr-1" />
          Calculer Optimisation
        </Button>

        {/* User account dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-700 text-white hover:bg-gray-600 border-gray-500 industrial-btn h-6 text-[10px] px-2 py-0.5 ml-2">
              <User size={10} className="mr-1" />
              {user?.username || 'Compte'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/account')}>
              <User size={14} className="mr-2" />
              Gérer Compte
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              signOut();
              navigate('/signin');
            }}>
              <LogOut size={14} className="mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProjectManagementDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        mode={projectDialogMode}
      />
    </header>
  );
};

export default Header;
