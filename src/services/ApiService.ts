import { ProjectData } from '@/types';

const API_URL = 'http://localhost:3001/api';

class ApiService {
  /**
   * Get all projects (summary information)
   */
  async getAllProjects(): Promise<{ id: number; name: string; createdAt: string; updatedAt: string }[]> {
    try {
      const response = await fetch(`${API_URL}/projects`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
  
  /**
   * Get a project by ID
   */
  async getProjectById(id: number): Promise<ProjectData | null> {
    try {
      const response = await fetch(`${API_URL}/projects/${id}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Save a new project
   */
  async saveProject(project: ProjectData): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing project
   */
  async updateProject(id: number, project: ProjectData): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;
