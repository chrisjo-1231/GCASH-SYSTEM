"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LogoutButton from "../components/LogoutButton";
type Transaction = {
  id: number;
  type: "CASH_IN" | "CASH_OUT";
  status: "COMPLETED" | "CANCELLED";
  customerName: string;
  referenceNumber: string | null;
  amount: number;
  serviceFee: number;
  notes: string | null;
  createdAt: string;
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

// ₱15 service fee per ₱1,000 or fraction thereof.
const calculateServiceFee = (amount: number) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  if (amount < 500) {
    return 10;
  }

  return Math.ceil(amount / 1000) * 15;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function GcashPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [type, setType] = useState<"CASH_IN" | "CASH_OUT">("CASH_IN");
  const [amount, setAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const numericAmount = Number(amount) || 0;
  const serviceFee = calculateServiceFee(numericAmount);
  const totalAmount = numericAmount + serviceFee;

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/gcash-transactions", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          response.status === 401
            ? "Mag-login muna para makapag-record ng transactions."
            : data.message || "Hindi ma-load ang records."
        );
        return;
      }

      setTransactions(data.transactions || []);
    } catch {
      setError("Hindi makakonekta sa server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanName = customerName.trim();
    const numericValue = Number(amount);

    if (cleanName.length < 2) {
      setError("Ilagay ang pangalan ng customer.");
      return;
    }

    if (
      !Number.isFinite(numericValue) ||
      numericValue <= 0 ||
      numericValue > 9999999999.99
    ) {
      setError("Ilagay ang valid na amount.");
      return;
    }

    // Prevent amounts with more than two decimal places.
    if (Math.round(numericValue * 100) !== numericValue * 100) {
      setError("Hanggang dalawang decimal places lang ang amount.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/gcash-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: cleanName,
          type,
          amount: numericValue,
          referenceNumber: referenceNumber.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Hindi na-save ang transaction.");
        return;
      }

      setTransactions((current) => [
        data.transaction,
        ...current,
      ]);

      setMessage("Matagumpay na na-record ang transaction!");

      setCustomerName("");
      setType("CASH_IN");
      setAmount("");
      setReferenceNumber("");
      setNotes("");
    } catch {
      setError("Hindi makakonekta sa server.");
    } finally {
      setSaving(false);
    }
  }

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesType =
        filter === "ALL" || transaction.type === filter;

      const matchesSearch =
        !term ||
        transaction.customerName.toLowerCase().includes(term) ||
        (transaction.referenceNumber || "")
          .toLowerCase()
          .includes(term);

      return matchesType && matchesSearch;
    });
  }, [transactions, search, filter]);

  const completed = transactions.filter(
    (transaction) => transaction.status === "COMPLETED"
  );

  const cashInTotal = completed
    .filter((transaction) => transaction.type === "CASH_IN")
    .reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );

  const cashOutTotal = completed
    .filter((transaction) => transaction.type === "CASH_OUT")
    .reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );

  const feeIncome = completed.reduce(
    (sum, transaction) => sum + Number(transaction.serviceFee),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              TRANSACTION MANAGEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              GCash Cash In / Cash Out
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Record transactions and track service fee income.
            </p>
          </div>

          <div className="flex justify-end">
  <LogoutButton />
</div>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700"
          >
            {error}

            {error.includes("Mag-login") && (
              <Link
                className="ml-2 font-semibold underline"
                href="/login"
              >
                Login
              </Link>
            )}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-800"
          >
            {message}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Cash In Total"
            value={money(cashInTotal)}
          />

          <StatCard
            label="Cash Out Total"
            value={money(cashOutTotal)}
          />

          <StatCard
            label="Service Fee Income"
            value={money(feeIncome)}
          />

          <StatCard
            label="Completed Transactions"
            value={String(completed.length)}
          />
        </section>

        <section className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
          {/* NEW TRANSACTION FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h2 className="text-xl font-bold">
                New Transaction
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Service fee: ₱15 per ₱1,000 or fraction thereof.
              </p>
            </div>

            <div>
              <label
                htmlFor="type"
                className="mb-1 block text-sm font-medium"
              >
                Transaction Type
              </label>

              <select
                id="type"
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value as "CASH_IN" | "CASH_OUT"
                  )
                }
                className={inputClass}
              >
                <option value="CASH_IN">Cash In</option>
                <option value="CASH_OUT">Cash Out</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="customerName"
                className="mb-1 block text-sm font-medium"
              >
                Customer Name
              </label>

              <input
                id="customerName"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                className={inputClass}
                placeholder="Enter customer name"
                minLength={2}
                maxLength={100}
                required
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="mb-1 block text-sm font-medium"
              >
                Amount (₱)
              </label>

              <input
                id="amount"
                type="number"
                min="0.01"
                max="9999999999.99"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                className={inputClass}
                placeholder="0.00"
                required
              />
            </div>

            {/* AUTOMATIC FEE CALCULATION */}
            <div className="rounded-lg bg-blue-50 p-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-600">
                  Transaction Amount
                </span>

                <span className="font-semibold">
                  {money(numericAmount)}
                </span>
              </div>

              <div className="mt-2 flex justify-between gap-2">
                <span className="text-slate-600">
                  Service Fee
                </span>

                <span className="font-semibold text-orange-600">
                  {money(serviceFee)}
                </span>
              </div>

              <div className="mt-2 flex justify-between gap-2 border-t border-blue-200 pt-2">
                <span className="font-semibold">
                  Amount + Fee
                </span>

                <span className="font-bold text-blue-800">
                  {money(totalAmount)}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Preview only. Confirm the actual cash amount
                and fee treatment with the customer before
                completing the service.
              </p>
            </div>

            <div>
              <label
                htmlFor="referenceNumber"
                className="mb-1 block text-sm font-medium"
              >
                Reference Number (Optional)
              </label>

              <input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(event) =>
                  setReferenceNumber(event.target.value)
                }
                className={inputClass}
                placeholder="Transaction reference"
                maxLength={100}
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1 block text-sm font-medium"
              >
                Notes (Optional)
              </label>

              <textarea
                id="notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                className={inputClass}
                placeholder="Additional details"
                rows={3}
                maxLength={500}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Transaction"}
            </button>
          </form>

          {/* TRANSACTION RECORDS */}
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                Transaction Records
              </h2>

              <button
                type="button"
                onClick={() => void loadTransactions()}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className={inputClass}
                placeholder="Search customer or reference..."
                aria-label="Search transactions"
              />

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
                className={inputClass}
                aria-label="Filter transaction type"
              >
                <option value="ALL">All Transactions</option>
                <option value="CASH_IN">Cash In</option>
                <option value="CASH_OUT">Cash Out</option>
              </select>
            </div>

            {loading ? (
              <p className="py-10 text-center text-slate-500">
                Loading transactions...
              </p>
            ) : filteredTransactions.length === 0 ? (
              <p className="py-10 text-center text-slate-500">
                Walang transaction na tumutugma sa search.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3 font-semibold">Date</th>
                      <th className="p-3 font-semibold">Customer</th>
                      <th className="p-3 font-semibold">Type</th>
                      <th className="p-3 text-right font-semibold">
                        Amount
                      </th>
                      <th className="p-3 text-right font-semibold">
                        Fee
                      </th>
                      <th className="p-3 font-semibold">
                        Reference
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap p-3">
                          {new Date(
                            transaction.createdAt
                          ).toLocaleString("en-PH")}
                        </td>

                        <td className="p-3 font-medium">
                          {transaction.customerName}
                        </td>

                        <td className="p-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              transaction.type === "CASH_IN"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {transaction.type === "CASH_IN"
                              ? "Cash In"
                              : "Cash Out"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap p-3 text-right">
                          {money(Number(transaction.amount))}
                        </td>

                        <td className="whitespace-nowrap p-3 text-right">
                          {money(Number(transaction.serviceFee))}
                        </td>

                        <td className="p-3">
                          {transaction.referenceNumber || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-3 text-xs text-slate-500">
              Showing {filteredTransactions.length} of{" "}
              {transactions.length} records.
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 break-words text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}