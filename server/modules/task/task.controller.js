import { asyncHandler } from '../../utils/asyncHandler.js';
import * as taskService from './task.service.js';

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user.id, req.body);
  res.status(201).json({ success: true, data: task });
});

export const getTasks = asyncHandler(async (req, res) => {
  const data = await taskService.getTasks(req.user.id, req.query);
  res.json({ success: true, data });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.user.id, req.body);
  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const data = await taskService.deleteTask(req.params.taskId, req.user.id);
  res.json({ success: true, data });
});

export const getTaskStats = asyncHandler(async (req, res) => {
  const data = await taskService.taskStats(req.user.id);
  res.json({ success: true, data });
});
