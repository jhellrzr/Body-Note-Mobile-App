import { neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from '@neondatabase/serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

console.log('Initializing database connection...');

// Create SQL client
const queryClient = sql.neon(process.env.DATABASE_URL);

try {
  // Test connection
  queryClient`SELECT NOW()`.then(testResult => {
    console.log('Database connection test successful:', testResult);
  }).catch(error => {
    console.error('Database connection test failed:', error);
  });

  // Create Drizzle instance
  const _db = drizzle(queryClient, { schema });

} catch (error) {
  console.error('Database initialization error:', error);
  throw error;
}

export const db = _db;