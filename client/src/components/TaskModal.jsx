import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiX, FiSave, FiMessageSquare, FiPaperclip, FiActivity, FiCalendar, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useModalStore from '../store/useModalStore';
import { createTask, updateTask } from '../services/api';

const TaskModal = ({ onTaskSaved }) => {
  const { isOpen, task, closeModal } = useModalStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (task) {
      reset({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        category: 'Work',
        estimatedTime: 0,
        comments: []
      });
    }
  }, [task, isOpen, reset]);

  const [newComment, setNewComment] = React.useState('');

  const onSubmit = async (data) => {
    try {
      if (task) {
        if (newComment.trim()) {
          data.comments = [...(task.comments || []), { text: newComment }];
        }
        await updateTask(task._id, data);
        toast.success('Task updated');
      } else {
        await createTask(data);
        toast.success('Task created');
      }
      window.dispatchEvent(new Event('taskSaved'));
      if (onTaskSaved) onTaskSaved();
      closeModal();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div className="glass-card w-full max-w-2xl max-h-full overflow-y-auto pointer-events-auto flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700/50 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl z-10">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {task ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="Task title"
                    {...register('title', { required: 'Title is required', minLength: 3 })}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-500">Title is required (min 3 chars)</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows="4"
                    className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Add more details..."
                    {...register('description', { required: 'Description is required' })}
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select className="input-field" {...register('status')}>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <select className="input-field" {...register('priority')}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                    <input type="date" className="input-field" {...register('dueDate')} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select className="input-field" {...register('category')}>
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Study">Study</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Fitness">Fitness</option>
                    </select>
                  </div>
                </div>

                {task && (
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-700/50 space-y-6">
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><FiCalendar /> Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><FiClock /> Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3"><FiMessageSquare /> Comments</h4>
                      <div className="space-y-3 mb-3 max-h-40 overflow-y-auto pr-2">
                        {task.comments?.length > 0 ? task.comments.map((c, i) => (
                          <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                            {c.text}
                          </div>
                        )) : <p className="text-xs text-slate-500">No comments yet.</p>}
                      </div>
                      <input 
                        type="text" 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment... (will be saved when you update task)" 
                        className="input-field text-sm"
                      />
                    </div>
                    
                    <div className="flex gap-4 border-t border-slate-200 dark:border-slate-700/50 pt-4">
                      <button type="button" disabled className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-2 opacity-50 cursor-not-allowed" title="Coming soon">
                        <FiPaperclip /> Attachments
                      </button>
                      <button type="button" disabled className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-2 opacity-50 cursor-not-allowed" title="Coming soon">
                        <FiActivity /> Activity History
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FiSave className="mr-2" />
                    {task ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;
