import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

// Initialize the Neon client
const sql = neon(process.env.coup_opt_DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'marostone-secret-key';

// Middleware to authenticate user
const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default async function handler(req, res) {
  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await getProjects(req, res, user.id);
    case 'POST':
      return await createProject(req, res, user.id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get all projects for the authenticated user
async function getProjects(req, res, userId) {
  try {
    const projects = await sql`
      SELECT id, name, created_at as "createdAt", updated_at as "updatedAt" 
      FROM projects 
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;

    return res.status(200).json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    return res.status(500).json({ error: 'Failed to get projects' });
  }
}

// Create a new project for the authenticated user
async function createProject(req, res, userId) {
  try {
    const project = req.body;
    const now = new Date();

    const result = await sql`
      INSERT INTO projects (user_id, name, panels, stock_sheets, options, result, created_at, updated_at)
      VALUES (
        ${userId},
        ${project.name},
        ${JSON.stringify(project.panels)},
        ${JSON.stringify(project.stockSheets)},
        ${JSON.stringify(project.options)},
        ${project.result ? JSON.stringify(project.result) : null},
        ${now},
        ${now}
      )
      RETURNING id
    `;

    return res.status(201).json({ id: result[0].id });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
}
