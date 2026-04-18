import { useState } from 'react';
import TaskForm from './TaskForm.jsx';

const STATUS_OPTIONS = ['todo', 'in-progress', 'done'];

export default function TaskList({ tasks, onUpdate, onDelete }) {
  const [editingTaskId, setEditingTaskId] = useState(null);

  if (!tasks.length) {
    return <p className="text-gray-600">No tasks found.</p>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isEditing = editingTaskId === task.id;
        return (
          <div key={task.id} className="rounded-md border border-gray-200 p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
            {isEditing ? (
              <TaskForm
                initialValue={task}
                submitLabel="Update task"
                onSubmit={async (payload) => {
                  await onUpdate(task.id, payload);
                  setEditingTaskId(null);
                }}
                onCancel={() => setEditingTaskId(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description || 'No description'}</p>
                  </div>
                  <span className="text-xs rounded-full bg-gray-200 px-2 py-1 dark:bg-gray-700">{task.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <select
                    className="input w-auto"
                    value={task.status}
                    onChange={(event) => onUpdate(task.id, { status: event.target.value })}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button className="btn" onClick={() => setEditingTaskId(task.id)}>Edit</button>
                  <button className="btn bg-red-600 hover:bg-red-700" onClick={() => onDelete(task.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
