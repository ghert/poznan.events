import { neon } from '@neondatabase/serverless';

// Use the POOLED connection string from Neon (the one with "-pooler" in the host).
export const sql = neon(process.env.DATABASE_URL!);
