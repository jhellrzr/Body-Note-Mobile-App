import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Required for Neon serverless driver
neonConfig.webSocketConstructor = ws;

// Simple database connection with retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function connectWithRetry(retries = MAX_RETRIES): Promise<{ pool: Pool; db: ReturnType<typeof drizzle> }> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }

    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000
    });

    // Test the connection
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      console.log('Database connection successful:', result.rows[0]);
    } finally {
      client.release();
    }

    const db = drizzle(pool, { schema });
    return { pool, db };
  } catch (error) {
    if (retries > 0) {
      console.log(`Database connection failed, retrying... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retries - 1);
    }
    throw error;
  }
}

// Initialize database connection
export const { pool, db } = await connectWithRetry().catch(error => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

// Periodic health check
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    console.error('Database health check failed:', error);
  }
}, 30000);