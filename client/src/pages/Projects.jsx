import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Plus, MoreVertical, Calendar, Users, Star, Loader2, X } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { getProjects, createProject, updateProject, deleteProject, getTeams } from '../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    team: '',
    dueDate: '',
    status: 'Active',
    color: '#6366F1'
  });

  const { user } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, teamRes] = await Promise.all([
        getProjects(),
        getTeams()
      ]);
      setProjects(projRes.data);
      setTeams(teamRes.data);
      if (teamRes.data.length > 0) {
        setFormData(prev => ({ ...prev, team: teamRes.data[0]._id }));
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.team) {
      toast.error('Please select a team');
      return;
    }
    try {
      setIsSubmitting(true);
      await createProject(formData);
      toast.success('Project created successfully');
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        team: teams.length > 0 ? teams[0]._id : '',
        dueDate: '',
        status: 'Active',
        color: '#6366F1'
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFavorite = async (e, project) => {
    e.stopPropagation();
    try {
      await updateProject(project._id, { isFavorite: !project.isFavorite });
      setProjects(projects.map(p => p._id === project._id ? { ...p, isFavorite: !p.isFavorite } : p));
      toast.success(project.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0 && !showModal) {
    return <EmptyState 
      title="No Projects" 
      message="Get started by creating a new project." 
      icon={Briefcase} 
      actionLabel="Create Project" 
      onAction={() => setShowModal(true)} 
    />;
  }

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 mt-1">Manage and track your team initiatives.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl shadow-glow transition-all"
        >
          <Plus size={18} />
          <span className="font-medium">New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project, index) => {
          // Mock progress for now based on tasks completion
          const progress = project.status === 'Completed' ? 100 : Math.floor(Math.random() * 80) + 10;
          return (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: project.color }}
              ></div>

              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg text-white"
                  style={{ backgroundColor: project.color }}
                >
                  <Briefcase size={24} />
                </div>
                <div className="flex gap-2 relative group/menu">
                  <button 
                    onClick={(e) => toggleFavorite(e, project)}
                    className={`p-1.5 rounded-lg transition-colors ${project.isFavorite ? 'text-warning bg-warning/10' : 'text-slate-400 hover:text-warning hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <Star size={18} className={project.isFavorite ? 'fill-warning' : ''} />
                  </button>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors relative">
                    <MoreVertical size={18} />
                  </button>
                  {/* Dropdown Menu - Simple hover Implementation */}
                  <div className="absolute right-0 top-8 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 flex flex-col overflow-hidden">
                    <button 
                      className="text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, project._id)}
                      className="text-left px-4 py-2 text-sm text-danger hover:bg-danger/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{project.team?.name || 'No Team'}</p>

              <div className="mb-4">
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="text-primary">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Calendar size={14} />
                  {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Due Date'}
                </div>
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 3).map((member, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 overflow-hidden flex items-center justify-center">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{member.name?.charAt(0)}</span>
                      )}
                    </div>
                  ))}
                  {project.members?.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-medium text-slate-500">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Project</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                  placeholder="e.g. Website Redesign"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white resize-none"
                  placeholder="What is this project about?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Team</label>
                  <select 
                    required
                    value={formData.team}
                    onChange={(e) => setFormData({...formData, team: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                  >
                    <option value="" disabled>Select Team</option>
                    {teams.map(team => (
                      <option key={team._id} value={team._id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Theme Color</label>
                  <div className="flex gap-2 mt-2">
                    {['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({...formData, color})}
                        className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color, ringColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || teams.length === 0}
                  className="px-5 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-primary/30 disabled:opacity-70 flex items-center gap-2 transition-all"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Create Project
                </button>
              </div>
              
              {teams.length === 0 && (
                <div className="mt-2 text-sm text-danger text-center">
                  You need to create a team before you can create a project.
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;
