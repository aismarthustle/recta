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
      const sql = `
        SELECT id, name, created_at as "createdAt", updated_at as "updatedAt" 
        FROM projects 
        ORDER BY updated_at DESC
      `;
      
      const projects = await this.neonClient(sql);
      return projects;
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
      const sql = `
        SELECT * FROM projects WHERE id = $1
      `;
      
      const result = await this.neonClient(sql, [id]);
      
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
      
      const sql = `
        INSERT INTO projects (name, panels, stock_sheets, options, result, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      
      const result = await this.neonClient(sql, [
        project.name,
        JSON.stringify(project.panels),
        JSON.stringify(project.stockSheets),
        JSON.stringify(project.options),
        project.result ? JSON.stringify(project.result) : null,
        now,
        now
      ]);
      
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
      
      const sql = `
        UPDATE projects 
        SET name = $1, panels = $2, stock_sheets = $3, options = $4, result = $5, updated_at = $6
        WHERE id = $7
      `;
      
      const result = await this.neonClient(sql, [
        project.name,
        JSON.stringify(project.panels),
        JSON.stringify(project.stockSheets),
        JSON.stringify(project.options),
        project.result ? JSON.stringify(project.result) : null,
        now,
        id
      ]);
      
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
      const sql = `
        DELETE FROM projects WHERE id = $1
      `;
      
      await this.neonClient(sql, [id]);
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
