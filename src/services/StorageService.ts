import { ProjectData } from '@/types';

/**
 * Service for managing project storage using Neon PostgreSQL database
 * with fallback to localStorage for offline support
 */
class StorageService {
  private readonly PROJECTS_KEY = 'coupe-optimale-maroc-projects';
  private readonly API_URL = '/api/projects';
  private isOnline: boolean = true;

  constructor() {
    // Check if we're online
    this.isOnline = typeof window !== 'undefined' && navigator.onLine;

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => { this.isOnline = true; });
      window.addEventListener('offline', () => { this.isOnline = false; });
    }

    // Migrate data from localStorage to database when online
    if (this.isOnline) {
      this.migrateLocalStorageToDatabase();
    }
  }

  /**
   * Migrate projects from localStorage to database
   */
  private async migrateLocalStorageToDatabase(): Promise<void> {
    try {
      const projectsJson = localStorage.getItem(this.PROJECTS_KEY);
      if (!projectsJson) return;

      const projects: ProjectData[] = JSON.parse(projectsJson);
      if (projects.length === 0) return;

      // For each project in localStorage, save it to the database
      for (const project of projects) {
        await this.saveProjectToDatabase(project);
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(this.PROJECTS_KEY);
      console.log('Successfully migrated projects from localStorage to database');
    } catch (error) {
      console.error('Error migrating projects from localStorage to database:', error);
    }
  }

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Get all projects
   */
  async getAllProjects(): Promise<{ id: number; name: string; createdAt: string; updatedAt: string }[]> {
    if (this.isOnline) {
      try {
        const response = await fetch(this.API_URL, {
          headers: this.getAuthHeader()
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching projects from API:', error);
        return this.getAllProjectsFromLocalStorage();
      }
    } else {
      return this.getAllProjectsFromLocalStorage();
    }
  }

  /**
   * Get all projects from localStorage (fallback)
   */
  private getAllProjectsFromLocalStorage(): { id: number; name: string; createdAt: string; updatedAt: string }[] {
    try {
      const projectsJson = localStorage.getItem(this.PROJECTS_KEY);
      if (!projectsJson) return [];

      const projects: ProjectData[] = JSON.parse(projectsJson);

      // Return only the summary information
      return projects.map(project => ({
        id: project.id!,
        name: project.name,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }));
    } catch (error) {
      console.error('Error getting projects from localStorage:', error);
      return [];
    }
  }

  /**
   * Get a project by ID
   */
  async getProjectById(id: number): Promise<ProjectData | null> {
    if (this.isOnline) {
      try {
        const response = await fetch(`${this.API_URL}/${id}`, {
          headers: this.getAuthHeader()
        });

        if (response.status === 404) {
          return null;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`Error fetching project ${id} from API:`, error);
        return this.getProjectByIdFromLocalStorage(id);
      }
    } else {
      return this.getProjectByIdFromLocalStorage(id);
    }
  }

  /**
   * Get a project by ID from localStorage (fallback)
   */
  private getProjectByIdFromLocalStorage(id: number): ProjectData | null {
    try {
      const projectsJson = localStorage.getItem(this.PROJECTS_KEY);
      if (!projectsJson) return null;

      const projects: ProjectData[] = JSON.parse(projectsJson);
      return projects.find(project => project.id === id) || null;
    } catch (error) {
      console.error(`Error getting project ${id} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Save a new project
   */
  async saveProject(project: ProjectData): Promise<number> {
    if (this.isOnline) {
      try {
        return await this.saveProjectToDatabase(project);
      } catch (error) {
        console.error('Error saving project to database:', error);
        return this.saveProjectToLocalStorage(project);
      }
    } else {
      return this.saveProjectToLocalStorage(project);
    }
  }

  /**
   * Save a project to the database
   */
  private async saveProjectToDatabase(project: ProjectData): Promise<number> {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(project),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.id;
  }

  /**
   * Save a project to localStorage (fallback)
   */
  private saveProjectToLocalStorage(project: ProjectData): number {
    try {
      const projectsJson = localStorage.getItem(this.PROJECTS_KEY);
      const projects: ProjectData[] = projectsJson ? JSON.parse(projectsJson) : [];

      // Generate a new ID
      const maxId = projects.reduce((max, p) => Math.max(max, p.id || 0), 0);
      const newId = maxId + 1;

      // Set the ID and timestamps
      const now = new Date().toISOString();
      const newProject: ProjectData = {
        ...project,
        id: newId,
        createdAt: now,
        updatedAt: now
      };

      // Add to the list and save
      projects.push(newProject);
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));

      return newId;
    } catch (error) {
      console.error('Error saving project to localStorage:', error);
      throw error;
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(id: number, project: ProjectData): Promise<boolean> {
    if (this.isOnline) {
      try {
        return await this.updateProjectInDatabase(id, project);
      } catch (error) {
        console.error(`Error updating project ${id} in database:`, error);
        return this.updateProjectInLocalStorage(id, project);
      }
    } else {
      return this.updateProjectInLocalStorage(id, project);
    }
  }

  /**
   * Update a project in the database
   */
  private async updateProjectInDatabase(id: number, project: ProjectData): Promise<boolean> {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(project),
    });

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return true;
  }

  /**
   * Update a project in localStorage (fallback)
   */
  private updateProjectInLocalStorage(id: number, project: ProjectData): boolean {
    try {
      const projectsJson = localStorage.getItem(this.PROJECTS_KEY);
      if (!projectsJson) return false;

      const projects: ProjectData[] = JSON.parse(projectsJson);
      const index = projects.findIndex(p => p.id === id);

      if (index === -1) return false;

      // Update the project
      const updatedProject: ProjectData = {
        ...project,
        id,
        createdAt: projects[index].createdAt,
        updatedAt: new Date().toISOString()
      };

      projects[index] = updatedProject;
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));

      return true;
    } catch (error) {
      console.error(`Error updating project ${id} in localStorage:`, error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<boolean> {
    if (this.isOnline) {
      try {
        return await this.deleteProjectFromDatabase(id);
      } catch (error) {
        console.error(`Error deleting project ${id} from database:`, error);
        return this.deleteProjectFromLocalStorage(id);
      }
    } else {
      return this.deleteProjectFromLocalStorage(id);
    }
  }

  /**
   * Delete a project from the database
   */
  private async deleteProjectFromDatabase(id: number): Promise<boolean> {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return true;
  }

  /**
   * Delete a project from localStorage (fallback)
   */
  private deleteProjectFromLocalStorage(id: number): boolean {
    try {
      const projectsJson = localStorage.getItem(this.PROJECTS_KEY);
      if (!projectsJson) return false;

      const projects: ProjectData[] = JSON.parse(projectsJson);
      const filteredProjects = projects.filter(p => p.id !== id);

      if (filteredProjects.length === projects.length) return false;

      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(filteredProjects));
      return true;
    } catch (error) {
      console.error(`Error deleting project ${id} from localStorage:`, error);
      throw error;
    }
  }

  /**
   * Export all projects to a JSON file
   */
  async exportProjects(): Promise<string> {
    if (this.isOnline) {
      try {
        const projects = await this.getAllProjects();
        const projectDetails = await Promise.all(
          projects.map(async (project) => {
            const details = await this.getProjectById(project.id);
            return details;
          })
        );

        return JSON.stringify(projectDetails.filter(Boolean));
      } catch (error) {
        console.error('Error exporting projects from database:', error);
        return this.exportProjectsFromLocalStorage();
      }
    } else {
      return this.exportProjectsFromLocalStorage();
    }
  }

  /**
   * Export projects from localStorage (fallback)
   */
  private exportProjectsFromLocalStorage(): string {
    try {
      const projectsJson = localStorage.getItem(this.PROJECTS_KEY);
      return projectsJson || '[]';
    } catch (error) {
      console.error('Error exporting projects from localStorage:', error);
      throw error;
    }
  }

  /**
   * Import projects from a JSON file
   */
  async importProjects(projectsJson: string): Promise<boolean> {
    try {
      // Validate the JSON
      const projects = JSON.parse(projectsJson);
      if (!Array.isArray(projects)) {
        throw new Error('Invalid projects data');
      }

      if (this.isOnline) {
        // Import to database
        for (const project of projects) {
          await this.saveProjectToDatabase(project);
        }
        return true;
      } else {
        // Import to localStorage
        localStorage.setItem(this.PROJECTS_KEY, projectsJson);
        return true;
      }
    } catch (error) {
      console.error('Error importing projects:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const storageService = new StorageService();

export default storageService;
