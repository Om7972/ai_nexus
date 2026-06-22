import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, Search, MessageSquare, BarChart3,
  Filter, Grid, List, Loader, Plus, X, Edit2
} from 'lucide-react';

import FileUploader from '../components/knowledge/FileUploader';
import FileCard from '../components/knowledge/FileCard';
import ChatInterface from '../components/knowledge/ChatInterface';

import {
  uploadFile,
  fetchFiles,
  updateFile,
  deleteFile,
  searchKnowledge,
  chatWithKnowledge,
  fetchStatistics,
  clearSearchResults,
  clearCurrentChat
} from '../store/slices/knowledgeSlice';

const KnowledgeVault = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { files, searchResults, currentChat, statistics, loading, uploading, searching, chatting } = useSelector(
    (state) => state.knowledge
  );

  const [activeTab, setActiveTab] = useState('files'); // files, upload, search, chat
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [collectionFilter, setCollectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editName, setEditName] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    dispatch(fetchFiles({ page: 1, limit: 50 }));
    dispatch(fetchStatistics());
  }, [dispatch]);

  useEffect(() => {
    // Update chat messages when currentChat changes
    if (currentChat) {
      const newMessage = {
        role: 'assistant',
        content: currentChat.answer,
        sources: currentChat.sources,
        tokenUsage: currentChat.tokenUsage
      };
      setChatMessages(prev => [...prev, newMessage]);
      setCurrentSessionId(currentChat.sessionId);
    }
  }, [currentChat]);

  const handleUpload = async (file, collection) => {
    await dispatch(uploadFile({ file, collection, tags: [] })).unwrap();
    dispatch(fetchFiles({ page: 1, limit: 50 }));
    dispatch(fetchStatistics());
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await dispatch(searchKnowledge({
        query: searchQuery,
        fileIds: selectedFiles.length > 0 ? selectedFiles : null,
        limit: 10,
        threshold: 0.65
      }));
    }
  };

  const handleChatSubmit = async (message) => {
    // Add user message immediately
    const userMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);

    await dispatch(chatWithKnowledge({
      message,
      sessionId: currentSessionId,
      fileIds: selectedFiles.length > 0 ? selectedFiles : null
    }));
  };

  const handleDeleteFile = async (file) => {
    if (window.confirm(`Delete "${file.originalName}"?`)) {
      await dispatch(deleteFile(file._id));
      dispatch(fetchStatistics());
    }
  };

  const handleEditFile = (file) => {
    setEditingFile(file);
    setEditName(file.originalName);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editingFile && editName.trim()) {
      await dispatch(updateFile({
        id: editingFile._id,
        data: { originalName: editName }
      }));
      setShowEditModal(false);
      setEditingFile(null);
    }
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const filteredFiles = files.filter(file => {
    if (collectionFilter && file.collection !== collectionFilter) return false;
    if (statusFilter && file.processingStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/main-dashboard')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Knowledge Vault
                </h1>
                <p className="text-sm text-gray-400">Upload, search, and chat with your documents</p>
              </div>
            </div>

            {/* Stats */}
            {statistics && (
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{statistics.totalFiles}</div>
                  <div className="text-gray-400">Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{statistics.totalChunks}</div>
                  <div className="text-gray-400">Chunks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {(statistics.totalTokens / 1000).toFixed(1)}K
                  </div>
                  <div className="text-gray-400">Tokens</div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'files', label: 'Files', icon: Grid },
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'search', label: 'Search', icon: Search },
              { id: 'chat', label: 'Chat', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Files Tab */}
          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <select
                  value={collectionFilter}
                  onChange={(e) => setCollectionFilter(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Collections</option>
                  <option value="personal">Personal</option>
                  <option value="workspace">Workspace</option>
                  <option value="shared">Shared</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                <div className="flex-1" />

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>

              {/* Files Grid/List */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader className="w-12 h-12 animate-spin text-blue-400" />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-16">
                  <Upload size={64} className="mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-bold text-white mb-2">No Files Yet</h3>
                  <p className="text-gray-400 mb-6">Upload your first document to get started</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                  >
                    Upload Document
                  </button>
                </div>
              ) : (
                <div className={`
                  ${viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                  }
                `}>
                  {filteredFiles.map(file => (
                    <FileCard
                      key={file._id}
                      file={file}
                      onView={() => handleFileSelect(file._id)}
                      onEdit={() => handleEditFile(file)}
                      onDelete={() => handleDeleteFile(file)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Upload Documents</h2>
                <p className="text-gray-400">
                  Upload PDF, DOCX, TXT, or CSV files to your knowledge base
                </p>
              </div>

              <FileUploader onUpload={handleUpload} collection="personal" />
            </motion.div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Semantic Search</h2>
                <p className="text-gray-400">
                  Search your documents using natural language
                </p>
              </div>

              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask a question or search for information..."
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {searching ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <Search size={20} />
                    )}
                    Search
                  </button>
                </div>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Results:</h3>
                  {searchResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{result.filename}</h4>
                          <p className="text-sm text-gray-400">
                            Similarity: {(result.similarity * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{result.content}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[calc(100vh-250px)]"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl h-full">
                <ChatInterface
                  onSendMessage={handleChatSubmit}
                  messages={chatMessages}
                  isLoading={chatting}
                  sources={currentChat?.sources}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Rename File</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white mb-4"
              placeholder="Enter new name"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeVault;
