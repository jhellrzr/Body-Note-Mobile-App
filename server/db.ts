import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

neonConfig.webSocketConstructor = ws;

// Initialize database connection with proper error handling and retries
async function initDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }

  console.log('Initializing database connection...');

  // Configure pool with better defaults for production
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    maxUses: 7500 // Close a connection after it has been used 7500 times
  });

  // Test connection with retries
  let lastError;
  for (let i = 0; i < 5; i++) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT NOW()');
        console.log('Database connection test successful:', result.rows[0]);
        break;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      lastError = error;
      if (i < 4) { // Don't wait on the last iteration
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }

  if (lastError) {
    throw new Error(`Failed to establish database connection after 5 attempts: ${lastError.message}`);
  }

  const db = drizzle(pool, { schema });

  // Run migrations in production
  if (process.env.NODE_ENV === 'production') {
    console.log('Running database migrations...');
    try {
      await migrate(db, { migrationsFolder: './migrations' });
      console.log('Database migrations completed successfully');
    } catch (error) {
      console.error('Migration error:', error);
      // Continue even if migrations fail - the schema might already be up to date
    }
  }

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
  }, 30000);

  return { pool, db };
}

// Initialize database connection
let pool: Pool;
let db: ReturnType<typeof drizzle>;

initDb().then(({ pool: p, db: d }) => {
  pool = p;
  db = d;
  console.log('Database initialized successfully');
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1); // Exit if we can't connect to the database
});

export { pool, db };