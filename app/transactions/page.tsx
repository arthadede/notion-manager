"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTransactionCategories } from "@/lib/notion";

interface TransactionFormData {
  amount: number;
  type: string;
  note: string;
}

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
}

export default function TransactionPage() {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: 0,
    type: "",
    note: "",
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [mounted, setMounted] = useState(false);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setMounted(true);
    loadCategories();
    loadMonthlyExpenses();
  }, []);

  const loadCategories = async () => {
    try {
      const transactionCategories = getTransactionCategories();
      setCategories(transactionCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      setStatus({
        type: "error",
        message: "Failed to load transaction categories",
      });
    }
  };

  const loadMonthlyExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const response = await fetch(`/api/transactions?year=${year}&month=${month}`);

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const transactions: Transaction[] = await response.json();
      const total = transactions.reduce((sum: number, transaction: Transaction) => sum + transaction.amount, 0);
      setMonthlyExpenses(total);
      setTransactions(transactions);
    } catch (error) {
      console.error("Error loading monthly expenses:", error);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.type) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    if (formData.amount <= 0) {
      setStatus({
        type: "error",
        message: "Amount must be greater than 0",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: formData.amount,
          type: formData.type,
          note: formData.note || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create transaction");
      }

      setStatus({
        type: "success",
        message: "Transaction created successfully!",
      });

      // Reset form
      setFormData({
        amount: 0,
        type: "",
        note: "",
      });

      // Reload monthly expenses
      loadMonthlyExpenses();

      // Clear success message after 3 seconds
      setTimeout(() => setStatus({ type: null, message: "" }), 3000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create transaction",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTopExpensesByCategory = () => {
    // Group transactions by category and sum amounts
    const categoryTotals = transactions.reduce((acc: { [key: string]: number }, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {});

    // Convert to array and sort by amount descending
    const sortedCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Return top 3
    return sortedCategories.slice(0, 3);
  };

  const LoadingSkeleton = () => (
    <div className="card animate-pulse">
      <div className="space-y-6">
        <div className="h-12 w-full rounded-lg bg-surface-hover"></div>
        <div className="h-12 w-full rounded-lg bg-surface-hover"></div>
        <div className="h-24 w-full rounded-lg bg-surface-hover"></div>
        <div className="h-12 w-2/3 rounded-lg bg-surface-hover"></div>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Add Transaction</h1>
            <p className="mt-1 text-sm text-primary-subtle">Track your financial activities</p>
          </div>
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary-muted transition-all duration-200 hover:border-border-hover hover:bg-surface-hover hover:text-primary"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>

        {/* Monthly Expenses Card */}
        <div className="mb-8 card animate-slide-up">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">Monthly Expenses</h2>
              <div className="rounded-lg bg-surface-hover px-3 py-1">
                <span className="text-sm text-primary-subtle">
                  {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>

            {isLoadingExpenses ? (
              <div className="animate-pulse">
                <div className="h-16 w-full rounded-lg bg-surface-hover"></div>
              </div>
            ) : (
              <div className="rounded-lg bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 p-6 border border-border">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-accent-red/20 p-3">
                      <svg className="h-6 w-6 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-primary-subtle">Total Expenses</p>
                      <p className="text-3xl font-bold text-primary">
                        Rp {monthlyExpenses.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Top 3 Expenses by Category */}
                  {getTopExpensesByCategory().length > 0 && (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      {getTopExpensesByCategory().map((item, index) => (
                        <div
                          key={item.category}
                          className="flex items-center justify-between gap-3 rounded-lg bg-surface/80 backdrop-blur-sm px-3 py-2 border border-border/50 hover:border-border transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                              index === 0 ? "bg-accent-red" :
                              index === 1 ? "bg-accent-orange" :
                              "bg-accent-yellow"
                            }`} />
                            <span className="text-xs font-medium text-primary truncate">
                              {item.category}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-primary-muted whitespace-nowrap">
                            Rp {item.amount.toLocaleString("id-ID", { notation: "compact", compactDisplay: "short" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="card animate-slide-up">
            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <label htmlFor="amount" className="mb-2 block text-sm font-medium text-primary">
                  Amount (IDR)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-primary-subtle">Rp</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount || ""}
                    onChange={handleInputChange}
                    className="input pl-12"
                    placeholder="0"
                    step="1"
                    min="0"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Category Select */}
              <div>
                <label htmlFor="type" className="mb-2 block text-sm font-medium text-primary">
                  Category
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="select"
                  required
                  disabled={isLoading || categories.length === 0}
                >
                  <option value="">Choose a category...</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes Textarea */}
              <div>
                <label htmlFor="note" className="mb-2 block text-sm font-medium text-primary">
                  Notes{" "}
                  <span className="font-normal text-primary-subtle">(optional)</span>
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="textarea"
                  placeholder="Add transaction details..."
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Transaction"
                )}
              </button>

              {/* Status Message */}
              {status.type && (
                <div
                  className={`animate-fade-in ${
                    status.type === "success" ? "alert-success" : "alert-error"
                  }`}
                  role="alert"
                >
                  <div className="flex items-center gap-2">
                    {status.type === "success" ? (
                      <svg className="h-5 w-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-accent-red" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span>{status.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
