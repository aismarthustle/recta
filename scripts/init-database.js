import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.coup_opt_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Database URL not found in environment variables');
  process.exit(1);
}

// Initialize the Neon client
const sql = neon(DATABASE_URL);

async function initializeDatabase() {
  try {
    console.log('Creating projects table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        panels JSONB NOT NULL,
        stock_sheets JSONB NOT NULL,
        options JSONB NOT NULL,
        result JSONB,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `;
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
