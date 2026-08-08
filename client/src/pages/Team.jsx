import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone, MoreHorizontal, Circle, Activity, CheckCircle2, UserPlus, Loader2, X } from 'lucide-react';
import { getTeams, createTeam, inviteMember } from '../services/api';
import toast from 'react-hot-toast';
import  useAuthStore  from '../store/useAuthStore';

const colors = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-purple-500 to-fuchsia-500'
];

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTeam, setActiveTeam] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const { user } = useAuthStore();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await getTeams();
      setTeams(res.data);
      if (res.data.length > 0) {
        setActiveTeam(res.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!activeTeam) return;
    try {
      setIsInviting(true);
      await inviteMember(activeTeam._id, { email: inviteEmail, role: inviteRole });
      toast.success('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      setIsInviting(true);
      await createTeam({ name: newTeamName, description: newTeamDesc });
      toast.success('Team created successfully!');
      setShowCreateModal(false);
      setNewTeamName('');
      setNewTeamDesc('');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {activeTeam ? activeTeam.name : 'Team Directory'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {activeTeam ? activeTeam.description : 'Manage your team members, view workload and performance.'}
          </p>
        </div>
        <div className="flex gap-3">
          {teams.length > 1 && (
            <select 
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
              value={activeTeam?._id}
              onChange={(e) => setActiveTeam(teams.find(t => t._id === e.target.value))}
            >
              {teams.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          )}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 px-4 py-2.5 rounded-xl font-medium transition-all"
          >
            Create Team
          </button>
          {activeTeam && (
            <button 
              onClick={() => setShowInviteModal(true)}
              className="bg-primary text-white hover:bg-primary-dark px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2"
            >
              <UserPlus size={18} />
              Invite Member
            </button>
          )}
        </div>
      </div>

      {!activeTeam && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <UserPlus size={40} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No teams found</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">You don't belong to any teams yet. Create a new team or wait for an invitation.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-primary/30 transition-all"
          >
            Create Your First Team
          </button>
        </div>
      )}

      {activeTeam && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTeam.members.map((memberObj, index) => {
          const member = memberObj.user;
          const bg = colors[index % colors.length];
          const isCurrentUser = user && user._id === member._id;
          
          return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={member._id}
            className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${bg}`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="relative">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                ) : (
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                    {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-center">
                  <Circle size={10} className="fill-success text-success" />
                </div>
              </div>
              
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {member.name} {isCurrentUser && '(You)'}
              </h3>
              <p className="text-sm text-slate-500 font-medium">{memberObj.role}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Workload</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">50%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-success"
                    style={{ width: '50%' }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <CheckCircle2 size={12} />
                    <span>Completed</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">12</p>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Activity size={12} />
                    <span>Active</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">3</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                <MessageCircle size={16} />
                Message
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors">
                <Mail size={16} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors">
                <Phone size={16} />
              </button>
            </div>
          </motion.div>
          );
        })}
      </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                  placeholder="Enter email..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isInviting}
                  className="px-5 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-primary/30 disabled:opacity-70 flex items-center gap-2"
                >
                  {isInviting && <Loader2 size={16} className="animate-spin" />}
                  Send Invitation
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Team</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Team Name</label>
                <input 
                  type="text" 
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                  placeholder="e.g. Engineering, Design..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white resize-none"
                  placeholder="What is this team for?"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isInviting}
                  className="px-5 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-primary/30 disabled:opacity-70 flex items-center gap-2"
                >
                  {isInviting && <Loader2 size={16} className="animate-spin" />}
                  Create Team
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Team;
