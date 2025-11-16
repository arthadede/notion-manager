"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTransactionCategories } from "@/lib/notion";

interface TransactionFormData {
  amount: number;
  type: string;
  note: string;
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

  useEffect(() => {
    setMounted(true);
    loadCategories();
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="card animate-slide-up">
            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <label htmlFor="amount" className="mb-2 block text-sm font-medium text-primary">
                  Amount
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-primary-subtle">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount || ""}
                    onChange={handleInputChange}
                    className="input pl-8"
                    placeholder="0.00"
                    step="0.01"
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
