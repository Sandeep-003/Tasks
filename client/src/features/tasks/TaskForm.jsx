import { useState } from 'react';

const STATUS_OPTIONS = ['todo', 'in-progress', 'done'];

export default function TaskForm({ initialValue, onSubmit, submitLabel = 'Save', onCancel }) {
  const [title, setTitle] = useState(initialValue?.title || '');
  const [description, setDescription] = useState(initialValue?.description || '');
  const [status, setStatus] = useState(initialValue?.status || 'todo');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), status });
      if (!initialValue) {
        setTitle('');
        setDescription('');
        setStatus('todo');
      }
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Unable to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm mb-1">Title</label>
        <input
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea
          className="input min-h-[96px]"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Status</label>
        <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn bg-gray-500 hover:bg-gray-600" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
