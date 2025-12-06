
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

async function migrateDatabase() {
    try {
        console.log('Starting migration...');

        // 1. Update users table
        console.log('Updating users table...');
        await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free'
    `;

        // 2. Update projects table
        console.log('Updating projects table...');
        await sql`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
    `;

        // 3. Update existing admin user if exists (set role to admin)
        console.log('Updating admin user...');
        await sql`
      UPDATE users SET role = 'admin', plan = 'enterprise' WHERE username = 'admin'
    `;

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

migrateDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
