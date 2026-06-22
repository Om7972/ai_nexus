import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Plus, Search, Filter, GitBranch, Clock, Play,
  Edit, Copy, Trash2, MoreVertical, ArrowLeft
} from 'lucide-react';
import { fetchWorkflows, deleteWorkflow, duplicateWorkflow } from '../store/slices/workflowSlice';

const WorkflowsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workflows, pagination, loading } = useSelector((state) => state.workflow);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    dispatch(fetchWorkflows({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(fetchWorkflows({
      page: 1,
      limit: 20,
      search: e.target.value,
      status: statusFilter
    }));
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    dispatch(fetchWorkflows({
      page: 1,
      limit: 20,
      search: searchTerm,
      status
    }));
  };

  const handleDelete = async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await dispatch(deleteWorkflow(workflowId));
    }
  };

  const handleDuplicate = async (workflowId) => {
    const result = await dispatch(duplicateWorkflow(workflowId)).unwrap();
    navigate(`/agent-builder?id=${result._id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'draft': return 'bg-yellow-500/20 text-yellow-400';
      case 'archived': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/main-dashboard')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">AI Agent Workflows</h1>
              <p className="text-gray-400">Create and manage your AI automation workflows</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/agent-builder')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            <Plus size={20} />
            New Workflow
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search workflows..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleFilterChange('draft')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'draft' ? 'bg-yellow-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Draft
            </button>
          </div>
        </div>

        {/* Workflows Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading workflows...</p>
            </div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-white mb-2">No workflows yet</h3>
            <p className="text-gray-400 mb-6">Create your first AI agent workflow</p>
            <button
              onClick={() => navigate('/agent-builder')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              <Plus size={20} />
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow, index) => (
              <motion.div
                key={workflow._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                onClick={() => navigate(`/agent-builder?id=${workflow._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                      {workflow.name}
                    </h3>
                    {workflow.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{workflow.description}</p>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === workflow._id ? null : workflow._id);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {showMenu === workflow._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agent-builder?id=${workflow._id}`);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors text-left"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(workflow._id);
                            setShowMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors text-left"
                        >
                          <Copy size={16} />
                          Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(workflow._id);
                            setShowMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors text-left text-red-400"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <GitBranch size={16} />
                    <span>{workflow.nodes?.length || 0} nodes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Play size={16} />
                    <span>{workflow.executionCount || 0} runs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={14} />
                    {formatDate(workflow.updatedAt)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => dispatch(fetchWorkflows({ page, limit: 20, search: searchTerm, status: statusFilter }))}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowsList;
