import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import {
    BarChart3,
    Download,
    Activity,
    Zap,
    FolderOpen,
    Image as ImageIcon,
    Loader2,
    Calendar as CalendarIcon
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import { clearAnalyticsError, fetchAnalyticsOverview, fetchAnalyticsUsage } from '../../store/slices/analyticsSlice';
import { cn } from '../../utils/cn';

// Colors for PieChart
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DataWorkspace = () => {
    const dispatch = useDispatch();
    const { overview, charts, loading, error } = useSelector((state) => state.analytics);

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [dateRange, setDateRange] = useState('30days'); // '7days', '30days', 'all'

    // Refetch when date range changes
    useEffect(() => {
        let start = null;
        let end = new Date().toISOString();

        if (dateRange === '7days') {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = d.toISOString();
        } else if (dateRange === '30days') {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            start = d.toISOString();
        }

        const range = start ? { startDate: start, endDate: end } : null;

        dispatch(fetchAnalyticsOverview(range));
        dispatch(fetchAnalyticsUsage(range));
    }, [dispatch, dateRange]);

    const handleExportCSV = () => {
        // Basic CSV Export Logic
        if (!charts.lineChartData || charts.lineChartData.length === 0) return;

        const headers = 'Date,Text Requests,Tokens Used,Image Generations\n';
        const rows = charts.lineChartData.map(row =>
            `${row.date},${row.texts},${row.tokens},${row.images}`
        ).join('\n');

        const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ai_nexus_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Helmet>
                <title>Data Workspace - AI Nexus</title>
                <meta name="description" content="View your AI usage and analytics." />
            </Helmet>

            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <Sidebar
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                <main className={cn(
                    "pt-16 transition-all duration-300 flex-1 flex flex-col",
                    sidebarCollapsed ? 'ml-16' : 'ml-64'
                )}>
                    {/* Top Bar */}
                    <div className="bg-card border-b border-border px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-16 z-20 shadow-sm">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center text-foreground">
                                <BarChart3 className="w-6 h-6 mr-3 text-primary" />
                                Data Workspace & Analytics
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">Monitor your global API usage, view token expenditure, and discover feature trends.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-accent/50 p-1 flex rounded-lg border border-border">
                                <button onClick={() => setDateRange('7days')} className={cn("px-3 py-1.5 text-xs font-medium rounded transition-all", dateRange === '7days' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground')}>7 Days</button>
                                <button onClick={() => setDateRange('30days')} className={cn("px-3 py-1.5 text-xs font-medium rounded transition-all", dateRange === '30days' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground')}>30 Days</button>
                                <button onClick={() => setDateRange('all')} className={cn("px-3 py-1.5 text-xs font-medium rounded transition-all", dateRange === 'all' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground')}>All Time</button>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleExportCSV}>
                                <Download className="w-4 h-4 mr-2" /> Export CSV
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 flex-1 w-full max-w-7xl mx-auto space-y-6">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center">
                                <Activity className="w-5 h-5 mr-3" />
                                <span>Failed to load analytics: {error}. Are you currently logged in securely?</span>
                            </div>
                        )}

                        {loading && !charts.lineChartData.length ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Metric Cards Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-primary/10 p-2.5 rounded-lg"><Activity className="w-5 h-5 text-primary" /></div>
                                            <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">+12%</span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-foreground">{overview.totalRequests.toLocaleString()}</h3>
                                        <p className="text-sm text-muted-foreground font-medium mt-1">Total API Requests</p>
                                    </div>

                                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-amber-500/50 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-amber-500/10 p-2.5 rounded-lg"><Zap className="w-5 h-5 text-amber-500" /></div>
                                            <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-1 rounded-full">Total burned</span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-foreground">{overview.tokensUsed.toLocaleString()}</h3>
                                        <p className="text-sm text-muted-foreground font-medium mt-1">Tokens Consumed</p>
                                    </div>

                                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-pink-500/50 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-pink-500/10 p-2.5 rounded-lg"><ImageIcon className="w-5 h-5 text-pink-500" /></div>
                                        </div>
                                        <h3 className="text-3xl font-bold text-foreground">{overview.imageGenerations.toLocaleString()}</h3>
                                        <p className="text-sm text-muted-foreground font-medium mt-1">Images Processed/Generated</p>
                                    </div>

                                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-emerald-500/50 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-emerald-500/10 p-2.5 rounded-lg"><FolderOpen className="w-5 h-5 text-emerald-500" /></div>
                                        </div>
                                        <h3 className="text-3xl font-bold text-foreground">{overview.activeProjects}</h3>
                                        <p className="text-sm text-muted-foreground font-medium mt-1">Active Projects</p>
                                    </div>
                                </div>

                                {/* Primary Chart: Usage Timeline */}
                                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-primary" /> Activity Timeline
                                    </h3>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={charts.lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
                                                    itemStyle={{ color: 'var(--color-foreground)' }}
                                                />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                <Line yAxisId="left" type="monotone" dataKey="texts" name="Text Gens" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                <Line yAxisId="left" type="monotone" dataKey="images" name="Images" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                <Line yAxisId="right" type="monotone" dataKey="tokens" name="Tokens" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Grid Charts: Model Share & Actions Distribution */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* Pie Chart */}
                                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-foreground mb-6">Model Distribution</h3>
                                        <div className="h-[300px] w-full">
                                            {charts.pieChartData && charts.pieChartData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={charts.pieChartData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={70}
                                                            outerRadius={100}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            stroke="var(--color-card)"
                                                            strokeWidth={2}
                                                        >
                                                            {charts.pieChartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
                                                        />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">No model data recorded</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bar Chart */}
                                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-foreground mb-6">Feature Adoption</h3>
                                        <div className="h-[300px] w-full">
                                            {charts.barChartData && charts.barChartData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={charts.barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                                                        <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis dataKey="name" type="category" stroke="var(--color-foreground)" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                                        <Tooltip
                                                            cursor={{ fill: 'var(--color-accent)', opacity: 0.4 }}
                                                            contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
                                                        />
                                                        <Bar dataKey="usage" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24}>
                                                            {charts.barChartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">No feature data recorded</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </>
                        )}

                    </div>
                </main>
            </div>
        </>
    );
};

export default DataWorkspace;
