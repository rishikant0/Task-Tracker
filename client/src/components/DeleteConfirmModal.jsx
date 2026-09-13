import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import useDeleteStore from '../store/useDeleteStore';
import useTaskStore from '../store/useTaskStore';
import toast from 'react-hot-toast';

const DeleteConfirmModal = () => {
  const { isOpen, taskId, taskTitle, closeDelete } = useDeleteStore();
  const { deleteTask } = useTaskStore();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
      closeDelete();
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeDelete(); }}>
      <div className="modal-box max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">Delete this task?</h3>
            {taskTitle && (
              <p className="text-sm text-text-secondary">
                "<span className="text-text-primary font-medium">{taskTitle}</span>" will be permanently deleted.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={closeDelete} className="btn-secondary flex-1" disabled={loading}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading} className="btn-danger flex-1">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
