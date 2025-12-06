
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
        const { username, email, password, plan } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if user already exists
        const existingUsers = await sql`
      SELECT id FROM users WHERE username = ${username} OR email = ${email}
    `;

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const now = new Date();
        const userRole = 'user';
        const userPlan = plan || 'free';

        // Create user
        const result = await sql`
      INSERT INTO users (username, email, password, role, plan, created_at, updated_at)
      VALUES (${username}, ${email}, ${hashedPassword}, ${userRole}, ${userPlan}, ${now}, ${now})
      RETURNING id, username, email, role, plan
    `;

        const user = result[0];

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                plan: user.plan
            }
        });

    } catch (error) {
        console.error('Error during sign up:', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    }
}
