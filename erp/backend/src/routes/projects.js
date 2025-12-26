import express from 'express';
import requireRole from '../middleware/requireRole.js';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  getProjectProgressHistory,
} from '../controllers/projects/projectController.js';
import pool from '../db/pool.js';

const router = express.Router();

router.use(requireRole('project_manager', 'admin', 'company_admin', 'employee'));

// Get all tasks (for TasksPage)
router.get('/tasks', async (req, res) => {
  try {
    const { companyId } = req.user;
    const { status, priority, project_id } = req.query;

    let query = `SELECT t.*, p.name as project_name, e.name as assigned_name 
                 FROM tasks t 
                 LEFT JOIN projects p ON t.project_id = p.id
                 LEFT JOIN employees e ON t.assigned_to = e.id
                 WHERE p.company_id = $1`;
    const params = [companyId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }
    if (priority) {
      paramCount++;
      query += ` AND t.priority = $${paramCount}`;
      params.push(priority);
    }
    if (project_id) {
      paramCount++;
      query += ` AND t.project_id = $${paramCount}`;
      params.push(project_id);
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ success: false, error: "Failed to fetch tasks" });
  }
});

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.get('/:id/progress', getProjectProgressHistory);

// Project-specific tasks
router.get('/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, e.name as assigned_name 
       FROM tasks t 
       LEFT JOIN employees e ON t.assigned_to = e.id
       WHERE t.project_id = $1 
       ORDER BY t.created_at DESC`,
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "Failed" });
  }
});

router.post('/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { title, description, status, priority, due_date, assigned_to } = req.body;

    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, due_date, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, title, description, status || 'todo', priority || 'medium', due_date, assigned_to, userId]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "Failed to create task" });
  }
});

// Update task
router.put('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, due_date, assigned_to } = req.body;

    const result = await pool.query(
      `UPDATE tasks SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        assigned_to = COALESCE($6, assigned_to),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, description, status, priority, due_date, assigned_to, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "Failed to update task" });
  }
});

export default router;
