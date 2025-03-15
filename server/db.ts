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
    console.log('Initializing database connection...');
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      maxUses: 7500, // Close a connection after it has been used 7500 times
    });

    // Test the connection with retry logic
    let retries = 5;
    while (retries > 0) {
      try {
        const client = await pool.connect();
        try {
          const result = await client.query('SELECT NOW()');
          console.log('Database connection successful:', result.rows[0]);
          break;
        } finally {
          client.release();
        }
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        console.log(`Connection attempt failed. ${retries} retries remaining...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    }

    const db = drizzle(pool, { schema });

    // Run migrations if in production environment
    if (process.env.NODE_ENV === 'production') {
      console.log('Running database migrations in production...');
      try {
        await migrate(db, { migrationsFolder: './migrations' });
        console.log('Database migrations completed successfully');
      } catch (migrateError) {
        console.error('Migration error:', migrateError);
        // Don't throw here - if migrations fail, we might still want to run the app
        // with existing schema
      }
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

(async () => {
  try {
    const init = await initializeDatabase();
    pool = init.pool;
    db = init.db;
    console.log('Database initialization completed successfully');

    // Setup periodic health check
    setInterval(async () => {
      try {
        const client = await pool.connect();
        try {
          await client.query('SELECT 1');
        } finally {
          client.release();
        }
      } catch (error) {
        console.error('Database health check failed:', error);
      }
    }, 30000); // Check every 30 seconds

  } catch (error) {
    console.error('Failed to initialize database. Application may not work correctly:', error);
    // Create dummy objects that will throw appropriate errors when used
    pool = new Pool({ connectionString: '' });
    db = drizzle(pool, { schema });
  }
})();

export { pool, db };