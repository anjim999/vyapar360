// Run Teams Chat Migration
import pool from './src/db/pool.js';
import fs from 'fs';

async function runMigration() {
    try {
        console.log('🔄 Running Teams Chat migration...');

        const sql = fs.readFileSync('./src/db/migrations/008_create_teams_chat.sql', 'utf8');
        await pool.query(sql);

        console.log('✅ Migration completed successfully!');

        // Auto-create teams from existing departments
        console.log('🔄 Auto-creating teams from departments...');
        const depts = await pool.query('SELECT * FROM departments');

        for (const dept of depts.rows) {
            // Check if team already exists
            const existing = await pool.query(
                'SELECT id FROM teams WHERE company_id = $1 AND name = $2',
                [dept.company_id, dept.name]
            );

            if (existing.rows.length === 0) {
                const teamResult = await pool.query(
                    `INSERT INTO teams (company_id, name, description, type, created_by)
                     VALUES ($1, $2, $3, 'department', 1)
                     RETURNING id`,
                    [dept.company_id, dept.name, `${dept.name} department team`]
                );

                console.log(`✅ Created team: ${dept.name}`);

                // Add all department employees as team members
                const employees = await pool.query(
                    'SELECT user_id FROM employees WHERE department_id = $1 AND user_id IS NOT NULL',
                    [dept.id]
                );

                for (const emp of employees.rows) {
                    await pool.query(
                        'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [teamResult.rows[0].id, emp.user_id]
                    );
                }

                console.log(`✅ Added ${employees.rows.length} members to ${dept.name}`);
            }
        }

        console.log('✅ All done!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

runMigration();
