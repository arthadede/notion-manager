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
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create transaction",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="space-y-4">
              <div className="skeleton h-10 w-full rounded-md"></div>
              <div className="skeleton h-10 w-full rounded-md"></div>
              <div className="skeleton h-20 w-full rounded-md"></div>
              <div className="skeleton h-10 w-full rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Add Transaction</h1>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← Back
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="mb-2 block text-sm font-medium">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount || ""}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="type" className="mb-2 block text-sm font-medium">
                  Category
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
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="note" className="mb-2 block text-sm font-medium">
                  Notes <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Add notes..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="btn w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Transaction"}
              </button>

              {status.type && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    status.type === "success"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                  role="alert"
                >
                  {status.message}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
