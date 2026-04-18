import api from '../../services/api.js';

export function listTasks(params = {}) {
  return api.get('/tasks', { params });
}

export function createTask(payload) {
  return api.post('/tasks', payload);
}

export function updateTask(taskId, payload) {
  return api.patch(`/tasks/${taskId}`, payload);
}

export function deleteTask(taskId) {
  return api.delete(`/tasks/${taskId}`);
}

export function fetchTaskStats() {
  return api.get('/tasks/stats');
}
