// Create customer test users
import pool from './src/db/pool.js';
import bcrypt from 'bcryptjs';

async function createCustomers() {
    try {
        const password = await bcrypt.hash('192357', 10);

        const customers = [
            { name: 'Alex Brown', email: 'customer1@test.com' },
            { name: 'Maria Garcia', email: 'customer2@test.com' }
        ];

        console.log('🛒 Creating customer accounts...\n');

        for (const cust of customers) {
            // Check if exists
            const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cust.email]);

            if (existing.rows.length === 0) {
                await pool.query(
                    `INSERT INTO users (name, email, password, role, is_active)
                     VALUES ($1, $2, $3, 'customer', true)`,
                    [cust.name, cust.email, password]
                );
                console.log(`✅ Created: ${cust.name} (${cust.email})`);
            } else {
                console.log(`⏭️  Exists: ${cust.name}`);
            }
        }

        console.log('\n✅ Customer accounts ready!');
        console.log('Login: customer1@test.com or customer2@test.com');
        console.log('Password: 192357\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

createCustomers();
