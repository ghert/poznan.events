import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Use the POOLED connection string from Neon (the one with "-pooler" in the host).
const client = neon(process.env.DATABASE_URL!);

export const db = drizzle(client);
