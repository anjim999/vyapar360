// backend/src/services/projectService.js
import { query } from '../db/pool.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getAllProjects() {
    try {
        const { rows } = await query(
            `SELECT * FROM projects ORDER BY created_at DESC NULLS LAST, id DESC`
        ).catch(async (err) => {
            if (err) {
                const { rows: r } = await query(`SELECT * FROM projects ORDER BY id DESC`);
                return { rows: r };
            }
        });
        return rows;
    } catch (err) {
        throw err;
    }
}

export async function getProjectDetails(id) {
    const {
        rows: [project],
    } = await query(`SELECT * FROM projects WHERE id = $1`, [id]);
    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }
    return project;
}

export async function createNewProject(userId, { name, budget, start_date, end_date }) {
    const {
        rows: [project],
    } = await query(
        `INSERT INTO projects (name, budget, start_date, end_date, status)
     VALUES ($1, $2, $3, $4, 'Active')
     RETURNING *`,
        [name, budget, start_date, end_date]
    );
    await logAudit({
        userId,
        action: 'CREATE_PROJECT',
        entityType: 'project',
        entityId: project.id,
        details: JSON.stringify(project),
    });
    return project;
}

export async function updateExistingProject(userId, id, { name, budget, actual_cost, planned_progress, actual_progress, status }) {
    const { rows, rowCount } = await query(
        `UPDATE projects
     SET name = COALESCE($1, name),
         budget = COALESCE($2, budget),
         actual_cost = COALESCE($3, actual_cost),
         planned_progress = COALESCE($4, planned_progress),
         actual_progress = COALESCE($5, actual_progress),
         status = COALESCE($6, status)
     WHERE id = $7
     RETURNING *`,
        [name, budget, actual_cost, planned_progress, actual_progress, status, id]
    );
    if (rowCount === 0) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    await logAudit({
        userId,
        action: 'UPDATE_PROJECT',
        entityType: 'project',
        entityId: id,
        details: JSON.stringify(rows[0]),
    });

    return rows[0];
}

export async function getProjectProgress(id) {
    const { rows } = await query(
        `SELECT date, planned_percent, actual_percent
     FROM project_progress
     WHERE project_id = $1
     ORDER BY date`,
        [id]
    );
    return rows;
}
