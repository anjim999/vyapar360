import pkg from "pg";
import { DATABASE_URL } from "./env.js";

const { Pool } = pkg;

// Config loaded by env.js

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Connection pool settings - production optimized
  max: 50, // Maximum connections (adjust based on DB limits)
  min: 5, // Keep 5 connections alive for faster response
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 20000, // Wait up to 20s for available connection
  // For Neon/Supabase serverless
  ssl: DATABASE_URL?.includes('neon') || DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
});

// Connection monitoring (helps diagnose production issues)
let connectionCount = 0;

// Test connection on startup
pool.on('connect', (client) => {
  connectionCount++;
  console.log(`✅ Database connected (Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount})`);
});

// Uncomment below to see every connection acquisition (verbose!)
// pool.on('acquire', () => {
//   console.log(`🔄 Connection acquired (Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount})`);
// });



pool.on('remove', () => {
  connectionCount--;
  console.log(`⚠️ Connection removed (Total: ${pool.totalCount}, Idle: ${pool.idleCount})`);
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected database error:', err.message);
  console.error('Pool status:', {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  });
});

// Log pool status every 30 seconds (helps catch leaks early)
setInterval(() => {
  if (pool.waitingCount > 0) {
    console.warn(`⚠️ ${pool.waitingCount} clients waiting for connection!`);
    console.warn(`Pool: Total=${pool.totalCount}, Idle=${pool.idleCount}, Waiting=${pool.waitingCount}`);
  }
}, 30000);

// Enhanced query function with auto-retry and timeout
export async function query(text, params, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      if (i === retries) throw error;
      if (error.message.includes('Connection terminated') || error.message.includes('timeout')) {
        console.warn(`Query failed (attempt ${i + 1}/${retries + 1}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        throw error;
      }
    }
  }
}

export default pool;

