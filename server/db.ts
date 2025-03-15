import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

// Configure neon to use websockets
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true; // Force secure WebSocket in production
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = true;

// Function to initialize database connection
async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  try {
    console.log('Initializing database connection...');
    console.log('Environment:', process.env.NODE_ENV);

    // Use SSL in production
    const connectionOptions = process.env.NODE_ENV === 'production' 
      ? { 
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false, // Required for some cloud platforms
            sslmode: 'require'
          }
        }
      : { 
          connectionString: process.env.DATABASE_URL 
        };

    const pool = new Pool(connectionOptions);
    const db = drizzle(pool, { schema });

    // Test the connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('Database connection test successful:', testResult.rows[0]);

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

    // Verify tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Available tables:', tables.rows.map(r => r.table_name));

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