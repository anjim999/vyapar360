// Simplified Complete ERP Seed - Matching Actual Schema
import pool from './src/db/pool.js';

const companyId = 8;

async function seedERP() {
    const client = await pool.connect();

    try {
        console.log('🌱 Seeding ERP with Dummy Data...\n');

        await client.query('BEGIN');

        // ============================================
        // 1. DEPARTMENTS
        // ============================================
        console.log('🏢 Creating Departments...');
        const departments = [
            'Human Resources', 'Finance', 'Sales', 'Marketing', 'IT', 'Operations'
        ];

        const deptIds = {};
        for (const name of departments) {
            let result = await client.query(
                `SELECT id FROM departments WHERE company_id = $1 AND name = $2`,
                [companyId, name]
            );

            if (result.rows.length === 0) {
                result = await client.query(
                    `INSERT INTO departments (company_id, name) VALUES ($1, $2) RETURNING id`,
                    [companyId, name]
                );
                console.log(`  ✅ Created: ${name}`);
            } else {
                console.log(`  ⏭️  Exists: ${name}`);
            }
            deptIds[name] = result.rows[0].id;
        }

        // Assign employees to departments
        console.log('\n👥 Assigning Employees to Departments...');
        await client.query(`UPDATE employees SET department_id = $1 WHERE email = 'hr.manager@test.com'`, [deptIds['Human Resources']]);
        await client.query(`UPDATE employees SET department_id = $1 WHERE email IN ('finance.manager@test.com', 'accountant@test.com')`, [deptIds['Finance']]);
        await client.query(`UPDATE employees SET department_id = $1 WHERE email = 'sales.manager@test.com'`, [deptIds['Sales']]);
        await client.query(`UPDATE employees SET department_id = $1 WHERE email IN ('employee1@test.com', 'employee2@test.com', 'employee3@test.com')`, [deptIds['IT']]);
        console.log('  ✅ Employees assigned');

        // ============================================
        // 2. PROJECTS
        // ============================================
        console.log('\n📋 Creating Projects...');
        const projects = [
            { name: 'Website Redesign', description: 'Redesign company website', status: 'in_progress', budget: 50000 },
            { name: 'Mobile App', description: 'Develop mobile app', status: 'in_progress', budget: 100000 },
            { name: 'CRM Implementation', description: 'New CRM system', status: 'planning', budget: 75000 },
        ];

        for (const proj of projects) {
            const exists = await client.query(`SELECT id FROM projects WHERE company_id = $1 AND name = $2`, [companyId, proj.name]);
            if (exists.rows.length === 0) {
                await client.query(
                    `INSERT INTO projects (company_id, name, description, status, budget, start_date) VALUES ($1, $2, $3, $4, $5, NOW())`,
                    [companyId, proj.name, proj.description, proj.status, proj.budget]
                );
                console.log(`  ✅ ${proj.name}`);
            }
        }

        // ============================================
        // 3. CUSTOMERS
        // ============================================
        console.log('\n👔 Creating Customers...');
        const customers = [
            { name: 'Acme Corp', email: 'contact@acme.com', phone: '+1-555-0101' },
            { name: 'Tech Solutions', email: 'info@techsol.com', phone: '+1-555-0102' },
            { name: 'Global Enterprises', email: 'sales@global.com', phone: '+1-555-0103' },
        ];

        for (const cust of customers) {
            const exists = await client.query(`SELECT id FROM customers WHERE company_id = $1 AND email = $2`, [companyId, cust.email]);
            if (exists.rows.length === 0) {
                await client.query(
                    `INSERT INTO customers (company_id, name, email, phone) VALUES ($1, $2, $3, $4)`,
                    [companyId, cust.name, cust.email, cust.phone]
                );
                console.log(`  ✅ ${cust.name}`);
            }
        }

        // ============================================
        // 4. LEADS (CRM)
        // ============================================
        console.log('\n🎯 Creating CRM Leads...');
        const leads = [
            { name: 'Sarah Johnson', email: 'sarah@company.com', status: 'qualified' },
            { name: 'Michael Brown', email: 'mike@firm.com', status: 'contacted' },
            { name: 'Emily Davis', email: 'emily@startup.com', status: 'new' },
        ];

        for (const lead of leads) {
            const exists = await client.query(`SELECT id FROM leads WHERE company_id = $1 AND email = $2`, [companyId, lead.email]);
            if (exists.rows.length === 0) {
                await client.query(
                    `INSERT INTO leads (company_id, name, email, status) VALUES ($1, $2, $3, $4)`,
                    [companyId, lead.name, lead.email, lead.status]
                );
                console.log(`  ✅ ${lead.name}`);
            }
        }

        // ============================================
        // 5. HOLIDAYS
        // ============================================
        console.log('\n🎉 Creating Holidays...');
        const holidays = [
            { name: 'New Year', date: '2025-01-01' },
            { name: 'Republic Day', date: '2025-01-26' },
            { name: 'Independence Day', date: '2025-08-15' },
            { name: 'Diwali', date: '2025-10-20' },
            { name: 'Christmas', date: '2025-12-25' },
        ];

        for (const holiday of holidays) {
            const exists = await client.query(`SELECT id FROM holidays WHERE company_id = $1 AND date = $2`, [companyId, holiday.date]);
            if (exists.rows.length === 0) {
                await client.query(
                    `INSERT INTO holidays (company_id, name, date) VALUES ($1, $2, $3)`,
                    [companyId, holiday.name, holiday.date]
                );
                console.log(`  ✅ ${holiday.name}`);
            }
        }

        await client.query('COMMIT');

        console.log('\n✅ ============================================');
        console.log('🎉 ERP SEED DATA COMPLETE!');
        console.log('============================================\n');

        // Summary
        const deptCount = await client.query(`SELECT COUNT(*) FROM departments WHERE company_id = $1`, [companyId]);
        const empCount = await client.query(`SELECT COUNT(*) FROM employees WHERE company_id = $1`, [companyId]);
        const projCount = await client.query(`SELECT COUNT(*) FROM projects WHERE company_id = $1`, [companyId]);
        const custCount = await client.query(`SELECT COUNT(*) FROM customers WHERE company_id = $1`, [companyId]);
        const prodCount = await client.query(`SELECT COUNT(*) FROM products WHERE company_id = $1`, [companyId]);

        console.log('📊 Summary:');
        console.log(`   • Departments: ${deptCount.rows[0].count}`);
        console.log(`   • Employees: ${empCount.rows[0].count}`);
        console.log(`   • Projects: ${projCount.rows[0].count}`);
        console.log(`   • Customers: ${custCount.rows[0].count}`);
        console.log(`   • Products: ${prodCount.rows[0].count}\n`);

        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        client.release();
    }
}

seedERP();
