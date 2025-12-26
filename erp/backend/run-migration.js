// Run migration to add is_delivered column
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'vyapar360',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root'
});

async function runMigration() {
    try {
        const migrationSQL = fs.readFileSync(
            join(__dirname, 'src/db/migrations/012_add_is_delivered_to_messages.sql'),
            'utf8'
        );

        console.log('Running migration: Add is_delivered column...');
        await pool.query(migrationSQL);
        console.log('✅ Migration completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
