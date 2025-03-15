import { neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

console.log('Initializing database connection...');

// Create Pool instance with proper configuration
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true 
});

// Export database instance
export const db = drizzle(pool, { schema });

// Test connection and log available tables
pool.query('SELECT NOW()')
  .then(() => {
    console.log('Database connection successful');
    // List tables
    return pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
  })
  .then(tables => {
    console.log('Available tables:', tables.rows.map(r => r.table_name));
  })
  .catch(error => {
    console.error('Database connection error:', error);
  });