import { ProjectData } from '@/types';
import { neon } from '@neondatabase/serverless';

class PostgresDatabaseService {
  private neonClient: ReturnType<typeof neon>;
  
  constructor() {
    // Initialize the Neon client
    this.neonClient = neon(process.env.coup_opt_DATABASE_URL || '');
  }

  /**
   * Get all projects (summary information)
   */
  async getAllProjects(): Promise<{ id: number; name: string; createdAt: string; updatedAt: string }[]> {
    try {
      const projects = await this.neonClient`
        SELECT id, name, created_at as "createdAt", updated_at as "updatedAt" 
        FROM projects 
        ORDER BY updated_at DESC
      `;
      return projects as { id: number; name: string; createdAt: string; updatedAt: string }[];
    } catch (error) {
      console.error('Error fetching projects from PostgreSQL:', error);
      throw error;
    }
  }
  
  /**
   * Get a project by ID
   */
  async getProjectById(id: number): Promise<ProjectData | null> {
    try {
      const result = await this.neonClient`
        SELECT * FROM projects WHERE id = ${id}
      ` as any[];
      
      if (!result || result.length === 0) {
        return null;
      }
      
      const project = result[0];
      
      // Parse JSON strings
      return {
        id: project.id,
        name: project.name,
        panels: JSON.parse(project.panels),
        stockSheets: JSON.parse(project.stock_sheets),
        options: JSON.parse(project.options),
        result: project.result ? JSON.parse(project.result) : undefined,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      };
    } catch (error) {
      console.error(`Error fetching project ${id} from PostgreSQL:`, error);
      throw error;
    }
  }
  
  /**
   * Save a new project
   */
  async saveProject(project: ProjectData): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      const result = await this.neonClient`
        INSERT INTO projects (name, panels, stock_sheets, options, result, created_at, updated_at)
        VALUES (${project.name}, ${JSON.stringify(project.panels)}, ${JSON.stringify(project.stockSheets)}, ${JSON.stringify(project.options)}, ${project.result ? JSON.stringify(project.result) : null}, ${now}, ${now})
        RETURNING id
      `;
      
      return result[0].id;
    } catch (error) {
      console.error('Error saving project to PostgreSQL:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing project
   */
  async updateProject(id: number, project: ProjectData): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      
      const result = await this.neonClient`
        UPDATE projects 
        SET name = ${project.name}, panels = ${JSON.stringify(project.panels)}, stock_sheets = ${JSON.stringify(project.stockSheets)}, options = ${JSON.stringify(project.options)}, result = ${project.result ? JSON.stringify(project.result) : null}, updated_at = ${now}
        WHERE id = ${id}
      `;
      
      return true;
    } catch (error) {
      console.error(`Error updating project ${id} in PostgreSQL:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<boolean> {
    try {
      await this.neonClient`
        DELETE FROM projects WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error(`Error deleting project ${id} from PostgreSQL:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const postgresDatabaseService = new PostgresDatabaseService();

export default postgresDatabaseService;
