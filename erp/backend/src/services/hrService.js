// backend/src/services/hrService.js
import pool from "../db/pool.js";

export async function getAllDepartments(companyId) {
    const result = await pool.query(
        `SELECT d.*, u.name as manager_name,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id) as employee_count
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       WHERE d.company_id = $1
       ORDER BY d.name`,
        [companyId]
    );
    return { success: true, data: result.rows };
}

export async function createNewDepartment(companyId, { name, description, manager_id }) {
    const result = await pool.query(
        `INSERT INTO departments (company_id, name, description, manager_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
        [companyId, name, description, manager_id]
    );
    return { success: true, data: result.rows[0] };
}

export async function updateExistingDepartment(companyId, id, { name, description, manager_id }) {
    const result = await pool.query(
        `UPDATE departments SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        manager_id = COALESCE($3, manager_id)
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
        [name, description, manager_id, id, companyId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Department not found");
        error.statusCode = 404;
        throw error;
    }

    return { success: true, data: result.rows[0] };
}

export async function deleteExistingDepartment(companyId, id) {
    await pool.query(
        `DELETE FROM departments WHERE id = $1 AND company_id = $2`,
        [id, companyId]
    );
    return { success: true, message: "Department deleted successfully" };
}

export async function getAllEmployees(companyId, { department_id, search, status }) {
    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.role, u.designation,
             u.avatar, u.date_of_joining, u.is_active,
             d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.company_id = $1
    `;
    const params = [companyId];
    let paramCount = 1;

    if (department_id) {
        paramCount++;
        query += ` AND u.department_id = $${paramCount}`;
        params.push(department_id);
    }

    if (search) {
        paramCount++;
        query += ` AND (LOWER(u.name) LIKE LOWER($${paramCount}) OR LOWER(u.email) LIKE LOWER($${paramCount}))`;
        params.push(`%${search}%`);
    }

    if (status === "active") {
        query += ` AND u.is_active = true`;
    } else if (status === "inactive") {
        query += ` AND u.is_active = false`;
    }

    query += ` ORDER BY u.name`;

    const result = await pool.query(query, params);
    return { success: true, data: result.rows };
}

export async function getEmployeeById(companyId, id) {
    const result = await pool.query(
        `SELECT u.*, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1 AND u.company_id = $2`,
        [id, companyId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Employee not found");
        error.statusCode = 404;
        throw error;
    }

    return { success: true, data: result.rows[0] };
}

export async function updateExistingEmployee(companyId, id, updateData) {
    const result = await pool.query(
        `UPDATE users SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        role = COALESCE($3, role),
        designation = COALESCE($4, designation),
        department_id = COALESCE($5, department_id),
        address = COALESCE($6, address),
        date_of_birth = COALESCE($7, date_of_birth),
        date_of_joining = COALESCE($8, date_of_joining),
        emergency_contact = COALESCE($9, emergency_contact),
        blood_group = COALESCE($10, blood_group),
        is_active = COALESCE($11, is_active)
       WHERE id = $12 AND company_id = $13
       RETURNING *`,
        [
            updateData.name, updateData.phone, updateData.role,
            updateData.designation, updateData.department_id, updateData.address,
            updateData.date_of_birth, updateData.date_of_joining,
            updateData.emergency_contact, updateData.blood_group,
            updateData.is_active, id, companyId
        ]
    );

    if (result.rows.length === 0) {
        const error = new Error("Employee not found");
        error.statusCode = 404;
        throw error;
    }

    return { success: true, data: result.rows[0] };
}

export async function getAllAttendance(companyId, userId, role, { user_id, date, month, year }) {
    let query = `
      SELECT a.*, u.name as employee_name
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.company_id = $1
    `;
    const params = [companyId];
    let paramCount = 1;

    if (!["company_admin", "hr_manager"].includes(role)) {
        paramCount++;
        query += ` AND a.user_id = $${paramCount}`;
        params.push(userId);
    } else if (user_id) {
        paramCount++;
        query += ` AND a.user_id = $${paramCount}`;
        params.push(user_id);
    }

    if (date) {
        paramCount++;
        query += ` AND a.date = $${paramCount}`;
        params.push(date);
    }

    if (month && year) {
        paramCount++;
        query += ` AND EXTRACT(MONTH FROM a.date) = $${paramCount}`;
        params.push(month);
        paramCount++;
        query += ` AND EXTRACT(YEAR FROM a.date) = $${paramCount}`;
        params.push(year);
    }

    query += ` ORDER BY a.date DESC, u.name`;

    const result = await pool.query(query, params);
    return { success: true, data: result.rows };
}

export async function performCheckIn(companyId, userId) {
    const today = new Date().toISOString().slice(0, 10);

    const existing = await pool.query(
        `SELECT * FROM attendance WHERE user_id = $1 AND date = $2`,
        [userId, today]
    );

    if (existing.rows.length > 0) {
        const error = new Error("Already checked in today");
        error.statusCode = 400;
        throw error;
    }

    const result = await pool.query(
        `INSERT INTO attendance (company_id, user_id, date, check_in, status)
       VALUES ($1, $2, $3, NOW()::time, 'present')
       RETURNING *`,
        [companyId, userId, today]
    );

    return { success: true, data: result.rows[0] };
}

export async function performCheckOut(userId) {
    const today = new Date().toISOString().slice(0, 10);

    const result = await pool.query(
        `UPDATE attendance SET
        check_out = NOW()::time,
        work_hours = EXTRACT(EPOCH FROM (NOW()::time - check_in)) / 3600
       WHERE user_id = $1 AND date = $2
       RETURNING *`,
        [userId, today]
    );

    if (result.rows.length === 0) {
        const error = new Error("Not checked in today");
        error.statusCode = 400;
        throw error;
    }

    return { success: true, data: result.rows[0] };
}

export async function markEmployeeAttendance(companyId, { user_id, date, status, check_in, check_out, notes }) {
    const result = await pool.query(
        `INSERT INTO attendance (company_id, user_id, date, status, check_in, check_out, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, date) DO UPDATE SET
         status = EXCLUDED.status,
         check_in = COALESCE(EXCLUDED.check_in, attendance.check_in),
         check_out = COALESCE(EXCLUDED.check_out, attendance.check_out),
         notes = COALESCE(EXCLUDED.notes, attendance.notes)
       RETURNING *`,
        [companyId, user_id, date, status, check_in, check_out, notes]
    );

    return { success: true, data: result.rows[0] };
}

export async function getAllLeaveTypes(companyId) {
    const result = await pool.query(
        `SELECT * FROM leave_types WHERE company_id = $1`,
        [companyId]
    );
    return { success: true, data: result.rows };
}

export async function getAllLeaves(companyId, userId, role, { status, user_id }) {
    let query = `
      SELECT l.*, u.name as employee_name, lt.name as leave_type_name,
             a.name as approved_by_name
      FROM leave_requests l
      JOIN users u ON l.user_id = u.id
      JOIN leave_types lt ON l.leave_type_id = lt.id
      LEFT JOIN users a ON l.approved_by = a.id
      WHERE l.company_id = $1
    `;
    const params = [companyId];
    let paramCount = 1;

    if (!["company_admin", "hr_manager"].includes(role)) {
        paramCount++;
        query += ` AND l.user_id = $${paramCount}`;
        params.push(userId);
    } else if (user_id) {
        paramCount++;
        query += ` AND l.user_id = $${paramCount}`;
        params.push(user_id);
    }

    if (status) {
        paramCount++;
        query += ` AND l.status = $${paramCount}`;
        params.push(status);
    }

    query += ` ORDER BY l.created_at DESC`;

    const result = await pool.query(query, params);
    return { success: true, data: result.rows };
}

export async function applyForLeave(companyId, userId, { leave_type_id, start_date, end_date, reason }) {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const result = await pool.query(
        `INSERT INTO leave_requests 
        (company_id, user_id, leave_type_id, start_date, end_date, days, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
        [companyId, userId, leave_type_id, start_date, end_date, days, reason]
    );

    return { success: true, data: result.rows[0] };
}

export async function updateExistingLeaveStatus(companyId, userId, id, { status }) {
    const result = await pool.query(
        `UPDATE leave_requests SET
        status = $1,
        approved_by = $2,
        approved_at = NOW()
       WHERE id = $3 AND company_id = $4
       RETURNING *`,
        [status, userId, id, companyId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Leave request not found");
        error.statusCode = 404;
        throw error;
    }

    return { success: true, data: result.rows[0] };
}

export async function getAllHolidays(companyId, { year }) {
    let query = `SELECT * FROM holidays WHERE company_id = $1`;
    const params = [companyId];

    if (year) {
        query += ` AND EXTRACT(YEAR FROM date) = $2`;
        params.push(year);
    }

    query += ` ORDER BY date`;

    const result = await pool.query(query, params);
    return { success: true, data: result.rows };
}

export async function createNewHoliday(companyId, { name, date, is_optional }) {
    const result = await pool.query(
        `INSERT INTO holidays (company_id, name, date, is_optional)
       VALUES ($1, $2, $3, $4) RETURNING *`,
        [companyId, name, date, is_optional || false]
    );

    return { success: true, data: result.rows[0] };
}

export async function deleteExistingHoliday(companyId, id) {
    await pool.query(
        `DELETE FROM holidays WHERE id = $1 AND company_id = $2`,
        [id, companyId]
    );

    return { success: true, message: "Holiday deleted successfully" };
}
