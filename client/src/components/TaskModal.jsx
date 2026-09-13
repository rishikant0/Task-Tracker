import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import useModalStore from '../store/useModalStore';
import useTaskStore from '../store/useTaskStore';
import toast from 'react-hot-toast';

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const TaskModal = () => {
  const { isOpen, taskToEdit, closeModal } = useModalStore();
  const { createTask, updateTask } = useTaskStore();

  const isEdit = !!taskToEdit;

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form on edit, reset on create
  useEffect(() => {
    if (isOpen && taskToEdit) {
      setForm({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || 'medium',
        status: taskToEdit.status || 'todo',
        dueDate: taskToEdit.dueDate
          ? new Date(taskToEdit.dueDate).toISOString().split('T')[0]
          : '',
      });
    } else if (isOpen) {
      setForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' });
    }
    setFieldErrors({});
    setServerError('');
  }, [isOpen, taskToEdit]);

  // Client-side validation
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous errors
    setFieldErrors({});
    setServerError('');

    // Client validation
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      // Send exactly what the schema expects:
      // title: string
      // description: string
      // priority: 'low' | 'medium' | 'high'
      // status: 'todo' | 'in-progress' | 'done'
      // dueDate: ISO date string (e.g. '2026-09-24') or null
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,       // already lowercase enum value
        status: form.status,           // already lowercase enum value
        dueDate: form.dueDate || null, // HTML date input gives 'YYYY-MM-DD' directly
      };

      console.log('SUBMITTING TASK PAYLOAD:', payload);

      if (isEdit) {
        await updateTask(taskToEdit._id, payload);
        toast.success('Task updated');
      } else {
        await createTask(payload);
        toast.success('Task created');
      }

      closeModal();
    } catch (err) {
      // Show the real server error message in the form
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to save task';

      console.error('TASK MODAL ERROR:', err.response?.data || err);
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    // Clear server error on any change
    if (serverError) setServerError('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
    >
      <div className="modal-box max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-default">
          <h2 className="text-base font-semibold text-text-primary">
            {isEdit ? 'Edit Task' : 'Create Task'}
          </h2>
          <button onClick={closeModal} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>

          {/* Server error banner — shows real backend error */}
          {serverError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              className="block text-sm font-medium text-text-secondary mb-1.5"
              htmlFor="task-title"
            >
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter task title..."
              className={`field w-full ${fieldErrors.title ? 'border-red-500 focus:border-red-500' : ''}`}
              autoFocus
            />
            {fieldErrors.title && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium text-text-secondary mb-1.5"
              htmlFor="task-desc"
            >
              Description
            </label>
            <textarea
              id="task-desc"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add a description..."
              rows={3}
              className="field w-full resize-none"
            />
          </div>

          {/* Priority + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium text-text-secondary mb-1.5"
                htmlFor="task-priority"
              >
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="field w-full"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-text-secondary mb-1.5"
                htmlFor="task-status"
              >
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="field w-full"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date — HTML date input always sends YYYY-MM-DD, no conversion needed */}
          <div>
            <label
              className="block text-sm font-medium text-text-secondary mb-1.5"
              htmlFor="task-due"
            >
              Due Date
            </label>
            <input
              id="task-due"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className="field w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-default">
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[120px]"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
