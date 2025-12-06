import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize the Neon client
const sql = neon(process.env.coup_opt_DATABASE_URL);

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'marostone-secret-key';

// Middleware to verify JWT token
const verifyToken = (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return null;
    }
    
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify token
    const decoded = verifyToken(req);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Find the user
    const users = await sql`
      SELECT * FROM users WHERE id = ${decoded.id}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    const now = new Date();
    
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}, updated_at = ${now}
      WHERE id = ${decoded.id}
    `;

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
