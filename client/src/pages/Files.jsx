import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { File, Image as ImageIcon, FileText, Upload, MoreVertical, Download, Search, Folder, Video, Music, FileArchive, Loader2, Trash2 } from 'lucide-react';
import { getFiles, uploadFile, deleteFile } from '../services/api';
import toast from 'react-hot-toast';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await getFiles();
      setFiles(res.data);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    // Optionally append team/project/task ID here if available in context
    
    try {
      setIsUploading(true);
      const res = await uploadFile(formData);
      setFiles([res.data, ...files]);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteFile(id);
      setFiles(files.filter(f => f._id !== id));
      toast.success('File deleted');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileCategory = (mimeType) => {
    if (!mimeType) return 'document';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return 'archive';
    return 'document';
  };

  const getFileIcon = (mimeType) => {
    const category = getFileCategory(mimeType);
    switch(category) {
      case 'image': return <ImageIcon className="text-blue-500" />;
      case 'pdf': return <FileText className="text-red-500" />;
      case 'video': return <Video className="text-purple-500" />;
      case 'audio': return <Music className="text-pink-500" />;
      case 'archive': return <FileArchive className="text-amber-500" />;
      default: return <File className="text-emerald-500" />;
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const stats = {
    images: files.filter(f => getFileCategory(f.mimeType) === 'image').length,
    documents: files.filter(f => ['document', 'pdf'].includes(getFileCategory(f.mimeType))).length,
    videos: files.filter(f => getFileCategory(f.mimeType) === 'video').length,
    archives: files.filter(f => getFileCategory(f.mimeType) === 'archive').length,
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Files & Assets</h1>
          <p className="text-slate-500 mt-1">Manage project documents and media.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap disabled:opacity-70"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span className="font-medium hidden sm:inline">Upload</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Images', count: stats.images, icon: ImageIcon, color: 'bg-blue-500' },
          { label: 'Documents', count: stats.documents, icon: FileText, color: 'bg-red-500' },
          { label: 'Videos', count: stats.videos, icon: Video, color: 'bg-purple-500' },
          { label: 'Archives', count: stats.archives, icon: FileArchive, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 rounded-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-700/50 hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{stat.label}</h3>
              <p className="text-sm text-slate-500">{stat.count} files</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">No files found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredFiles.map((file, i) => (
                  <motion.tr 
                    key={file._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer truncate max-w-[200px] sm:max-w-xs">
                          {file.name}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {file.uploader?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatSize(file.size)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={file.url} 
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Download size={16} />
                        </a>
                        <button 
                          onClick={() => handleDelete(file._id)}
                          className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Files;
