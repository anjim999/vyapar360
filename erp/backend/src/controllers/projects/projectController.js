// backend/src/controllers/projectController.js
import * as projectService from '../../services/projectService.js';

export async function getProjects(_req, res, next) {
  try {
    const result = await projectService.getAllProjects();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await projectService.getProjectDetails(id);
    res.json(result);
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ message: err.message });
    }
    next(err);
  }
}

export async function createProject(req, res, next) {
  try {
    const { name, budget, start_date, end_date } = req.body;
    const result = await projectService.createNewProject(req.user.userId, { name, budget, start_date, end_date });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const { name, budget, actual_cost, planned_progress, actual_progress, status } = req.body;
    const result = await projectService.updateExistingProject(req.user.userId, id, { name, budget, actual_cost, planned_progress, actual_progress, status });
    res.json(result);
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ message: err.message });
    }
    next(err);
  }
}

export async function getProjectProgressHistory(req, res, next) {
  try {
    const { id } = req.params;
    const result = await projectService.getProjectProgress(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
