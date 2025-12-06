import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize the Neon client
const sql = neon(process.env.coup_opt_DATABASE_URL);

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'marostone-secret-key';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find the user
    const users = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Return token and user info (excluding password)
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email || '',
        role: user.role || 'user',
        plan: user.plan || 'free'
      }
    });
  } catch (error) {
    console.error('Error during sign in:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
