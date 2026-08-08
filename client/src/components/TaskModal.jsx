import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Save, MessageSquare, Paperclip, Activity, Calendar, Clock, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useModalStore from '../store/useModalStore';
import { createTask, updateTask } from '../services/api';

const TaskModal = ({ onTaskSaved }) => {
  const { isOpen, task, closeModal } = useModalStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (task) {
      reset({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
      setActiveTab('details');
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
      setActiveTab('details');
    }
  }, [task, isOpen, reset]);

  const [newComment, setNewComment] = useState('');

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          />
          
          {/* Right Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {task ? 'Edit Task' : 'New Task'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {task ? 'Update task details' : 'Create a new item'}
                  </p>
                </div>
              </div>
              <button 
                onClick={closeModal} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Tabs */}
              {task && (
                <div className="flex px-6 pt-4 gap-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                      activeTab === 'details' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Details
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('comments')}
                    className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
                      activeTab === 'comments' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Activity
                    {task.comments?.length > 0 && (
                      <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">{task.comments.length}</span>
                    )}
                  </button>
                </div>
              )}

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {activeTab === 'details' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Task Title</label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border ${errors.title ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-400`}
                        placeholder="e.g. Design new landing page"
                        {...register('title', { required: 'Title is required', minLength: 3 })}
                      />
                      {errors.title && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.title.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" /> Description
                      </label>
                      <textarea
                        rows="4"
                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border ${errors.description ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-400 resize-none`}
                        placeholder="Add more context or acceptance criteria..."
                        {...register('description', { required: 'Description is required' })}
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Status</label>
                        <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none" {...register('status')}>
                          <option value="Pending">Todo</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Priority</label>
                        <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none" {...register('priority')}>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Due Date</label>
                        <input type="date" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-700 dark:text-slate-200" {...register('dueDate')} />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Category</label>
                        <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none" {...register('category')}>
                          <option value="Work">Work</option>
                          <option value="Personal">Personal</option>
                          <option value="Study">Study</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Fitness">Fitness</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'comments' && task && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex flex-col h-full">
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <MessageSquare size={16} className="text-indigo-600" /> Conversation
                      </h4>
                      
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                        {task.comments?.length > 0 ? task.comments.map((c, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                              U
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-300 shadow-sm w-full">
                              {c.text}
                            </div>
                          </div>
                        )) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                            <MessageSquare size={32} className="mb-2 opacity-50" />
                            <p className="text-sm font-medium">No comments yet</p>
                            <p className="text-xs">Start the conversation below.</p>
                          </div>
                        )}
                      </div>

                      <div className="relative mt-auto">
                        <input 
                          type="text" 
                          value={newComment} 
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..." 
                          className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm"
                        />
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all">
                  <Save size={18} />
                  {task ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;
