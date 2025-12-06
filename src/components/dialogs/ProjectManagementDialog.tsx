import React, { useState, useEffect, useRef } from 'react';
import { useOptimization } from '@/contexts/OptimizationContext';
import storageService from '@/services/StorageService';
import { ProjectData } from '@/types';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Folder, Save, Trash2, FileEdit, Download, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'save' | 'load';
}

const ProjectManagementDialog: React.FC<ProjectManagementDialogProps> = ({
  open,
  onOpenChange,
  mode
}) => {
  const {
    panels,
    stockSheets,
    options,
    result,
    loadProject,
    currentProjectId,
    projectName: currentProjectName,
    setProjectName: setCurrentProjectName
  } = useOptimization();

  const [projects, setProjects] = useState<{ id: number; name: string; createdAt: string; updatedAt: string }[]>([]);
  const [projectName, setProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set the project name input field when dialog opens in save mode
  useEffect(() => {
    if (open && mode === 'save') {
      setProjectName(currentProjectName || '');
    }
  }, [open, mode, currentProjectName]);

  // Load projects from database
  useEffect(() => {
    if (open) {
      refreshProjects();
    }
  }, [open]);

  const refreshProjects = async () => {
    setIsLoading(true);
    try {
      const allProjects = await storageService.getAllProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les projets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un nom de projet',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create project data object
      const projectData: ProjectData = {
        id: currentProjectId || undefined,
        name: projectName,
        panels,
        stockSheets,
        options,
        result: result || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // If we have a current project ID, update the existing project
      if (currentProjectId) {
        const success = await storageService.updateProject(currentProjectId, projectData);

        if (success) {
          toast({
            title: 'Succès',
            description: `Le projet "${projectName}" a été mis à jour`,
          });
        } else {
          throw new Error('Failed to update project');
        }
      } else {
        // Otherwise create a new project
        const newId = await storageService.saveProject(projectData);

        // Update the current project ID in the context
        setCurrentProjectName(projectName);
      }

      toast({
        title: 'Succès',
        description: `Le projet "${projectName}" a été enregistré`,
      });

      setProjectName('');
      await refreshProjects();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le projet',
        variant: 'destructive',
      });
    }
  };

  const handleLoadProject = async (id: number) => {
    try {
      const projectData = await storageService.getProjectById(id);

      if (projectData) {
        loadProject(projectData);
        onOpenChange(false);
      } else {
        toast({
          title: 'Erreur',
          description: 'Projet introuvable',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le projet',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async () => {
    if (selectedProjectId === null) return;

    try {
      const success = await storageService.deleteProject(selectedProjectId);

      if (success) {
        toast({
          title: 'Succès',
          description: 'Le projet a été supprimé',
        });
        await refreshProjects();
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le projet',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le projet',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedProjectId(null);
    }
  };

  const handleRenameProject = async () => {
    if (selectedProjectId === null || !newProjectName.trim()) return;

    try {
      const projectData = await storageService.getProjectById(selectedProjectId);

      if (projectData) {
        projectData.name = newProjectName;
        const success = await storageService.updateProject(selectedProjectId, projectData);

        if (success) {
          toast({
            title: 'Succès',
            description: 'Le projet a été renommé',
          });
          await refreshProjects();
        } else {
          toast({
            title: 'Erreur',
            description: 'Impossible de renommer le projet',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error renaming project:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de renommer le projet',
        variant: 'destructive',
      });
    } finally {
      setIsRenameDialogOpen(false);
      setSelectedProjectId(null);
      setNewProjectName('');
    }
  };

  const handleExportProjects = async () => {
    try {
      const projectsJson = await storageService.exportProjects();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(projectsJson);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', 'coupe-optimale-projets.json');
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      toast({
        title: 'Succès',
        description: 'Les projets ont été exportés',
      });
    } catch (error) {
      console.error('Error exporting projects:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter les projets',
        variant: 'destructive',
      });
    }
  };

  const handleImportProjects = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const success = await storageService.importProjects(content);

        if (success) {
          toast({
            title: 'Succès',
            description: 'Les projets ont été importés',
          });
          await refreshProjects();
        }
      } catch (error) {
        console.error('Error importing projects:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible d\'importer les projets. Vérifiez le format du fichier.',
          variant: 'destructive',
        });
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {mode === 'save' ? (
                currentProjectId ? 'Enregistrer sous un nouveau nom' : 'Enregistrer le projet'
              ) : 'Charger un projet'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'save'
                ? (currentProjectId
                   ? 'Enregistrez une copie de ce projet sous un nouveau nom.'
                   : 'Enregistrez votre projet actuel pour y revenir plus tard.')
                : 'Sélectionnez un projet à charger.'}
            </DialogDescription>
          </DialogHeader>

          {mode === 'save' && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectName" className="text-right">
                  Nom du projet
                </Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="col-span-3"
                  placeholder="Mon projet"
                />
              </div>
              {currentProjectId && (
                <div className="text-sm text-muted-foreground mt-2">
                  <p>Note: Ceci créera une nouvelle copie du projet. Pour enregistrer les modifications du projet actuel, utilisez le bouton "Save Project" dans l'en-tête.</p>
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
          ) : projects.length > 0 ? (
            <Table>
              <TableCaption>Liste des projets enregistrés</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Modifié le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{formatDate(project.createdAt)}</TableCell>
                    <TableCell>{formatDate(project.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {mode === 'load' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadProject(project.id)}
                          >
                            <Folder className="h-4 w-4 mr-1" />
                            Charger
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setNewProjectName(project.name);
                            setIsRenameDialogOpen(true);
                          }}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              Aucun projet enregistré
            </div>
          )}

          {/* <DialogFooter className="flex justify-between">
            <div>
              <Button variant="outline" onClick={handleExportProjects} className="mr-2">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" onClick={handleImportProjects}>
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
                aria-label="Importer des projets"
                title="Importer des projets"
              />
            </div>
            {mode === 'save' && (
              <Button onClick={handleSaveProject}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            )}
          </DialogFooter> */}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le projet sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <AlertDialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renommer le projet</AlertDialogTitle>
            <AlertDialogDescription>
              Entrez un nouveau nom pour ce projet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nouveau nom du projet"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRenameProject}>
              Renommer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectManagementDialog;
