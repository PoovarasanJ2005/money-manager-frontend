import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
} from 'lucide-react';
import { transactionAPI, categoryAPI } from '../services/api.js';
import {
    formatCurrency,
    formatRelativeDate,
    canEditTransaction,
    getTimeRemaining,
} from '../utils/helpers.js';
import TransactionModal from '../components/transactions/TransactionModal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        type: '',
        category: '',
        division: '',
        startDate: '',
        endDate: '',
        search: '',
    });

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTransactions();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [filters]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.type) params.type = filters.type;
            if (filters.category) params.category = filters.category;
            if (filters.division) params.division = filters.division;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await transactionAPI.getAll(params);
            let data = response.data.data.transactions;

            // Client-side search filter
            if (filters.search) {
                data = data.filter((t) =>
                    t.description.toLowerCase().includes(filters.search.toLowerCase())
                );
            }

            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleEdit = (transaction) => {
        if (!canEditTransaction(transaction.createdAt)) {
            alert('This transaction cannot be edited after 12 hours');
            return;
        }
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = async (transaction) => {
        if (!canEditTransaction(transaction.createdAt)) {
            alert('This transaction cannot be deleted after 12 hours');
            return;
        }

        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            await transactionAPI.delete(transaction._id);
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert(error.response?.data?.message || 'Failed to delete transaction');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleModalSuccess = () => {
        fetchTransactions();
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            category: '',
            division: '',
            startDate: '',
            endDate: '',
            search: '',
        });
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== '');

    // Calculate totals
    const totals = transactions.reduce(
        (acc, t) => {
            if (t.type === 'income') {
                acc.income += t.amount;
            } else {
                acc.expense += t.amount;
            }
            return acc;
        },
        { income: 0, expense: 0 }
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage your income and expenses
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    Add Transaction
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-gradient-to-br from-success-50 to-emerald-50 dark:from-success-900/20 dark:to-emerald-900/20 border-success-200 dark:border-success-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-success-700 dark:text-success-400 font-medium">Total Income</p>
                            <p className="text-2xl font-bold text-success-600 dark:text-success-500 mt-1">
                                {formatCurrency(totals.income)}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-success-600 dark:text-success-500" />
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-danger-50 to-rose-50 dark:from-danger-900/20 dark:to-rose-900/20 border-danger-200 dark:border-danger-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-danger-700 dark:text-danger-400 font-medium">Total Expense</p>
                            <p className="text-2xl font-bold text-danger-600 dark:text-danger-500 mt-1">
                                {formatCurrency(totals.expense)}
                            </p>
                        </div>
                        <TrendingDown className="w-8 h-8 text-danger-600 dark:text-danger-500" />
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-primary-200 dark:border-primary-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-primary-700 dark:text-primary-400 font-medium">Net Balance</p>
                            <p className={`text-2xl font-bold mt-1 ${totals.income - totals.expense >= 0
                                ? 'text-success-600 dark:text-success-500'
                                : 'text-danger-600 dark:text-danger-500'
                                }`}>
                                {formatCurrency(totals.income - totals.expense)}
                            </p>
                        </div>
                        <Calendar className="w-8 h-8 text-primary-600 dark:text-primary-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-secondary"
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                            {hasActiveFilters && (
                                <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    Active
                                </span>
                            )}
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="input pl-10"
                        />
                    </div>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-slate-200 animate-slide-down">
                        <div>
                            <label className="label">Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="select"
                            >
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="select"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat.name}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Division</label>
                            <select
                                value={filters.division}
                                onChange={(e) => setFilters({ ...filters, division: e.target.value })}
                                className="select"
                            >
                                <option value="">All Divisions</option>
                                <option value="personal">Personal</option>
                                <option value="office">Office</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="label">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Transactions List */}
            <div className="card">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    All Transactions ({transactions.length})
                </h3>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No transactions found</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-primary mt-4"
                        >
                            <Plus className="w-5 h-5" />
                            Add your first transaction
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {transactions.map((transaction) => {
                            const canEdit = canEditTransaction(transaction.createdAt);

                            return (
                                <div key={transaction._id} className="transaction-item group">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.type === 'income'
                                                ? 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400'
                                                : 'bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400'
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
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge badge-primary">
                                                    {transaction.category}
                                                </span>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {transaction.division === 'office' ? '🏢' : '👤'}{' '}
                                                    {transaction.division}
                                                </span>
                                            </div>
                                            {canEdit && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    {getTimeRemaining(transaction.createdAt)}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <p
                                                className={`text-xl font-bold ${transaction.type === 'income'
                                                    ? 'text-success-600 dark:text-success-500'
                                                    : 'text-danger-600 dark:text-danger-500'
                                                    }`}
                                            >
                                                {transaction.type === 'income' ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {formatRelativeDate(transaction.date)}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(transaction)}
                                                disabled={!canEdit}
                                                className={`p-2 rounded-lg transition-colors ${canEdit
                                                    ? 'hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                    }`}
                                                title={canEdit ? 'Edit' : 'Cannot edit after 12 hours'}
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(transaction)}
                                                disabled={!canEdit}
                                                className={`p-2 rounded-lg transition-colors ${canEdit
                                                    ? 'hover:bg-danger-100 dark:hover:bg-danger-900/30 text-danger-600 dark:text-danger-400'
                                                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                    }`}
                                                title={canEdit ? 'Delete' : 'Cannot delete after 12 hours'}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                editTransaction={editingTransaction}
            />
        </div>
    );
};

export default Transactions;
