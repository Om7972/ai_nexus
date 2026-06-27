import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ShieldCheck,
  Settings,
  HelpCircle,
  Bell,
  RefreshCw,
  Zap,
  Layers,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import Layout from '../components/Layout';
import { useToast } from '../context/ThemeContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';

import { API_BASE_URL } from '../utils/api';

const API_URL = API_BASE_URL;

// Harmonies for Charts
const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

const CostCenter = () => {
  const toast = useToast().toast;

  // State Management
  const [activeTab, setActiveTab] = useState('overview'); // overview | budget | optimization | logs
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [updatingBudget, setUpdatingBudget] = useState(false);

  // API Data States
  const [overview, setOverview] = useState({
    totalTokens: 0,
    totalCost: 0,
    totalRequests: 0,
    dailySpend: 0,
    monthlySpend: 0,
    dailyBudget: 5,
    monthlyBudget: 50,
    mostUsedModel: 'gemini-1.5-flash',
    subscriptionTier: 'Free User',
    tokenLimitMonthly: 50000,
    requestLimitDaily: 100,
    costByFeature: []
  });

  const [analytics, setAnalytics] = useState({
    daily: [],
    models: [],
    features: []
  });

  const [recommendations, setRecommendations] = useState([]);

  // Budget settings form
  const [budgetForm, setBudgetForm] = useState({
    dailyBudget: 5,
    monthlyBudget: 50,
    emailNotifications: true,
    alertThresholds: [50, 80, 100]
  });

  // Fetch all endpoints
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };

      const [overviewRes, analyticsRes, recsRes] = await Promise.all([
        axios.get(`${API_URL}/costs/overview`, { headers }),
        axios.get(`${API_URL}/costs/analytics?period=${period}`, { headers }),
        axios.get(`${API_URL}/costs/recommendations`, { headers })
      ]);

      if (overviewRes.data?.success) {
        const data = overviewRes.data.data;
        setOverview(data);
        setBudgetForm({
          dailyBudget: data.dailyBudget,
          monthlyBudget: data.monthlyBudget,
          emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : true,
          alertThresholds: data.alertThresholds || [50, 80, 100]
        });
      }

      if (analyticsRes.data?.success) {
        setAnalytics(analyticsRes.data.data);
      }

      if (recsRes.data?.success) {
        setRecommendations(recsRes.data.data);
      }

    } catch (err) {
      console.error('Error fetching cost stats:', err);
      toast.error('Failed to load governance stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setUpdatingBudget(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const response = await axios.post(`${API_URL}/costs/budget`, budgetForm, { headers });

      if (response.data?.success) {
        toast.success('Budget rules and thresholds saved successfully.');
        setOverview(prev => ({
          ...prev,
          dailyBudget: Number(budgetForm.dailyBudget),
          monthlyBudget: Number(budgetForm.monthlyBudget),
          emailNotifications: budgetForm.emailNotifications
        }));
      }
    } catch (err) {
      console.error('Failed to update budget settings:', err);
      toast.error('Failed to update budget limits.');
    } finally {
      setUpdatingBudget(false);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    try {
      const headers = ['Metric', 'Value'];
      const rows = [
        ['Subscription Tier', overview.subscriptionTier],
        ['Monthly Limit (Tokens)', overview.tokenLimitMonthly],
        ['Daily Limit (Requests)', overview.requestLimitDaily],
        ['Total Cost (USD)', `$${overview.totalCost.toFixed(4)}`],
        ['Total Requests', overview.totalRequests],
        ['Total Tokens Consumed', overview.totalTokens],
        ['Current Daily Spend', `$${overview.dailySpend.toFixed(4)}`],
        ['Current Monthly Spend', `$${overview.monthlySpend.toFixed(4)}`],
        ['Daily Cost Budget Limit', `$${overview.dailyBudget.toFixed(2)}`],
        ['Monthly Cost Budget Limit', `$${overview.monthlyBudget.toFixed(2)}`],
        ['Most Active Model', overview.mostUsedModel]
      ];

      // Add feature breakdowns
      overview.costByFeature.forEach(item => {
        rows.push([`Cost for Feature: ${item.feature}`, `$${item.cost.toFixed(4)}`]);
      });

      // Daily trend headers
      rows.push([]);
      rows.push(['Daily Cost Log Date', 'Spend (USD)', 'Token Count', 'Request Volume']);
      analytics.daily.forEach(day => {
        rows.push([day.date, day.cost.toFixed(4), day.tokens, day.requests]);
      });

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ai_nexus_cost_report_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV report exported and downloaded.');
    } catch (error) {
      toast.error('Failed to compile CSV.');
    }
  };

  // PDF Report layout print
  const handlePrintPDF = () => {
    window.print();
  };

  // Helper percentage calculations
  const dailySpendPercent = Math.min((overview.dailySpend / (overview.dailyBudget || 1)) * 100, 100);
  const monthlySpendPercent = Math.min((overview.monthlySpend / (overview.monthlyBudget || 1)) * 100, 100);

  return (
    <Layout>
      <div className="space-y-8 pb-12 print:bg-white print:text-black">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 print:border-none">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 print:text-black">
              <Coins className="w-8 h-8 text-blue-400" />
              AI Cost Center & Governance
            </h1>
            <p className="text-gray-400 mt-1 print:text-gray-600">
              Monitor multi-model API spending, adjust budget notification thresholds, and apply smart fallbacks.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto print:hidden">
            {/* Range Filters */}
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              {['7d', '14d', '30d'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPeriod(opt)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    period === opt ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {opt === '7d' ? '7 Days' : opt === '14d' ? '14 Days' : '30 Days'}
                </button>
              ))}
            </div>

            {/* Print & CSV buttons */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              CSV Export
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              PDF Print
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Loading overlay */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1. Subscription & Rate Info */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-xl overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Plan & Status</span>
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mt-3 group-hover:text-blue-300 transition-colors">
                  {overview.subscriptionTier}
                </h3>
                <div className="mt-4 flex flex-col gap-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Monthly Tokens:</span>
                    <span className="text-white font-semibold">{overview.tokenLimitMonthly.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Request Limit:</span>
                    <span className="text-white font-semibold">{overview.requestLimitDaily}</span>
                  </div>
                </div>
              </motion.div>

              {/* 2. Total Token Consumption */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-xl overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Tokens Used</span>
                  <Layers className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mt-3 group-hover:text-purple-300 transition-colors">
                  {overview.totalTokens.toLocaleString()}
                </h3>
                <div className="mt-4 flex flex-col gap-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Total API calls:</span>
                    <span className="text-white font-semibold">{overview.totalRequests} requests</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average cost/call:</span>
                    <span className="text-white font-semibold">
                      ${overview.totalRequests > 0 ? (overview.totalCost / overview.totalRequests).toFixed(5) : '0.00000'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* 3. Cost spend (Daily limit widget) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-xl overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Daily Spending</span>
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mt-3 group-hover:text-green-300 transition-colors">
                  ${overview.dailySpend.toFixed(3)}
                  <span className="text-xs font-normal text-gray-400 ml-1">/ ${overview.dailyBudget} budget</span>
                </h3>
                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dailySpendPercent > 80 ? 'bg-red-500' : dailySpendPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${dailySpendPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                    <span>Spent: {dailySpendPercent.toFixed(1)}%</span>
                    <span>Remaining: ${(overview.dailyBudget - overview.dailySpend).toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>

              {/* 4. Cost spend (Monthly limit widget) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="relative bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-xl overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Monthly Spending</span>
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mt-3 group-hover:text-amber-300 transition-colors">
                  ${overview.monthlySpend.toFixed(3)}
                  <span className="text-xs font-normal text-gray-400 ml-1">/ ${overview.monthlyBudget} budget</span>
                </h3>
                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        monthlySpendPercent > 80 ? 'bg-red-500' : monthlySpendPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${monthlySpendPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                    <span>Spent: {monthlySpendPercent.toFixed(1)}%</span>
                    <span>Remaining: ${(overview.monthlyBudget - overview.monthlySpend).toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Dashboard Tabs Selector */}
            <div className="flex border-b border-white/10 print:hidden">
              {[
                { id: 'overview', label: 'Charts & Breakdown' },
                { id: 'budget', label: 'Budget Limits & Thresholds' },
                { id: 'optimization', label: 'Smart Suggestions & Cache' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Views */}
            <AnimatePresence mode="wait">
              {/* Tab 1: Charts & Breakdown */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  {/* First row of charts: Daily Trend (Line) & Cost by Model (Pie) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Daily Cost Line chart */}
                    <div className="lg:col-span-2 bg-white/5 rounded-xl p-5 border border-white/10 shadow-xl">
                      <div className="mb-4">
                        <h4 className="text-md font-bold text-white">Daily Cost & Token Spending Trend</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Visualize API request patterns and expenses.</p>
                      </div>
                      <div className="h-72 w-full">
                        {analytics.daily.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '10px' }} />
                              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '10px' }} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)' }}
                                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                itemStyle={{ color: '#3B82F6' }}
                              />
                              <Line type="monotone" dataKey="cost" name="Spend ($)" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                              <Line type="monotone" dataKey="requests" name="Calls" stroke="#10B981" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex justify-center items-center h-full text-sm text-gray-500">
                            No data available for this range
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Model Breakdown Pie chart */}
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10 shadow-xl">
                      <div className="mb-4">
                        <h4 className="text-md font-bold text-white">Cost Distribution by Model</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Model choices proportional to cost burden.</p>
                      </div>
                      <div className="h-60 flex justify-center items-center relative">
                        {analytics.models.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analytics.models}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="cost"
                                nameKey="model"
                              >
                                {analytics.models.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Spend']}
                                contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-sm text-gray-500">No model usage reported</div>
                        )}
                        {/* Overlay Text */}
                        <div className="absolute flex flex-col justify-center items-center">
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Active Model</span>
                          <span className="text-sm font-extrabold text-white truncate max-w-[120px]">{overview.mostUsedModel}</span>
                        </div>
                      </div>
                      {/* Legend List */}
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        {analytics.models.map((model, idx) => (
                          <div key={model.model} className="flex items-center gap-1.5 truncate">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                            <span className="text-gray-300 truncate" title={model.model}>{model.model}</span>
                            <span className="text-gray-500 ml-auto font-medium">${model.cost.toFixed(3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Bar Chart of feature cost & detailed feature metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Feature Cost Bar Chart */}
                    <div className="lg:col-span-2 bg-white/5 rounded-xl p-5 border border-white/10 shadow-xl">
                      <div className="mb-4">
                        <h4 className="text-md font-bold text-white">Aggregated Cost by Feature module</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Determine which workflows or sandboxes consume budgets.</p>
                      </div>
                      <div className="h-64">
                        {analytics.features.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.features} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="feature" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '10px' }} />
                              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '10px' }} />
                              <Tooltip
                                formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Cost']}
                                contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)' }}
                              />
                              <Bar dataKey="cost" name="Spend ($)" radius={[4, 4, 0, 0]}>
                                {analytics.features.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex justify-center items-center h-full text-sm text-gray-500">
                            No feature footprints detected
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Breakdown table */}
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="mb-4">
                          <h4 className="text-md font-bold text-white">Feature Cost Details</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Audit log summary mapped by module tags.</p>
                        </div>
                        <div className="divide-y divide-white/5 overflow-y-auto max-h-52 pr-1">
                          {overview.costByFeature.length > 0 ? (
                            overview.costByFeature.map((item) => (
                              <div key={item.feature} className="py-2.5 flex justify-between items-center">
                                <span className="text-xs font-semibold text-gray-200 capitalize">{item.feature.replace('-', ' ')}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-white font-bold">${item.cost.toFixed(4)}</span>
                                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                    {((item.cost / (overview.totalCost || 1)) * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-xs text-gray-500 py-6">No tags reported</div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 text-[11px] text-gray-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Workflows and text generation account for 90% of token consumption.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Budgets form & Notifications */}
              {activeTab === 'budget' && (
                <motion.div
                  key="budget-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Budget form */}
                  <div className="lg:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10 shadow-xl">
                    <div className="mb-6">
                      <h4 className="text-md font-bold text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-400" />
                        Budget Governance Adjustments
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Set spend bounds to protect your account. The platform blocks requests automatically if the spending reaches the limit.
                      </p>
                    </div>

                    <form onSubmit={handleBudgetSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Daily Budget */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                            Daily Cost Limit (USD)
                          </label>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-400 text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={budgetForm.dailyBudget}
                              onChange={(e) => setBudgetForm({ ...budgetForm, dailyBudget: e.target.value })}
                              className="block w-full pl-7 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              placeholder="5.00"
                              required
                            />
                          </div>
                          <span className="text-[10px] text-gray-500">Free default threshold is $5.00.</span>
                        </div>

                        {/* Monthly Budget */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                            Monthly Cost Limit (USD)
                          </label>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-400 text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={budgetForm.monthlyBudget}
                              onChange={(e) => setBudgetForm({ ...budgetForm, monthlyBudget: e.target.value })}
                              className="block w-full pl-7 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              placeholder="50.00"
                              required
                            />
                          </div>
                          <span className="text-[10px] text-gray-500">Free default threshold is $50.00.</span>
                        </div>
                      </div>

                      {/* Threshold alert pills checkbox */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                          Budget Trigger Alert Thresholds (%)
                        </label>
                        <div className="flex gap-4">
                          {[50, 80, 100].map((t) => (
                            <div key={t} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                              <input
                                type="checkbox"
                                checked={budgetForm.alertThresholds.includes(t)}
                                onChange={(e) => {
                                  let newAlerts = [...budgetForm.alertThresholds];
                                  if (e.target.checked) {
                                    newAlerts.push(t);
                                  } else {
                                    newAlerts = newAlerts.filter(x => x !== t);
                                  }
                                  setBudgetForm({ ...budgetForm, alertThresholds: newAlerts.sort((a,b)=>a-b) });
                                }}
                                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 focus:ring-offset-0 bg-transparent border-white/20"
                              />
                              <span className="text-xs text-white font-semibold">{t}% Limit reached</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-500">Dispatches real-time emails when spend percentages match bounds.</p>
                      </div>

                      {/* Email Toggle */}
                      <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-400" />
                          <div>
                            <span className="text-xs font-semibold text-white block">Email Notifications</span>
                            <span className="text-[10px] text-gray-400">Receive alerts if API spending approaches budget thresholds.</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBudgetForm({ ...budgetForm, emailNotifications: !budgetForm.emailNotifications })}
                          className={`w-10 h-5.5 rounded-full p-1 transition-all ${
                            budgetForm.emailNotifications ? 'bg-blue-600 flex justify-end' : 'bg-white/15 flex justify-start'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                        </button>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={updatingBudget}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md flex justify-center items-center gap-1.5"
                      >
                        {updatingBudget && <RefreshCw className="w-4 h-4 animate-spin" />}
                        Save Budget Governance Config
                      </button>
                    </form>
                  </div>

                  {/* Informational Guidelines card */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 shadow-xl flex flex-col justify-between">
                    <div className="space-y-4">
                      <h4 className="text-md font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Usage Threshold Alerts
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Setting strict limits prevents billing surprises. Once you hit 100% of your configured daily/monthly budgets, all requests to generation routes will return a <strong>403 Limit Exceeded</strong> response.
                      </p>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400">
                        <strong className="block mb-1">Status Report:</strong>
                        Your account has consumed <strong>${overview.monthlySpend.toFixed(3)}</strong> of your monthly limit.
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Daily limits reset at 00:00 UTC.</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Monthly reports dispatched on 1st of month.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Smart Recommendations & Cache */}
              {activeTab === 'optimization' && (
                <motion.div
                  key="optimization-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Recommendations */}
                  <div className="lg:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10 shadow-xl space-y-6">
                    <div>
                      <h4 className="text-md font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        AI Model Optimization Advisor
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Our model scanner analyzes your prompt patterns and suggests cost-saving adjustments.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {recommendations.length > 0 ? (
                        recommendations.map((rec, i) => (
                          <div
                            key={i}
                            className="bg-white/5 border border-white/10 rounded-xl p-4.5 flex flex-col md:flex-row justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                Optimization tip
                              </span>
                              <h5 className="text-sm font-bold text-white mt-1">
                                Switch {rec.feature} from <span className="text-red-400 font-extrabold">{rec.currentModel}</span> to{' '}
                                <span className="text-green-400 font-extrabold">{rec.recommendedModel}</span>
                              </h5>
                              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                {rec.reason}
                              </p>
                            </div>

                            <div className="shrink-0 flex flex-col justify-center items-end self-end md:self-center bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg text-right">
                              <span className="text-xs text-gray-400">Potential Savings:</span>
                              <span className="text-lg font-black text-green-400">~{rec.savingsPercent}% Less</span>
                              <span className="text-[10px] text-gray-500">Saves ${rec.potentialSavings.toFixed(3)}/mo</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-xs text-gray-500">
                          All processes optimized! No cheaper configurations suggested.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cache & Fallback details */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 shadow-xl space-y-6">
                    <div>
                      <h4 className="text-md font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                        Prompt Cache Stats
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Repeated inputs bypass API networks and resolve instantly with 0 cost.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Cache Eviction Policy:</span>
                        <span className="text-white font-semibold">LRU (30 min expiry)</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Average Savings:</span>
                        <span className="text-green-400 font-extrabold">100% tokens saved</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Auto Fallback Protection:</span>
                        <span className="text-white font-semibold">Enabled</span>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-[11px] text-blue-400 leading-relaxed">
                      <strong>Auto Fallback:</strong> If Gemini is unavailable, our proxy falls back to OpenAI or Anthropic automatically so your workflows do not crash.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CostCenter;
