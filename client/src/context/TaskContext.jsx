import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  fetchTaskStats,
  listTasks,
  updateTask as updateTaskApi,
} from '../features/tasks/tasks.api.js';
import { socket } from '../socket/index.js';
import { useAuth } from './AuthContext.jsx';

const TaskContext = createContext(null);

function mergeById(items, incoming) {
  const index = items.findIndex((item) => item.id === incoming.id);
  if (index < 0) {
    return [incoming, ...items];
  }
  const next = [...items];
  next[index] = { ...next[index], ...incoming };
  return next;
}

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  const loadTasks = useCallback(async (params = {}) => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const query = {
        page: params.page || pagination.page || 1,
        limit: params.limit || pagination.limit || 10,
      };
      const filter = params.status !== undefined ? params.status : statusFilter;
      if (filter) {
        query.status = filter;
      }

      const { data } = await listTasks(query);
      setItems(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.page, statusFilter, user]);

  const loadStats = useCallback(async () => {
    if (!user) {
      setStats({ total: 0, completed: 0, pending: 0 });
      return;
    }
    const { data } = await fetchTaskStats();
    setStats(data);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setStats({ total: 0, completed: 0, pending: 0 });
      return;
    }
    loadTasks({ page: 1, status: statusFilter });
    loadStats();
  }, [loadStats, loadTasks, statusFilter, user]);

  useEffect(() => {
    function onTaskChanged({ action, task }) {
      if (!task) return;

      setItems((prev) => {
        if (action === 'deleted') {
          return prev.filter((item) => item.id !== task.id);
        }
        return mergeById(prev, task);
      });

      loadStats();
    }

    socket.on('task:changed', onTaskChanged);
    return () => {
      socket.off('task:changed', onTaskChanged);
    };
  }, [loadStats]);

  const createTask = useCallback(async (payload) => {
    const { data } = await createTaskApi(payload);
    setItems((prev) => mergeById(prev, data));
    await loadStats();
    return data;
  }, [loadStats]);

  const updateTask = useCallback(async (taskId, payload) => {
    const previous = items.find((item) => item.id === taskId);

    if (previous && payload.status) {
      setItems((prev) => prev.map((item) => (item.id === taskId ? { ...item, ...payload } : item)));
    }

    try {
      const { data } = await updateTaskApi(taskId, payload);
      setItems((prev) => mergeById(prev, data));
      await loadStats();
      return data;
    } catch (err) {
      if (previous) {
        setItems((prev) => prev.map((item) => (item.id === taskId ? previous : item)));
      }
      throw err;
    }
  }, [items, loadStats]);

  const deleteTask = useCallback(async (taskId) => {
    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== taskId));
    try {
      await deleteTaskApi(taskId);
      await loadStats();
    } catch (err) {
      setItems(previous);
      throw err;
    }
  }, [items, loadStats]);

  const value = useMemo(() => ({
    items,
    pagination,
    statusFilter,
    loading,
    stats,
    setStatusFilter,
    loadTasks,
    loadStats,
    createTask,
    updateTask,
    deleteTask,
  }), [
    createTask,
    deleteTask,
    items,
    loadStats,
    loadTasks,
    loading,
    pagination,
    stats,
    statusFilter,
    updateTask,
  ]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return ctx;
}
