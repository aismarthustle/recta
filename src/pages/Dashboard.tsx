
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, CreditCard, Layout, Loader2, FileBox, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import storageService from "@/services/StorageService";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOptimization } from '@/contexts/OptimizationContext';

const Dashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { loadProject: loadIntoContext } = useOptimization();
    const [projects, setProjects] = useState<{ id: number; name: string; createdAt: string; updatedAt: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await storageService.getAllProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDeleteProject = async (id: number) => {
        try {
            const success = await storageService.deleteProject(id);
            if (success) {
                toast({ title: "Project deleted" });
                setProjects(projects.filter(p => p.id !== id));
            } else {
                toast({ title: "Failed to delete project", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error deleting project", variant: "destructive" });
        } finally {
            setProjectToDelete(null);
        }
    };

    const handleLoadProject = async (id: number) => {
        try {
            // Fetch full project data
            const projectData = await storageService.getProjectById(id);
            if (projectData) {
                loadIntoContext(projectData);
                navigate('/app');
            } else {
                toast({ title: "Error loading project", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error loading project:", error);
            toast({ title: "Error loading project", variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-muted/20">
            <header className="bg-background border-b h-16 flex items-center px-6">
                <div className="flex items-center gap-2 font-bold text-xl text-primary mr-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            R
                        </div>
                        Recta
                    </Link>
                </div>
                <nav className="flex items-center gap-6 hidden md:flex">
                    <Link to="/dashboard" className="text-foreground font-medium">Dashboard</Link>
                    <Link to="/app" className="text-muted-foreground hover:text-foreground">Editor</Link>
                    {user?.role === 'admin' && <Link to="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>}
                </nav>
                <div className="ml-auto flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">Welcome, {user?.username}</span>
                    <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/signin'); }}>Sign Out</Button>
                </div>
            </header>

            <main className="container py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <Button asChild>
                        <Link to="/app">
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Link>
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <Layout className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : projects.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{user?.plan || 'Free'}</div>
                            {/* <p className="text-xs text-muted-foreground">Renews on Jan 1, 2026</p> */}
                        </CardContent>
                    </Card>
                </div>

                <h2 className="text-xl font-semibold mb-4">My Projects</h2>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-background border-dashed">
                        <FileBox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-4">Start your first optimization project now.</p>
                        <Button asChild>
                            <Link to="/app">Create Project</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer group relative" onClick={() => handleLoadProject(project.id)}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setProjectToDelete(project.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-24 bg-muted/30 rounded flex items-center justify-center text-muted-foreground text-sm">
                                        Project Preview
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your project.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
};

export default Dashboard;
