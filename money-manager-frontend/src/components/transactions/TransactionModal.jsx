import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { transactionAPI, categoryAPI } from '../../services/api.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const TransactionModal = ({ isOpen, onClose, onSuccess, editTransaction = null }) => {
    const [activeTab, setActiveTab] = useState('expense');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: '',
        division: 'personal',
        description: '',
        date: new Date().toISOString().split('T')[0],
        account: 'default',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (editTransaction) {
                setActiveTab(editTransaction.type);
                setFormData({
                    type: editTransaction.type,
                    amount: editTransaction.amount,
                    category: editTransaction.category,
                    division: editTransaction.division,
                    description: editTransaction.description,
                    date: new Date(editTransaction.date).toISOString().split('T')[0],
                    account: editTransaction.account || 'default',
                });
            } else {
                resetForm();
            }
        }
    }, [isOpen, editTransaction]);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            type: activeTab,
            amount: '',
            category: '',
            division: 'personal',
            description: '',
            date: new Date().toISOString().split('T')[0],
            account: 'default',
        });
        setErrors({});
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setFormData({ ...formData, type: tab, category: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }
        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Please enter a description';
        }
        if (!formData.date) {
            newErrors.date = 'Please select a date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount),
            };

            if (editTransaction) {
                await transactionAPI.update(editTransaction._id, data);
            } else {
                await transactionAPI.create(data);
            }

            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error saving transaction:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(
        (cat) => cat.type === activeTab || cat.type === 'both'
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => handleTabChange('income')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-all ${activeTab === 'income'
                            ? 'text-success-600 border-b-2 border-success-600 bg-success-50 dark:bg-success-900/20 dark:text-success-500'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <TrendingUp className="w-5 h-5" />
                        Income
                    </button>
                    <button
                        onClick={() => handleTabChange('expense')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-all ${activeTab === 'expense'
                            ? 'text-danger-600 border-b-2 border-danger-600 bg-danger-50 dark:bg-danger-900/20 dark:text-danger-500'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <TrendingDown className="w-5 h-5" />
                        Expense
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Amount */}
                    <div>
                        <label className="label">Amount *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                                ₹
                            </span>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className={`input pl-10 ${errors.amount ? 'input-error' : ''}`}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                        {errors.amount && (
                            <p className="text-danger-600 text-sm mt-1">{errors.amount}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="label">Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`select ${errors.category ? 'input-error' : ''}`}
                        >
                            <option value="">Select category</option>
                            {filteredCategories.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="text-danger-600 text-sm mt-1">{errors.category}</p>
                        )}
                    </div>

                    {/* Division */}
                    <div>
                        <label className="label">Division *</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, division: 'personal' })}
                                className={`p-3 rounded-xl border-2 font-medium transition-all ${formData.division === 'personal'
                                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                👤 Personal
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, division: 'office' })}
                                className={`p-3 rounded-xl border-2 font-medium transition-all ${formData.division === 'office'
                                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                🏢 Office
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">Description *</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={`input ${errors.description ? 'input-error' : ''}`}
                            placeholder="Enter description"
                            maxLength={200}
                        />
                        {errors.description && (
                            <p className="text-danger-600 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="label">Date *</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className={`input ${errors.date ? 'input-error' : ''}`}
                            max={new Date().toISOString().split('T')[0]}
                        />
                        {errors.date && (
                            <p className="text-danger-600 text-sm mt-1">{errors.date}</p>
                        )}
                    </div>

                    {/* Account */}
                    <div>
                        <label className="label">Account</label>
                        <input
                            type="text"
                            name="account"
                            value={formData.account}
                            onChange={handleChange}
                            className="input"
                            placeholder="Account name (optional)"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn flex-1 ${activeTab === 'income' ? 'btn-success' : 'btn-danger'
                                }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    {editTransaction ? 'Update' : 'Add'} {activeTab}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
