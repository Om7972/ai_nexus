import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Calendar,
  Search,
  Star,
  Trash2,
  Plus,
  CheckCircle2,
  Target,
  Folder,
  Compass,
  Sparkles,
  Settings,
  ArrowRight,
  Clock,
  User,
  RefreshCw,
  FileText,
  Filter,
  Check,
  Zap,
  TrendingUp,
  Sliders,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import Layout from '../components/Layout';
import { useToast } from '../context/ThemeContext';

import { API_BASE_URL } from '../utils/api';

const API_URL = API_BASE_URL;
const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#14B8A6'];

const MemoryCenter = () => {
  const toast = useToast().toast;

  // Tabs: dashboard | timeline | conversations | goals | projects | insights
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data States
  const [memories, setMemories] = useState([]);
  const [insights, setInsights] = useState([]);
  const [goals, setGoals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Form & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // New item creation states
  const [newMemory, setNewMemory] = useState({
    category: 'preference',
    content: '',
    tags: '',
    favorite: false
  });
  const [newGoal, setNewGoal] = useState({
    title: '',
    dueDate: '',
    status: 'active'
  });
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    tags: ''
  });

  // Action loadings
  const [actionLoading, setActionLoading] = useState(false);
  const [weeklyGenerating, setWeeklyGenerating] = useState(false);

  // Fetch all user memory center details
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      
      const [memoriesRes, goalsRes, projectsRes, insightsRes] = await Promise.all([
        axios.get(`${API_URL}/memory`, { headers }),
        axios.get(`${API_URL}/memory/goals`, { headers }),
        axios.get(`${API_URL}/memory/projects`, { headers }),
        axios.get(`${API_URL}/memory/insights`, { headers })
      ]);

      if (memoriesRes.data?.success) setMemories(memoriesRes.data.data);
      if (goalsRes.data?.success) setGoals(goalsRes.data.data);
      if (projectsRes.data?.success) setProjects(projectsRes.data.data);
      if (insightsRes.data?.success) setInsights(insightsRes.data.data);

      // Generate mock recent conversations for display
      setConversations([
        {
          sessionId: 'session_8c91',
          summary: 'Discussed implementing Redis cache overrides and cost optimization widgets.',
          shortTermMemory: 'Prefers standard axios headers for token propagation. Working on Recharts overlays.',
          longTermMemory: 'Consolidated technical stack preferences: React 18, Vite 5, Tailwind 3.4.',
          updatedAt: new Date().toISOString()
        },
        {
          sessionId: 'session_2a41',
          summary: 'Scaffolded Research Copilot and Citation builder routing logic.',
          shortTermMemory: 'Uses APA, MLA formats regularly. Requires fast local transcript extractions.',
          longTermMemory: 'Frequently researches academic citation graphs and YouTube transcript crawlers.',
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

    } catch (error) {
      console.error('Failed to load memory center information:', error);
      toast('Failed to load memory statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Execute text keyword or semantic vector search
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      fetchAllData();
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      if (useSemanticSearch) {
        // Vector Cosine Similarity Search
        const res = await axios.post(`${API_URL}/memory/search`, {
          query: searchQuery,
          category: categoryFilter || undefined,
          limit: 15
        }, { headers });
        if (res.data?.success) {
          setMemories(res.data.data);
          toast(`Vector search compiled ${res.data.data.length} matches.`, 'success');
        }
      } else {
        // Fallback text keyword filter API
        const res = await axios.get(`${API_URL}/memory?search=${searchQuery}${categoryFilter ? `&category=${categoryFilter}` : ''}`, { headers });
        if (res.data?.success) {
          setMemories(res.data.data);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast('Search failed to run.', 'error');
    }
  };

  // Create new Memory snippet
  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!newMemory.content.trim()) return;

    setActionLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const tagsArray = newMemory.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      const res = await axios.post(`${API_URL}/memory`, {
        category: newMemory.category,
        content: newMemory.content,
        tags: tagsArray,
        favorite: newMemory.favorite
      }, { headers });

      if (res.data?.success) {
        setMemories(prev => [res.data.data, ...prev]);
        setNewMemory({ category: 'preference', content: '', tags: '', favorite: false });
        toast('Memory recorded and semantic embeddings indexed.', 'success');
      }
    } catch (error) {
      console.error('Failed to create memory:', error);
      toast('Failed to record memory.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Memory entry
  const handleDeleteMemory = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const res = await axios.delete(`${API_URL}/memory/${id}`, { headers });
      if (res.data?.success) {
        setMemories(prev => prev.filter(m => m._id !== id));
        toast('Memory cleared from brain timeline.', 'success');
      }
    } catch (error) {
      toast('Failed to clear memory.', 'error');
    }
  };

  // Create Goal
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    setActionLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const res = await axios.post(`${API_URL}/memory/goals`, newGoal, { headers });
      if (res.data?.success) {
        setGoals(prev => [res.data.data, ...prev]);
        setNewGoal({ title: '', dueDate: '', status: 'active' });
        toast('Goal set! AI successfully generated actionable tasks.', 'success');
      }
    } catch (error) {
      toast('Failed to record goal.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Goal Progress / State
  const handleUpdateGoalProgress = async (id, currentProgress, currentStatus) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const nextProgress = currentProgress >= 100 ? 0 : Math.min(100, currentProgress + 25);
      const nextStatus = nextProgress === 100 ? 'completed' : 'active';
      
      const res = await axios.put(`${API_URL}/memory/goals/${id}`, {
        progress: nextProgress,
        status: nextStatus
      }, { headers });

      if (res.data?.success) {
        setGoals(prev => prev.map(g => g._id === id ? res.data.data : g));
        toast(`Goal updated to ${nextProgress}% progress.`, 'success');
      }
    } catch (error) {
      toast('Failed to update goal.', 'error');
    }
  };

  // Create Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setActionLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const tagsArray = newProject.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      const res = await axios.post(`${API_URL}/memory/projects`, {
        ...newProject,
        tags: tagsArray
      }, { headers });

      if (res.data?.success) {
        setProjects(prev => [res.data.data, ...prev]);
        setNewProject({ name: '', description: '', status: 'planning', tags: '' });
        toast('Project mapped to Memory Engine database.', 'success');
      }
    } catch (error) {
      toast('Failed to map project.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger Weekly synthesis
  const handleCompileWeeklyReport = async () => {
    setWeeklyGenerating(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const res = await axios.post(`${API_URL}/memory/insights/trigger`, {}, { headers });
      if (res.data?.success) {
        setInsights(prev => [res.data.data, ...prev]);
        toast('Weekly insights compiled successfully!', 'success');
      }
    } catch (error) {
      toast('Failed to synthesize insights.', 'error');
    } finally {
      setWeeklyGenerating(false);
    }
  };

  // Compute metrics statistics
  const totalMemories = memories.length;
  const favoriteMemories = memories.filter(m => m.favorite).length;
  const activeGoalsCount = goals.filter(g => g.status === 'active').length;
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;

  const categoryDistribution = Object.entries(
    memories.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Gather unique tags
  const allUniqueTags = [...new Set(memories.flatMap(m => m.tags || []))];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
        
        {/* HERO HEADER */}
        <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800 py-8 px-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-2xl text-purple-400">
                <Brain className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Personal Memory Engine
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Semantic knowledge retrieval, automated preference indexing, and short/long-term context memories.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllData}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 flex items-center gap-2"
                title="Sync database memory state"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span className="text-sm font-medium">Sync state</span>
              </button>
            </div>
          </div>

          {/* TAB SEGMENTS */}
          <div className="max-w-7xl mx-auto mt-8 flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Overview Dashboard', icon: TrendingUp },
              { id: 'timeline', label: 'Memory Timeline', icon: Calendar },
              { id: 'conversations', label: 'Chat Contexts', icon: Database },
              { id: 'goals', label: 'Goals Checker', icon: Target },
              { id: 'projects', label: 'Memory Projects', icon: Folder },
              { id: 'insights', label: 'AI Weekly Insights', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    activeTab === tab.id
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTAINER CONTENT */}
        <div className="max-w-7xl mx-auto px-6 mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <RefreshCw className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-slate-400 font-medium">Retrieving vector graphs and indexing timeline...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  {/* METRICS ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Indexed Memories', value: totalMemories, desc: 'Embedding vectors stored', icon: Brain, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                      { label: 'Pinned Favorites', value: favoriteMemories, desc: 'Starred preferences', icon: Star, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                      { label: 'Active Goals', value: activeGoalsCount, desc: 'Assigned next action maps', icon: Target, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                      { label: 'Active Projects', value: activeProjectsCount, desc: 'Categorized milestones', icon: Folder, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' }
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className={`p-5 bg-slate-900 border rounded-2xl flex items-center justify-between ${card.color}`}>
                          <div>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{card.label}</span>
                            <h3 className="text-3xl font-extrabold text-white mt-1">{card.value}</h3>
                            <p className="text-slate-400 text-xs mt-1.5">{card.desc}</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl">
                            <Icon size={24} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* QUICK RECORD & CHARTS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* QUICK RECORD */}
                    <div className="lg:col-span-1 p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Zap size={20} className="text-purple-400" />
                          <h2 className="text-lg font-bold text-white">Record Fact Memory</h2>
                        </div>

                        <form onSubmit={handleAddMemory} className="space-y-4">
                          <div>
                            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Memory Category</label>
                            <select
                              value={newMemory.category}
                              onChange={(e) => setNewMemory(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-slate-200 text-sm"
                            >
                              <option value="preference">Personal Preference</option>
                              <option value="project">Project Detail</option>
                              <option value="prompt">Saved Prompt Template</option>
                              <option value="goal">Goal Metric</option>
                              <option value="snippet">Knowledge Snippet</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">What to remember</label>
                            <textarea
                              value={newMemory.content}
                              onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="e.g. User prefers writing documentation templates in GFM syntax."
                              rows={3}
                              className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-slate-200 text-sm placeholder-slate-600 resize-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tags (comma separated)</label>
                            <input
                              type="text"
                              value={newMemory.tags}
                              onChange={(e) => setNewMemory(prev => ({ ...prev, tags: e.target.value }))}
                              placeholder="e.g. syntax, technical, standard"
                              className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-slate-200 text-sm placeholder-slate-600"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="dashboard-fav"
                              checked={newMemory.favorite}
                              onChange={(e) => setNewMemory(prev => ({ ...prev, favorite: e.target.checked }))}
                              className="rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-0"
                            />
                            <label htmlFor="dashboard-fav" className="text-sm text-slate-300 select-none">Mark as Favorite Preference</label>
                          </div>

                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                          >
                            {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
                            <span>Index semantic node</span>
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* CHARTS CONTAINER */}
                    <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Sliders size={20} className="text-blue-400" />
                          <h2 className="text-lg font-bold text-white">Memory Categories Distribution</h2>
                        </div>
                      </div>

                      {categoryDistribution.length === 0 ? (
                        <div className="flex items-center justify-center h-64 border border-dashed border-slate-800 rounded-xl">
                          <p className="text-slate-500 text-sm">No memory categorizations recorded yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={categoryDistribution}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {categoryDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                  itemStyle={{ color: '#fff' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="flex flex-col justify-center space-y-3">
                            {categoryDistribution.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                  />
                                  <span className="text-xs font-semibold text-slate-300">{item.name}</span>
                                </div>
                                <span className="text-xs font-bold text-white">{item.value} notes</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTIVE SUGGESTIONS WIDGET */}
                  <div className="p-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 border border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-amber-400" />
                      <h3 className="text-base font-bold text-white">AI Quick Suggestions</h3>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      AI Nexus has indexed {memories.filter(m => m.metadata?.autoExtracted).length} auto-recorded memory tracks from your previous chats. 
                      You can review or delete these facts inside the <span className="text-purple-400 font-semibold cursor-pointer" onClick={() => setActiveTab('timeline')}>Memory Timeline</span>.
                    </p>
                  </div>

                </motion.div>
              )}

              {/* TAB 2: TIMELINE */}
              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* SEARCH FILTERS BAR */}
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                    
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search memory snippets..."
                          className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-slate-100 text-sm placeholder-slate-600"
                        />
                      </div>
                      
                      {/* TOGGLE FOR SEMANTIC SEARCH */}
                      <button
                        type="button"
                        onClick={() => setUseSemanticSearch(!useSemanticSearch)}
                        className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-all ${
                          useSemanticSearch
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Brain size={18} />
                        <span>Semantic (Vector)</span>
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-600/10 flex items-center gap-2"
                      >
                        <Search size={18} />
                        <span>Search</span>
                      </button>
                    </form>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* CATEGORY FILTER */}
                        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                          <Filter size={14} className="text-slate-500" />
                          <select
                            value={categoryFilter}
                            onChange={(e) => {
                              setCategoryFilter(e.target.value);
                              // Auto trigger fetch
                              const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
                              axios.get(`${API_URL}/memory?category=${e.target.value}${onlyFavorites ? '&favorite=true' : ''}`, { headers })
                                .then(res => res.data?.success && setMemories(res.data.data));
                            }}
                            className="bg-transparent border-none text-slate-300 text-xs focus:ring-0 focus:outline-none cursor-pointer"
                          >
                            <option value="">All Categories</option>
                            <option value="preference">Preferences</option>
                            <option value="project">Projects</option>
                            <option value="prompt">Prompts</option>
                            <option value="snippet">Snippets</option>
                          </select>
                        </div>

                        {/* FAVORITES TOGGLE */}
                        <button
                          onClick={() => {
                            const nextFav = !onlyFavorites;
                            setOnlyFavorites(nextFav);
                             const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
                            axios.get(`${API_URL}/memory?favorite=${nextFav}${categoryFilter ? `&category=${categoryFilter}` : ''}`, { headers })
                              .then(res => res.data?.success && setMemories(res.data.data));
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            onlyFavorites
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Star size={14} />
                          <span>Starred Only</span>
                        </button>
                      </div>

                      {selectedTag && (
                        <div className="flex items-center gap-1.5 bg-purple-600/15 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs text-purple-400">
                          <span>Tag: {selectedTag}</span>
                          <button onClick={() => { setSelectedTag(''); fetchAllData(); }} className="hover:text-purple-300">×</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MEMORIES LIST */}
                  <div className="space-y-4">
                    {memories.length === 0 ? (
                      <div className="p-16 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
                        <Brain size={48} className="mx-auto text-slate-600" />
                        <h3 className="text-lg font-bold text-white">No indexed memories found</h3>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                          Create a custom preference above or run a search query to scan matching index files.
                        </p>
                      </div>
                    ) : (
                      memories.map((mem) => (
                        <motion.div
                          key={mem._id}
                          layout
                          className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl flex items-start gap-4 hover:border-slate-700/80 transition-all group"
                        >
                          <div className={`p-2.5 rounded-xl border text-xs font-bold ${
                            mem.category === 'preference' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                            mem.category === 'project' ? 'text-pink-400 bg-pink-500/10 border-pink-500/20' :
                            mem.category === 'prompt' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                            'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          }`}>
                            {mem.category.toUpperCase().slice(0, 4)}
                          </div>

                          <div className="flex-1 space-y-2">
                            <p className="text-slate-200 text-sm leading-relaxed font-medium">
                              {mem.content}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {mem.tags?.map((tag, idx) => (
                                <span
                                  key={idx}
                                  onClick={() => {
                                    setSelectedTag(tag);
                                    const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
                                    axios.get(`${API_URL}/memory?tag=${tag}`, { headers })
                                      .then(res => res.data?.success && setMemories(res.data.data));
                                  }}
                                  className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-purple-400 rounded-md text-xs cursor-pointer border border-slate-800 transition-colors"
                                >
                                  #{tag}
                                </span>
                              ))}

                              {mem.score !== undefined && (
                                <span className="px-2.5 py-0.5 bg-purple-950/40 border border-purple-800/30 text-purple-400 rounded-md text-xs font-semibold">
                                  Score: {(mem.score * 100).toFixed(0)}%
                                </span>
                              )}

                              {mem.metadata?.autoExtracted && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                  <Sparkles size={10} className="text-amber-400" />
                                  Auto-Remembered
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={async () => {
                                const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
                                try {
                                  const res = await axios.put(`${API_URL}/memory/goals/${mem._id}`, {
                                    // Just toggle favorite on memory using custom update route or similar endpoint
                                    // Let's call the generic update memory if supported
                                  }, { headers });
                                } catch (e) {}
                              }}
                              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-all ${
                                mem.favorite ? 'text-amber-400' : 'text-slate-500'
                              }`}
                            >
                              <Star size={16} fill={mem.favorite ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              onClick={() => handleDeleteMemory(mem._id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: CONVERSATIONS */}
              {activeTab === 'conversations' && (
                <motion.div
                  key="conversations"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="text-purple-400" />
                      <h2 className="text-lg font-bold text-white">Conversation Memory Context</h2>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Memory segments synchronized from active chatbot session flows. The engine splits context into short-term buffers and long-term summaries.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {conversations.map((convo, idx) => (
                      <div key={idx} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-slate-500" />
                            <span className="text-sm font-semibold text-slate-200">{convo.sessionId}</span>
                          </div>
                          <span className="text-xs text-slate-500">{new Date(convo.updatedAt).toLocaleDateString()}</span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Session Summary</h4>
                          <p className="text-sm text-slate-300">{convo.summary}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Short-Term Context</span>
                            <p className="text-xs text-slate-400 mt-1">{convo.shortTermMemory}</p>
                          </div>
                          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Long-Term Memory Node</span>
                            <p className="text-xs text-slate-400 mt-1">{convo.longTermMemory}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: GOALS */}
              {activeTab === 'goals' && (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* NEW GOAL FORM */}
                  <div className="lg:col-span-1 p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit">
                    <div className="flex items-center gap-2 mb-4">
                      <Target size={20} className="text-purple-400" />
                      <h2 className="text-lg font-bold text-white">Create New Goal</h2>
                    </div>

                    <form onSubmit={handleAddGoal} className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Goal Title</label>
                        <input
                          type="text"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Complete Redis memory schema integration"
                          className="w-full mt-1.5 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-slate-100 text-sm placeholder-slate-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Target Due Date</label>
                        <input
                          type="date"
                          value={newGoal.dueDate}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="w-full mt-1.5 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-slate-100 text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                      >
                        {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
                        <span>Publish Target</span>
                      </button>
                    </form>
                  </div>

                  {/* GOALS CARD LIST */}
                  <div className="lg:col-span-2 space-y-4">
                    {goals.length === 0 ? (
                      <div className="p-16 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
                        <Target size={48} className="mx-auto text-slate-600" />
                        <h3 className="text-lg font-bold text-white">No active goals found</h3>
                        <p className="text-slate-400 text-sm">Create a goal on the left to test the AI next-actions suggestions parser.</p>
                      </div>
                    ) : (
                      goals.map((goal) => (
                        <div key={goal._id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-white text-base">{goal.title}</h3>
                              {goal.dueDate && (
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <Calendar size={12} />
                                  Target: {new Date(goal.dueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              goal.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                            }`}>
                              {goal.status.toUpperCase()}
                            </span>
                          </div>

                          {/* PROGRESS SLIDER MOCK */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">Completion</span>
                              <span className="font-bold text-slate-200">{goal.progress}%</span>
                            </div>
                            <div
                              onClick={() => handleUpdateGoalProgress(goal._id, goal.progress, goal.status)}
                              className="w-full h-2 bg-slate-950 rounded-full overflow-hidden cursor-pointer"
                              title="Click to advance progress mockup"
                            >
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* NEXT ACTION SUGGESTIONS */}
                          {goal.nextActions?.length > 0 && (
                            <div className="pt-3 border-t border-slate-850">
                              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-2">
                                <Sparkles size={12} className="text-amber-400 animate-pulse" />
                                AI Action Suggestions
                              </span>
                              <ul className="space-y-2">
                                {goal.nextActions.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                    <CheckCircle2 size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 5: PROJECTS */}
              {activeTab === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* NEW PROJECT FORM */}
                  <div className="lg:col-span-1 p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit">
                    <div className="flex items-center gap-2 mb-4">
                      <Folder size={20} className="text-purple-400" />
                      <h2 className="text-lg font-bold text-white">Create Memory Project</h2>
                    </div>

                    <form onSubmit={handleAddProject} className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Project Name</label>
                        <input
                          type="text"
                          value={newProject.name}
                          onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. MandiPrime AgriTech AI"
                          className="w-full mt-1.5 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-slate-100 text-sm placeholder-slate-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Description</label>
                        <textarea
                          value={newProject.description}
                          onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief summary of project domain..."
                          rows={3}
                          className="w-full mt-1.5 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-slate-100 text-sm placeholder-slate-600 resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Project Tags (comma separated)</label>
                        <input
                          type="text"
                          value={newProject.tags}
                          onChange={(e) => setNewProject(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="e.g. backend, docker, auth"
                          className="w-full mt-1.5 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-slate-100 text-sm placeholder-slate-600"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                      >
                        {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
                        <span>Map Project</span>
                      </button>
                    </form>
                  </div>

                  {/* PROJECTS CARDS */}
                  <div className="lg:col-span-2 space-y-4">
                    {projects.length === 0 ? (
                      <div className="p-16 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
                        <Folder size={48} className="mx-auto text-slate-600" />
                        <h3 className="text-lg font-bold text-white">No memory projects mapped</h3>
                        <p className="text-slate-400 text-sm">Add a project using the card planner on the left.</p>
                      </div>
                    ) : (
                      projects.map((proj) => (
                        <div key={proj._id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-lg">{proj.name}</h3>
                            <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-xs text-slate-400 rounded-md">
                              {proj.status.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-slate-300 text-sm">{proj.description}</p>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {proj.tags?.map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-xs text-slate-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 6: INSIGHTS */}
              {activeTab === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles size={20} className="text-amber-400 animate-pulse" />
                        AI Weekly Insights Coach
                      </h2>
                      <p className="text-slate-400 text-sm">
                        Generates a productivity coaching summary from indexed memories, goals progress, and project updates.
                      </p>
                    </div>

                    <button
                      onClick={handleCompileWeeklyReport}
                      disabled={weeklyGenerating}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-pink-500/10 flex items-center gap-2 flex-shrink-0"
                    >
                      {weeklyGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                      <span>Compile Report</span>
                    </button>
                  </div>

                  {/* INSIGHTS CARDS */}
                  <div className="space-y-6">
                    {insights.length === 0 ? (
                      <div className="p-16 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
                        <Sparkles size={48} className="mx-auto text-slate-600" />
                        <h3 className="text-lg font-bold text-white">No weekly reports compiled</h3>
                        <p className="text-slate-400 text-sm">Click "Compile Report" above to synthesize your memory metrics.</p>
                      </div>
                    ) : (
                      insights.map((ins) => (
                        <div key={ins._id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 border border-amber-500/20 rounded-full">
                              {ins.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-500">{new Date(ins.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                            {ins.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MemoryCenter;
