import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Calendar,
    Filter,
    Download,
    RefreshCw,
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
    ResponsiveContainer,
} from 'recharts';
import { dashboardAPI, transactionAPI } from '../services/api.js';
import { formatCurrency, formatRelativeDate } from '../utils/helpers.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const COLORS = ['#0ea5e9', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const Dashboard = () => {
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [overviewRes, trendsRes, recentRes] = await Promise.all([
                dashboardAPI.getOverview({ period }),
                dashboardAPI.getTrends({ period }),
                dashboardAPI.getRecent({ limit: 5 }),
            ]);

            setOverview(overviewRes.data.data);

            // Process trends data for charts
            const trendsData = processTrendsData(trendsRes.data.data.trends);
            setTrends(trendsData);

            // Process category breakdown
            const categoryBreakdown = processCategoryData(overviewRes.data.data.categoryBreakdown);
            setCategoryData(categoryBreakdown);

            setRecentTransactions(recentRes.data.data.transactions);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processTrendsData = (rawTrends) => {
        const groupedData = {};

        rawTrends.forEach((item) => {
            const date = item._id.date;
            if (!groupedData[date]) {
                groupedData[date] = { date, income: 0, expense: 0 };
            }
            if (item._id.type === 'income') {
                groupedData[date].income = item.total;
            } else {
                groupedData[date].expense = item.total;
            }
        });

        return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
    };

    const processCategoryData = (rawData) => {
        const expenseData = rawData
            .filter((item) => item._id.type === 'expense')
            .map((item) => ({
                name: item._id.category,
                value: item.total,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        return expenseData;
    };

    const handleRefresh = () => {
        fetchDashboardData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="xl" />
            </div>
        );
    }

    const { summary } = overview || {};

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Track your financial overview and insights
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Period Filter */}
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl p-1 shadow-soft border border-slate-200 dark:border-slate-800">
                        {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${period === p
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="btn btn-ghost p-3"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Income Card */}
                <div className="stat-card bg-gradient-to-br from-success-500 to-emerald-600 text-white shadow-glow-success">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-success-100 text-sm font-medium">Total Income</p>
                            <p className="text-3xl font-bold mt-2">
                                {formatCurrency(summary?.income || 0)}
                            </p>
                            <p className="text-success-100 text-sm mt-2">
                                {summary?.incomeCount || 0} transactions
                            </p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* Expense Card */}
                <div className="stat-card bg-gradient-to-br from-danger-500 to-rose-600 text-white shadow-glow-danger">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-danger-100 text-sm font-medium">Total Expense</p>
                            <p className="text-3xl font-bold mt-2">
                                {formatCurrency(summary?.expense || 0)}
                            </p>
                            <p className="text-danger-100 text-sm mt-2">
                                {summary?.expenseCount || 0} transactions
                            </p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                            <TrendingDown className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* Balance Card */}
                <div className={`stat-card bg-gradient-to-br ${summary?.balance >= 0
                    ? 'from-primary-500 to-indigo-600 shadow-glow-primary'
                    : 'from-amber-500 to-orange-600'
                    } text-white`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Balance</p>
                            <p className="text-3xl font-bold mt-2">
                                {formatCurrency(summary?.balance || 0)}
                            </p>
                            <p className="text-white/80 text-sm mt-2">
                                {period.charAt(0).toUpperCase() + period.slice(1)} summary
                            </p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                            <Wallet className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trends Chart */}
                <div className="card">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        Income vs Expense Trends
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#22c55e"
                                strokeWidth={3}
                                dot={{ fill: '#22c55e', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="expense"
                                stroke="#ef4444"
                                strokeWidth={3}
                                dot={{ fill: '#ef4444', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="card">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        Top Expense Categories
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                    <a href="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View all →
                    </a>
                </div>

                <div className="space-y-2">
                    {recentTransactions.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">No transactions yet</p>
                    ) : (
                        recentTransactions.map((transaction) => (
                            <div key={transaction._id} className="transaction-item">
                                <div className="flex items-center gap-4 flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.type === 'income'
                                            ? 'bg-success-100 text-success-600'
                                            : 'bg-danger-100 text-danger-600'
                                            }`}
                                    >
                                        {transaction.type === 'income' ? (
                                            <TrendingUp className="w-6 h-6" />
                                        ) : (
                                            <TrendingDown className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {transaction.description}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {transaction.category} • {transaction.division}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`font-bold ${transaction.type === 'income'
                                                ? 'text-success-600'
                                                : 'text-danger-600'
                                                }`}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {formatRelativeDate(transaction.date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
