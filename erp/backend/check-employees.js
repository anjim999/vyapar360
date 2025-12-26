// Check employees in database
import pool from './src/db/pool.js';

async function checkEmployees() {
    try {
        console.log('📊 Checking employees...\n');

        // Check users table
        const users = await pool.query('SELECT id, name, email, role, company_id FROM users WHERE company_id IS NOT NULL');
        console.log(`✅ Found ${users.rows.length} users with company:\n`);
        users.rows.forEach(u => {
            console.log(`  - ${u.name} (${u.email}) - Role: ${u.role} - Company: ${u.company_id}`);
        });

        console.log('\n📋 Checking employees table...\n');

        // Check employees table
        const employees = await pool.query(`
            SELECT e.*, u.name as user_name, u.email as user_email, d.name as dept_name
            FROM employees e
            LEFT JOIN users u ON e.user_id = u.id
            LEFT JOIN departments d ON e.department_id = d.id
        `);

        console.log(`✅ Found ${employees.rows.length} employee records:\n`);
        employees.rows.forEach(emp => {
            console.log(`  - ${emp.name} (${emp.email}) - Dept: ${emp.dept_name || 'None'} - User ID: ${emp.user_id}`);
        });

        // Check departments
        console.log('\n🏢 Checking departments...\n');
        const depts = await pool.query('SELECT * FROM departments');
        console.log(`✅ Found ${depts.rows.length} departments:\n`);
        depts.rows.forEach(d => {
            console.log(`  - ${d.name} (Company: ${d.company_id})`);
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkEmployees();
