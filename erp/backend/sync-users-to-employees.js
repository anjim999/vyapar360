// Sync users to employees table
import pool from './src/db/pool.js';

async function syncUsersToEmployees() {
    const client = await pool.connect();

    try {
        console.log('🔄 Syncing users to employees table...\n');

        await client.query('BEGIN');

        // Get all users with company
        const users = await client.query(`
            SELECT id, name, email, role, company_id, phone, created_at
            FROM users 
            WHERE company_id IS NOT NULL AND role != 'platform_admin'
        `);

        console.log(`Found ${users.rows.length} users to sync\n`);

        for (const user of users.rows) {
            // Check if employee record exists
            const existing = await client.query(
                'SELECT id FROM employees WHERE user_id = $1',
                [user.id]
            );

            if (existing.rows.length === 0) {
                // Create employee record
                const employee_id = `EMP${String(user.id).padStart(5, '0')}`;

                await client.query(
                    `INSERT INTO employees (
                        company_id, user_id, employee_id, name, email, phone, 
                        designation, status, date_of_joining, created_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, 1)`,
                    [
                        user.company_id,
                        user.id,
                        employee_id,
                        user.name,
                        user.email,
                        user.phone || null,
                        user.role.replace('_', ' ').toUpperCase(),
                        user.created_at || new Date()
                    ]
                );

                console.log(`✅ Created employee record for: ${user.name} (${user.email})`);
            } else {
                console.log(`⏭️  Employee record already exists for: ${user.name}`);
            }
        }

        await client.query('COMMIT');

        console.log('\n✅ Sync completed!\n');

        // Show result
        const result = await client.query('SELECT COUNT(*) as count FROM employees');
        console.log(`Total employees in database: ${result.rows[0].count}\n`);

        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

syncUsersToEmployees();
