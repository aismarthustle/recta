import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.coup_opt_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Database URL not found in environment variables');
  process.exit(1);
}

// Initialize the Neon client
const sql = neon(DATABASE_URL);

async function initializeUsersTable() {
  try {
    console.log('Creating users table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `;
    
    // Check if admin user already exists
    const existingAdmin = await sql`SELECT id FROM users WHERE username = 'admin'`;
    
    if (existingAdmin.length === 0) {
      console.log('Creating default admin user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Marostone@2025', salt);
      
      const now = new Date();
      
      // Create the admin user
      await sql`
        INSERT INTO users (username, password, created_at, updated_at)
        VALUES ('admin', ${hashedPassword}, ${now}, ${now})
      `;
      
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    console.log('Users table initialized successfully');
  } catch (error) {
    console.error('Error initializing users table:', error);
  }
}

// Run the initialization
initializeUsersTable()
  .then(() => {
    console.log('Users table initialization complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Users table initialization failed:', error);
    process.exit(1);
  });
