// Complete ERP Seed Data - All Modules
import pool from './src/db/pool.js';
import bcrypt from 'bcryptjs';

const companyId = 8; // Test Company ID
const password = '192357';
const hashedPassword = await bcrypt.hash(password, 10);

async function seedCompleteERP() {
    const client = await pool.connect();

    try {
        console.log('🌱 Seeding Complete ERP System with Dummy Data...\n');

        await client.query('BEGIN');

        // ============================================
        // 1. DEPARTMENTS
        // ============================================
        console.log('🏢 Creating Departments...');
        const departments = [
            { name: 'Human Resources', description: 'HR and recruitment' },
            { name: 'Finance', description: 'Accounting and finance' },
            { name: 'Sales', description: 'Sales and business development' },
            { name: 'Marketing', description: 'Marketing and promotions' },
            { name: 'IT', description: 'Information technology' },
            { name: 'Operations', description: 'Operations and logistics' },
        ];

        const deptIds = {};
        for (const dept of departments) {
            // Check if exists first
            let result = await client.query(
                `SELECT id FROM departments WHERE company_id = $1 AND name = $2`,
                [companyId, dept.name]
            );

            if (result.rows.length === 0) {
                result = await client.query(
                    `INSERT INTO departments (company_id, name, description)
                     VALUES ($1, $2, $3)
                     RETURNING id`,
                    [companyId, dept.name, dept.description]
                );
            }

            deptIds[dept.name] = result.rows[0].id;
            console.log(`  ✅ ${dept.name}`);
        }

        // Update employees with departments
        console.log('\n👥 Assigning employees to departments...');
        await client.query(
            `UPDATE employees SET department_id = $1 WHERE email = 'hr.manager@test.com'`,
            [deptIds['Human Resources']]
        );
        await client.query(
            `UPDATE employees SET department_id = $1 WHERE email IN ('finance.manager@test.com', 'accountant@test.com')`,
            [deptIds['Finance']]
        );
        await client.query(
            `UPDATE employees SET department_id = $1 WHERE email = 'sales.manager@test.com'`,
            [deptIds['Sales']]
        );
        await client.query(
            `UPDATE employees SET department_id = $1 WHERE email IN ('employee1@test.com', 'employee2@test.com')`,
            [deptIds['IT']]
        );
        console.log('  ✅ Employees assigned to departments');

        // ============================================
        // 2. PROJECTS
        // ============================================
        console.log('\n📋 Creating Projects...');
        const projects = [
            { name: 'Website Redesign', description: 'Redesign company website with modern UI', status: 'in_progress', budget: 50000, priority: 'high' },
            { name: 'Mobile App Development', description: 'Develop iOS and Android apps', status: 'in_progress', budget: 100000, priority: 'high' },
            { name: 'CRM Implementation', description: 'Implement new CRM system', status: 'planning', budget: 75000, priority: 'medium' },
            { name: 'Cloud Migration', description: 'Migrate infrastructure to cloud', status: 'completed', budget: 120000, priority: 'high' },
        ];

        const projectIds = [];
        for (const proj of projects) {
            const result = await client.query(
                `INSERT INTO projects (company_id, name, description, status, budget, priority, start_date, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '30 days', 1)
                 RETURNING id`,
                [companyId, proj.name, proj.description, proj.status, proj.budget, proj.priority]
            );
            projectIds.push(result.rows[0].id);
            console.log(`  ✅ ${proj.name}`);
        }

        // ============================================
        // 3. TASKS
        // ============================================
        console.log('\n✅ Creating Tasks...');
        const tasks = [
            { project: 0, title: 'Design homepage mockup', description: 'Create Figma designs', status: 'completed', priority: 'high', assignee: 10 },
            { project: 0, title: 'Develop frontend components', description: 'Build React components', status: 'in_progress', priority: 'high', assignee: 11 },
            { project: 0, title: 'Backend API integration', description: 'Connect frontend to API', status: 'todo', priority: 'medium', assignee: 12 },
            { project: 1, title: 'Setup React Native', description: 'Initialize mobile project', status: 'completed', priority: 'high', assignee: 10 },
            { project: 1, title: 'Design app screens', description: 'Create mobile UI designs', status: 'in_progress', priority: 'high', assignee: 11 },
        ];

        for (const task of tasks) {
            await client.query(
                `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date)
                 VALUES ($1, $2, $3, $4, $5, $6, 1, NOW() + INTERVAL '7 days')`,
                [projectIds[task.project], task.title, task.description, task.status, task.priority, task.assignee]
            );
        }
        console.log(`  ✅ Created ${tasks.length} tasks`);

        // ============================================
        // 4. FINANCE - ACCOUNTS
        // ============================================
        console.log('\n💰 Creating Chart of Accounts...');
        const accounts = [
            { code: '1000', name: 'Cash', type: 'asset', category: 'current_assets' },
            { code: '1100', name: 'Accounts Receivable', type: 'asset', category: 'current_assets' },
            { code: '2000', name: 'Accounts Payable', type: 'liability', category: 'current_liabilities' },
            { code: '3000', name: 'Owner Equity', type: 'equity', category: 'equity' },
            { code: '4000', name: 'Sales Revenue', type: 'revenue', category: 'operating_revenue' },
            { code: '5000', name: 'Cost of Goods Sold', type: 'expense', category: 'cost_of_sales' },
            { code: '6000', name: 'Salaries Expense', type: 'expense', category: 'operating_expenses' },
            { code: '6100', name: 'Rent Expense', type: 'expense', category: 'operating_expenses' },
        ];

        for (const acc of accounts) {
            await client.query(
                `INSERT INTO accounts (company_id, code, name, type, category, created_by)
                 VALUES ($1, $2, $3, $4, $5, 1)
                 ON CONFLICT (company_id, code) DO NOTHING`,
                [companyId, acc.code, acc.name, acc.type, acc.category]
            );
        }
        console.log(`  ✅ Created ${accounts.length} accounts`);

        // ============================================
        // 5. CUSTOMERS
        // ============================================
        console.log('\n👔 Creating Customers...');
        const customers = [
            { name: 'Acme Corporation', email: 'contact@acme.com', phone: '+1-555-0101', type: 'business' },
            { name: 'Tech Solutions Inc', email: 'info@techsol.com', phone: '+1-555-0102', type: 'business' },
            { name: 'Global Enterprises', email: 'sales@global.com', phone: '+1-555-0103', type: 'business' },
            { name: 'John Smith', email: 'john.smith@email.com', phone: '+1-555-0104', type: 'individual' },
        ];

        const customerIds = [];
        for (const cust of customers) {
            const result = await client.query(
                `INSERT INTO customers (company_id, name, email, phone, customer_type, created_by)
                 VALUES ($1, $2, $3, $4, $5, 1)
                 RETURNING id`,
                [companyId, cust.name, cust.email, cust.phone, cust.type]
            );
            customerIds.push(result.rows[0].id);
        }
        console.log(`  ✅ Created ${customers.length} customers`);

        // ============================================
        // 6. INVOICES
        // ============================================
        console.log('\n🧾 Creating Invoices...');
        const invoices = [
            { customer: 0, amount: 15000, status: 'paid', dueDate: 30 },
            { customer: 1, amount: 25000, status: 'pending', dueDate: 15 },
            { customer: 2, amount: 35000, status: 'overdue', dueDate: -5 },
            { customer: 3, amount: 5000, status: 'paid', dueDate: 45 },
        ];

        for (const inv of invoices) {
            await client.query(
                `INSERT INTO invoices (
                    company_id, customer_id, invoice_number, issue_date, due_date, 
                    subtotal, tax, total, status, created_by
                ) VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '${inv.dueDate} days', $4, $5, $6, $7, 1)`,
                [
                    companyId,
                    customerIds[inv.customer],
                    `INV-${String(inv.customer + 1).padStart(5, '0')}`,
                    inv.amount,
                    inv.amount * 0.18,
                    inv.amount * 1.18,
                    inv.status
                ]
            );
        }
        console.log(`  ✅ Created ${invoices.length} invoices`);

        // ============================================
        // 7. INVENTORY - CATEGORIES
        // ============================================
        console.log('\n📦 Creating Product Categories...');
        const categories = [
            { name: 'Electronics', description: 'Electronic items and gadgets' },
            { name: 'Office Supplies', description: 'Office and stationery items' },
            { name: 'Furniture', description: 'Office furniture' },
        ];

        const categoryIds = [];
        for (const cat of categories) {
            const result = await client.query(
                `INSERT INTO categories (company_id, name, description, created_by)
                 VALUES ($1, $2, $3, 1)
                 RETURNING id`,
                [companyId, cat.name, cat.description]
            );
            categoryIds.push(result.rows[0].id);
        }
        console.log(`  ✅ Created ${categories.length} categories`);

        // ============================================
        // 8. PRODUCTS
        // ============================================
        console.log('\n🛍️ Creating Products...');
        const products = [
            { name: 'Laptop - Dell Inspiron', sku: 'LAP-001', category: 0, price: 45000, stock: 25 },
            { name: 'Office Chair', sku: 'FUR-001', category: 2, price: 8000, stock: 50 },
            { name: 'Printer - HP LaserJet', sku: 'ELE-002', category: 0, price: 15000, stock: 15 },
            { name: 'A4 Paper (Ream)', sku: 'SUP-001', category: 1, price: 250, stock: 200 },
            { name: 'Wireless Mouse', sku: 'ELE-003', category: 0, price: 500, stock: 100 },
        ];

        for (const prod of products) {
            await client.query(
                `INSERT INTO products (
                    company_id, category_id, name, sku, description, 
                    purchase_price, selling_price, stock_quantity, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)`,
                [
                    companyId,
                    categoryIds[prod.category],
                    prod.name,
                    prod.sku,
                    `High quality ${prod.name}`,
                    prod.price * 0.7,
                    prod.price,
                    prod.stock
                ]
            );
        }
        console.log(`  ✅ Created ${products.length} products`);

        // ============================================
        // 9. CRM - LEADS
        // ============================================
        console.log('\n🎯 Creating CRM Leads...');
        const leads = [
            { name: 'Sarah Johnson', email: 'sarah.j@company.com', phone: '+1-555-0201', company: 'ABC Corp', status: 'qualified', value: 50000 },
            { name: 'Michael Brown', email: 'mike.b@firm.com', phone: '+1-555-0202', company: 'XYZ Firm', status: 'contacted', value: 75000 },
            { name: 'Emily Davis', email: 'emily.d@startup.com', phone: '+1-555-0203', company: 'Tech Startup', status: 'new', value: 30000 },
        ];

        for (const lead of leads) {
            await client.query(
                `INSERT INTO leads (
                    company_id, name, email, phone, company_name, status, estimated_value, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 1)`,
                [companyId, lead.name, lead.email, lead.phone, lead.company, lead.status, lead.value]
            );
        }
        console.log(`  ✅ Created ${leads.length} leads`);

        // ============================================
        // 10. HR - HOLIDAYS
        // ============================================
        console.log('\n🎉 Creating Holidays...');
        const holidays = [
            { name: 'New Year', date: '2025-01-01' },
            { name: 'Republic Day', date: '2025-01-26' },
            { name: 'Holi', date: '2025-03-14' },
            { name: 'Independence Day', date: '2025-08-15' },
            { name: 'Diwali', date: '2025-10-20' },
            { name: 'Christmas', date: '2025-12-25' },
        ];

        for (const holiday of holidays) {
            await client.query(
                `INSERT INTO holidays (company_id, name, date, created_by)
                 VALUES ($1, $2, $3, 1)
                 ON CONFLICT DO NOTHING`,
                [companyId, holiday.name, holiday.date]
            );
        }
        console.log(`  ✅ Created ${holidays.length} holidays`);

        // ============================================
        // 11. ATTENDANCE
        // ============================================
        console.log('\n⏰ Creating Attendance Records...');
        const employees = await client.query('SELECT user_id FROM employees WHERE company_id = $1 LIMIT 5', [companyId]);

        for (let i = 0; i < 5; i++) {
            for (const emp of employees.rows) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                await client.query(
                    `INSERT INTO attendance (company_id, employee_id, date, check_in, check_out, status)
                     VALUES ($1, $2, $3, $4, $5, 'present')
                     ON CONFLICT DO NOTHING`,
                    [
                        companyId,
                        emp.user_id,
                        date.toISOString().split('T')[0],
                        `${date.toISOString().split('T')[0]} 09:00:00`,
                        `${date.toISOString().split('T')[0]} 18:00:00`
                    ]
                );
            }
        }
        console.log(`  ✅ Created attendance for last 5 days`);

        await client.query('COMMIT');

        console.log('\n🎉 ============================================');
        console.log('✅ COMPLETE ERP SEED DATA CREATED!');
        console.log('============================================\n');

        // Summary
        const summary = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM departments WHERE company_id = $1) as departments,
                (SELECT COUNT(*) FROM employees WHERE company_id = $1) as employees,
                (SELECT COUNT(*) FROM projects WHERE company_id = $1) as projects,
                (SELECT COUNT(*) FROM customers WHERE company_id = $1) as customers,
                (SELECT COUNT(*) FROM invoices WHERE company_id = $1) as invoices,
                (SELECT COUNT(*) FROM products WHERE company_id = $1) as products,
                (SELECT COUNT(*) FROM leads WHERE company_id = $1) as leads,
                (SELECT COUNT(*) FROM holidays WHERE company_id = $1) as holidays
        `, [companyId]);

        const stats = summary.rows[0];
        console.log('📊 Data Summary:');
        console.log(`   • Departments: ${stats.departments}`);
        console.log(`   • Employees: ${stats.employees}`);
        console.log(`   • Projects: ${stats.projects}`);
        console.log(`   • Customers: ${stats.customers}`);
        console.log(`   • Invoices: ${stats.invoices}`);
        console.log(`   • Products: ${stats.products}`);
        console.log(`   • Leads: ${stats.leads}`);
        console.log(`   • Holidays: ${stats.holidays}`);
        console.log('\n✅ Your ERP is now fully populated with demo data!\n');

        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

seedCompleteERP();
