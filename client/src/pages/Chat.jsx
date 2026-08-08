import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Send, Paperclip, Image, Smile, Phone, Video, Info, Loader2
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { getTeams, getMessages, sendMessage } from '../services/api';
import { socket, connectSocket } from '../services/socket';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user, token } = useAuthStore();
  const [teams, setTeams] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchTeams();
    if (token) {
      connectSocket(token);
      
      socket.on('message_received', (newMessage) => {
        setMessages((prev) => {
          // Add if it belongs to current active chat
          if (activeChat && newMessage.chatType === 'team' && newMessage.team === activeChat._id) {
            return [...prev, newMessage];
          }
          return prev;
        });
      });
    }
    
    return () => {
      socket.off('message_received');
    };
  }, [token, activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
      // Join socket room
      socket.emit('join_room', activeChat._id);
    }
  }, [activeChat]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await getTeams();
      setTeams(res.data);
      if (res.data.length > 0) {
        setActiveChat(res.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load teams for chat');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (teamId) => {
    try {
      setLoadingMessages(true);
      const res = await getMessages({ team: teamId });
      setMessages(res.data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    try {
      const payload = {
        content: inputText,
        chatType: 'team',
        team: activeChat._id
      };
      
      // Optimistic update
      const tempMsg = {
        _id: Date.now().toString(),
        content: inputText,
        sender: user,
        chatType: 'team',
        team: activeChat._id,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMsg]);
      setInputText('');

      const res = await sendMessage(payload);
      
      // Replace temp with real
      setMessages(prev => prev.map(m => m._id === tempMsg._id ? res.data : m));
    } catch (error) {
      toast.error('Failed to send message');
      fetchMessages(activeChat._id); // reload on failure
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] glass-card rounded-2xl flex overflow-hidden border border-white/20 dark:border-slate-700/50 shadow-sm relative">
      
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Team Chats</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search teams..." 
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {teams.length === 0 ? (
            <p className="text-center text-slate-500 mt-4 text-sm">No teams found.</p>
          ) : (
            teams.map((team) => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                key={team._id} 
                onClick={() => setActiveChat(team)}
                className={`p-3 mb-1 rounded-xl cursor-pointer transition-colors flex items-center gap-3 ${activeChat?._id === team._id ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-primary/20' : 'hover:bg-white dark:hover:bg-slate-800'}`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-semibold truncate ${activeChat?._id === team._id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{team.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{team.description}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/30 dark:bg-slate-900/30">
        
        {/* Header */}
        {activeChat ? (
          <>
            <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {activeChat.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{activeChat.name}</h3>
                  <span className="text-xs text-success font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span> {activeChat.members?.length || 0} Members
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-slate-500">
                <button className="hover:text-primary transition-colors"><Phone size={20} /></button>
                <button className="hover:text-primary transition-colors"><Video size={20} /></button>
                <button className="hover:text-primary transition-colors"><Info size={20} /></button>
              </div>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar relative">
              {loadingMessages ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.sender?._id === user?._id;
                  
                  return (
                    <div key={msg._id || index} className={`flex gap-3 max-w-[70%] ${isMine ? 'self-end flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-600">
                        {msg.sender?.avatar ? (
                          <img src={msg.sender.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          msg.sender?.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`text-xs text-slate-500 mb-1 mx-1 ${isMine ? 'hidden' : 'block'}`}>
                          {msg.sender?.name}
                        </div>
                        <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                          isMine 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50 rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                        <span className={`text-[10px] text-slate-400 mt-1 mx-1`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                  <Paperclip size={20} />
                </button>
                <button type="button" className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                  <Image size={20} />
                </button>
                
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..." 
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/50"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                    <Smile size={20} />
                  </button>
                </div>
                
                <button type="submit" disabled={!inputText.trim()} className="p-3 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-glow transition-all active:scale-95 flex items-center justify-center disabled:opacity-50">
                  <Send size={18} className="ml-1" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Info size={48} className="mb-4 opacity-50" />
            <p>Select a team to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
