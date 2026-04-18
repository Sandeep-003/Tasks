import { notFound } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import { emitToUser } from '../../socket/socket.handler.js';
import {
  deleteTaskById,
  findTaskById,
  getTaskStats,
  insertTask,
  listTasks,
  updateTaskById,
} from './task.repository.js';
import { validateCreateTaskInput, validateTaskQuery, validateUpdateTaskInput } from './task.validation.js';

function emitTaskEvent(userId, action, task) {
  emitToUser(userId, 'task:changed', { action, task });
}

export async function createTask(userId, body) {
  const payload = validateCreateTaskInput(body);
  const task = await insertTask(userId, payload);
  emitTaskEvent(userId, 'created', task);
  logger.info('Task created', { userId, taskId: task.id });
  return task;
}

export async function getTasks(userId, query) {
  const options = validateTaskQuery(query);
  const { tasks, total } = await listTasks(userId, options);

  return {
    items: tasks,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit) || 1,
    },
  };
}

export async function updateTask(taskId, userId, body) {
  const payload = validateUpdateTaskInput(body);
  const task = await updateTaskById(taskId, userId, payload);

  if (!task) {
    throw notFound('Task not found');
  }

  emitTaskEvent(userId, 'updated', task);
  logger.info('Task updated', { userId, taskId: task.id });
  return task;
}

export async function deleteTask(taskId, userId) {
  const existingTask = await findTaskById(taskId, userId);
  if (!existingTask) {
    throw notFound('Task not found');
  }

  await deleteTaskById(taskId, userId);
  emitTaskEvent(userId, 'deleted', { id: taskId });
  logger.info('Task deleted', { userId, taskId });
  return { id: taskId };
}

export async function taskStats(userId) {
  return getTaskStats(userId);
}
