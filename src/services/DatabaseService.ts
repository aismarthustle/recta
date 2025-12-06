import { ProjectData } from '@/types';

// Use IndexedDB for browser storage instead of SQLite
class BrowserDatabaseService {
  private db: IDBDatabase | null = null;
  private dbName = 'coupe-optimale-maroc';
  private storeName = 'projects';
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDatabase();
  }

  private initDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        console.error('Error opening database:', event);
        reject(new Error('Could not open database'));
      };

      request.onsuccess = (event) => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;

        // Create object store for projects
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  // Get all projects
  async getAllProjects(): Promise<{ id: number; name: string; createdAt: string; updatedAt: string }[]> {
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.index('updatedAt').openCursor(null, 'prev');

      const projects: { id: number; name: string; createdAt: string; updatedAt: string }[] = [];

      request.onsuccess = (event) => {
        const cursor = request.result;

        if (cursor) {
          const project = cursor.value;
          projects.push({
            id: project.id,
            name: project.name,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt
          });

          cursor.continue();
        } else {
          resolve(projects);
        }
      };

      request.onerror = (event) => {
        reject(new Error('Failed to get projects'));
      };
    });
  }

  // Get a project by ID
  async getProjectById(id: number): Promise<ProjectData | null> {
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = (event) => {
        if (request.result) {
          resolve(request.result);
        } else {
          resolve(null);
        }
      };

      request.onerror = (event) => {
        reject(new Error('Failed to get project'));
      };
    });
  }

  // Save a new project
  async saveProject(project: ProjectData): Promise<number> {
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Ensure dates are set
      const now = new Date().toISOString();
      project.createdAt = now;
      project.updatedAt = now;

      const request = store.add(project);

      request.onsuccess = (event) => {
        resolve(request.result as number);
      };

      request.onerror = (event) => {
        reject(new Error('Failed to save project'));
      };
    });
  }

  // Update an existing project
  async updateProject(id: number, project: ProjectData): Promise<boolean> {
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Update the updatedAt timestamp
      project.updatedAt = new Date().toISOString();
      project.id = id; // Ensure ID is set

      const request = store.put(project);

      request.onsuccess = (event) => {
        resolve(true);
      };

      request.onerror = (event) => {
        reject(new Error('Failed to update project'));
      };
    });
  }

  // Delete a project
  async deleteProject(id: number): Promise<boolean> {
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = (event) => {
        resolve(true);
      };

      request.onerror = (event) => {
        reject(new Error('Failed to delete project'));
      };
    });
  }
}

// Create a singleton instance
const databaseService = new BrowserDatabaseService();

export default databaseService;
