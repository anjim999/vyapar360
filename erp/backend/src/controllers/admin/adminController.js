import { query } from '../../db/pool.js';
import { logAudit } from '../../utils/auditLogger.js';

export async function getAllUsers(_req, res, next) {
  try {
    const { rows } = await query(
      `SELECT id, name, email, role, is_verified, created_at, avatar, google_id
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['admin', 'finance_manager', 'project_manager', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const { rowCount, rows } = await query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
      [role, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await logAudit({
      userId: req.user.userId,
      action: 'UPDATE_USER_ROLE',
      entityType: 'user',
      entityId: id,
      details: JSON.stringify({ newRole: role }),
    });

    res.json({ message: 'Role updated', user: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const { rows } = await query(
      `SELECT al.id, al.user_id, u.email, al.action, al.entity_type,
              al.entity_id, al.details, al.created_at
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getIntegrations(_req, res) {
  res.json([
    { id: 'sap', name: 'SAP ERP', status: 'DISCONNECTED' },
    { id: 'tally', name: 'Tally', status: 'DISCONNECTED' },
    { id: 'quickbooks', name: 'QuickBooks', status: 'DISCONNECTED' }
  ]);
}

export async function testIntegration(req, res) {
  const { integrationId } = req.body || {};
  res.json({
    integrationId,
    status: 'OK',
    message: 'Integration test successful (mock)',
  });
}

// Analytics
export async function getAnalytics(req, res, next) {
  try {
    const userCount = await query('SELECT COUNT(*) FROM users');
    let companyCount = { rows: [{ count: 0 }] };
    let activeCompanies = { rows: [{ count: 0 }] };
    let requestsCount = { rows: [{ count: 0 }] };

    try {
      companyCount = await query('SELECT COUNT(*) FROM companies');
      activeCompanies = await query('SELECT COUNT(*) FROM companies WHERE is_active = true');
      requestsCount = await query("SELECT COUNT(*) FROM company_requests WHERE status = 'pending'");
    } catch (e) {
      console.warn("Analytics: Some tables missing", e.message);
    }

    // Mock growth data
    const growth = [
      { month: 'Jan', companies: 10, users: 45 },
      { month: 'Feb', companies: 15, users: 70 },
      { month: 'Mar', companies: 22, users: 110 },
      { month: 'Apr', companies: 28, users: 150 },
      { month: 'May', companies: 35, users: 200 }
    ];

    res.json({
      summary: {
        totalUsers: parseInt(userCount.rows[0].count),
        totalCompanies: parseInt(companyCount.rows[0].count),
        activeCompanies: parseInt(activeCompanies.rows[0].count),
        pendingRequests: parseInt(requestsCount.rows[0].count)
      },
      growth
    });
  } catch (err) {
    next(err);
  }
}

// Companies
export async function getCompanies(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM users u WHERE u.company_id = c.id) as user_count 
       FROM companies c 
       ORDER BY c.created_at DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    console.error("Companies error:", err.message);
    res.json({ data: [] });
  }
}

// Support Tickets
export async function getSupportTickets(req, res, next) {
  try {
    res.json({
      data: [
        { id: 101, subject: "Login issue", user: "John Doe", status: "open", priority: "high", created_at: new Date() },
        { id: 102, subject: "Feature request", user: "Jane Smith", status: "pending", priority: "medium", created_at: new Date(Date.now() - 86400000) }
      ]
    });
  } catch (err) {
    next(err);
  }
}
