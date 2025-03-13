import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

neonConfig.webSocketConstructor = ws;

// Function to initialize database connection
async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    // Run migrations
    console.log('Running database migrations...');
    try {
      await migrate(db, { migrationsFolder: './migrations' });
      console.log('Database migrations completed successfully');
    } catch (migrateError) {
      console.error('Migration error:', migrateError);
      // Don't throw here - if migrations fail, we might still want to run the app
      // with existing schema
    }

    return { pool, db };
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Initialize database and export connection
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  const init = await initializeDatabase();
  pool = init.pool;
  db = init.db;
} catch (error) {
  console.error('Failed to initialize database. Application may not work correctly:', error);
  // Create dummy objects that will throw appropriate errors when used
  pool = new Pool({ connectionString: '' });
  db = drizzle(pool, { schema });
}

export { pool, db };