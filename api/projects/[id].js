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
  const { id } = req.query;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await getProject(req, res, Number(id), user.id);
    case 'PUT':
      return await updateProject(req, res, Number(id), user.id);
    case 'DELETE':
      return await deleteProject(req, res, Number(id), user.id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get a project by ID and User ID
async function getProject(req, res, id, userId) {
  try {
    const result = await sql`
      SELECT * FROM projects WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = result[0];

    // Parse JSON fields and format response
    const formattedProject = {
      id: project.id,
      name: project.name,
      panels: typeof project.panels === 'string' ? JSON.parse(project.panels) : project.panels,
      stockSheets: typeof project.stock_sheets === 'string' ? JSON.parse(project.stock_sheets) : project.stock_sheets,
      options: typeof project.options === 'string' ? JSON.parse(project.options) : project.options,
      result: project.result ? (typeof project.result === 'string' ? JSON.parse(project.result) : project.result) : undefined,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    };

    return res.status(200).json(formattedProject);
  } catch (error) {
    console.error(`Error getting project ${id}:`, error);
    return res.status(500).json({ error: 'Failed to get project' });
  }
}

// Update a project
async function updateProject(req, res, id, userId) {
  try {
    const project = req.body;
    const now = new Date();

    const result = await sql`
      UPDATE projects
      SET
        name = ${project.name},
        panels = ${JSON.stringify(project.panels)},
        stock_sheets = ${JSON.stringify(project.stockSheets)},
        options = ${JSON.stringify(project.options)},
        result = ${project.result ? JSON.stringify(project.result) : null},
        updated_at = ${now}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
}

// Delete a project
async function deleteProject(req, res, id, userId) {
  try {
    const result = await sql`
      DELETE FROM projects WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}
