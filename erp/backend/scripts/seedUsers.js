// scripts/seedUsers.js - Create dummy users for testing
import pool from '../src/db/pool.js';
import bcrypt from 'bcryptjs';

const password = '192357';
const hashedPassword = await bcrypt.hash(password, 10);

const dummyUsers = [
    // Platform Admin (already exists, but let's ensure it)
    { email: 'admin@vyapar360.com', name: 'Platform Admin', role: 'platform_admin', companyId: null },

    // Company Admin
    { email: 'company.admin@test.com', name: 'Company Admin', role: 'company_admin', companyId: 1 },

    // HR Manager
    { email: 'hr.manager@test.com', name: 'HR Manager', role: 'hr_manager', companyId: 1 },

    // Finance Manager
    { email: 'finance.manager@test.com', name: 'Finance Manager', role: 'finance_manager', companyId: 1 },

    // Employee 1
    { email: 'employee1@test.com', name: 'John Doe', role: 'employee', companyId: 1 },

    // Employee 2
    { email: 'employee2@test.com', name: 'Jane Smith', role: 'employee', companyId: 1 },

    // Employee 3
    { email: 'employee3@test.com', name: 'Bob Johnson', role: 'employee', companyId: 1 },

    // Accountant
    { email: 'accountant@test.com', name: 'Alice Chen', role: 'accountant', companyId: 1 },

    // Sales Manager
    { email: 'sales.manager@test.com', name: 'Mike Ross', role: 'sales_manager', companyId: 1 },

    // Support Staff
    { email: 'support@test.com', name: 'Sarah Williams', role: 'support', companyId: 1 },
];

async function seedUsers() {
    console.log('🌱 Seeding dummy users...');
    console.log(`📧 All users will have password: ${password}`);

    try {
        // Check if company exists
        let companyResult = await pool.query(`SELECT id FROM companies WHERE email = $1`, ['company@test.com']);

        let companyId;
        if (companyResult.rows.length === 0) {
            // Create company
            companyResult = await pool.query(
                `INSERT INTO companies (name, slug, email, phone, address, city, state, country, industry)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING id`,
                ['Test Company', 'test-company', 'company@test.com', '1234567890', '123 Test St', 'Mumbai', 'Maharashtra', 'India', 'Technology']
            );
            companyId = companyResult.rows[0].id;
            console.log(`✅ Company created: ID ${companyId}`);
        } else {
            companyId = companyResult.rows[0].id;
            console.log(`✅ Company found: ID ${companyId}`);
        }

        // Create users
        for (const user of dummyUsers) {
            try {
                const result = await pool.query(
                    `INSERT INTO users (email, password, name, role, company_id)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (email) DO UPDATE 
                     SET password = EXCLUDED.password, name = EXCLUDED.name, role = EXCLUDED.role
                     RETURNING id, email, name, role`,
                    [user.email, hashedPassword, user.name, user.role, user.companyId === 1 ? companyId : null]
                );

                console.log(`✅ ${result.rows[0].role.padEnd(20)} | ${result.rows[0].email.padEnd(30)} | ${result.rows[0].name}`);
            } catch (err) {
                console.error(`❌ Error creating ${user.email}:`, err.message);
            }
        }

        console.log('\n✅ All users created successfully!');
        console.log(`\n🔑 Password for all users: ${password}`);
        console.log('\n📋 User List:');
        console.log('─'.repeat(80));
        dummyUsers.forEach(u => {
            console.log(`${u.role.padEnd(20)} | ${u.email.padEnd(30)} | ${u.name}`);
        });
        console.log('─'.repeat(80));

    } catch (err) {
        console.error('❌ Error seeding users:', err);
    } finally {
        await pool.end();
    }
}

seedUsers();
