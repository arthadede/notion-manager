'use client';

import { useState, useEffect } from 'react';
import { getTransactionCategories } from '@/lib/notion';

interface TransactionFormData {
  amount: number;
  type: string;
  note: string;
}

export default function TransactionPage() {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: 0,
    type: '',
    note: '',
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const transactionCategories = getTransactionCategories();
      setCategories(transactionCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setStatus({
        type: 'error',
        message: 'Failed to load transaction categories'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.type) {
      setStatus({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    if (formData.amount <= 0) {
      setStatus({
        type: 'error',
        message: 'Amount must be greater than 0'
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.amount,
          type: formData.type,
          note: formData.note || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      setStatus({
        type: 'success',
        message: 'Transaction created successfully!'
      });

      // Reset form
      setFormData({
        amount: 0,
        type: '',
        note: '',
      });

    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create transaction'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <div className="container py-responsive">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-900 rounded mb-8"></div>
            <div className="card">
              <div className="space-y-6">
                <div className="h-4 bg-zinc-900 rounded"></div>
                <div className="h-10 bg-zinc-900 rounded"></div>
                <div className="h-4 bg-zinc-900 rounded"></div>
                <div className="h-10 bg-zinc-900 rounded"></div>
                <div className="h-4 bg-zinc-900 rounded"></div>
                <div className="h-20 bg-zinc-900 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container py-responsive">
        <div className="animate-fade-in">
          <h1 className="text-5xl font-bold mb-responsive">
            Add Transaction
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
              <div className="space-y-6">
                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-3">
                    Amount <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Type/Category */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium mb-3">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    disabled={isLoading || categories.length === 0}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="note" className="block text-sm font-medium mb-3">
                    Notes
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Additional notes (optional)"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Transaction...' : 'Create Transaction'}
            </button>

            {/* Status Messages */}
            {status.type && (
              <div
                className={`status-indicator ${
                  status.type === 'success' ? 'status-success' : 'status-error'
                } animate-fade-in`}
              >
                <p className="font-medium">
                  {status.type === 'success' ? '✓' : '⚠'} {status.message}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}