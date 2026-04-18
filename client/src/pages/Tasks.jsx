import { useMemo, useState } from 'react';
import TaskForm from '../features/tasks/TaskForm.jsx';
import TaskList from '../features/tasks/TaskList.jsx';
import useTasks from '../hooks/useTasks.js';
import { getApiErrorMessage } from '../utils/apiError.js';

const FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Done', value: 'done' },
];

export default function Tasks() {
  const {
    items,
    loading,
    pagination,
    statusFilter,
    setStatusFilter,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();
  const [pageError, setPageError] = useState('');

  const pageInfo = useMemo(() => {
    if (!pagination.total) {
      return '0 tasks';
    }
    return `Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} tasks)`;
  }, [pagination.page, pagination.total, pagination.totalPages]);

  const changeFilter = async (value) => {
    setPageError('');
    setStatusFilter(value);
    try {
      await loadTasks({ page: 1, status: value });
    } catch (err) {
      setPageError(getApiErrorMessage(err, 'Unable to load tasks'));
    }
  };

  const changePage = async (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }
    setPageError('');
    try {
      await loadTasks({ page: nextPage, status: statusFilter });
    } catch (err) {
      setPageError(getApiErrorMessage(err, 'Unable to load tasks'));
    }
  };

  const handleDelete = async (taskId) => {
    setPageError('');
    try {
      await deleteTask(taskId);
    } catch (err) {
      setPageError(getApiErrorMessage(err, 'Unable to delete task'));
    }
  };

  const handleUpdate = async (taskId, payload) => {
    setPageError('');
    try {
      await updateTask(taskId, payload);
    } catch (err) {
      setPageError(getApiErrorMessage(err, 'Unable to update task'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <div>
          <label className="text-sm mr-2">Filter</label>
          <select className="input w-auto" value={statusFilter} onChange={(event) => changeFilter(event.target.value)}>
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
        <h2 className="font-semibold mb-3">Create Task</h2>
        <TaskForm submitLabel="Create task" onSubmit={createTask} />
      </div>

      <div className="rounded-md border border-gray-200 p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
          <h2 className="font-semibold">Task List</h2>
          <p className="text-sm text-gray-600">{pageInfo}</p>
        </div>

        {pageError && <p className="text-sm text-red-600 mb-3">{pageError}</p>}
        {loading ? <p>Loading tasks...</p> : <TaskList tasks={items} onUpdate={handleUpdate} onDelete={handleDelete} />}

        <div className="mt-4 flex items-center gap-2">
          <button className="btn" onClick={() => changePage(pagination.page - 1)} disabled={pagination.page <= 1 || loading}>
            Previous
          </button>
          <button
            className="btn"
            onClick={() => changePage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
