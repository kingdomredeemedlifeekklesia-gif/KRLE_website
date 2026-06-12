"use client";

import { useEffect, useMemo, useState } from "react";

interface PaymentTransaction {
  id: string;
  donor: string | null;
  email: string | null;
  amount: number;
  currency: string;
  purpose: string;
  type: string;
  status: string;
  provider: string | null;
  note: string | null;
  details: string | null;
  createdAt: string;
}

const ExpensesPage = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expensePurpose, setExpensePurpose] = useState("Purchase");
  const [expenseNote, setExpenseNote] = useState("");
  const [expenseItemName, setExpenseItemName] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseTime, setExpenseTime] = useState("");
  const [expenseBeneficiaryName, setExpenseBeneficiaryName] = useState("");
  const [expenseBeneficiaryPhone, setExpenseBeneficiaryPhone] = useState("");
  const [expenseError, setExpenseError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/payments"), { cache: "no-store" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Unable to load payment data.");
      }
      const data: PaymentTransaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Fetch payments error:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.status === "Completed"),
    [transactions]
  );

  const totalReceived = useMemo(
    () => completedTransactions
      .filter((transaction) => transaction.type === "donation")
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [completedTransactions]
  );

  const totalExpenses = useMemo(
    () => completedTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [completedTransactions]
  );

  const netBalance = totalReceived - totalExpenses;

  const expenseTotals = useMemo(() => {
    const expenseTransactions = completedTransactions.filter((transaction) => transaction.type === "expense");
    return {
      scholarships: expenseTransactions
        .filter((transaction) => transaction.purpose === "Scholarships")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      donations: expenseTransactions
        .filter((transaction) => transaction.purpose === "Donations")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      other: expenseTransactions
        .filter((transaction) => transaction.purpose === "Other")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      purchases: expenseTransactions
        .filter((transaction) => !["Scholarships", "Donations", "Other"].includes(transaction.purpose))
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    };
  }, [completedTransactions]);

  const generateExpenseCsv = (items: PaymentTransaction[]) => {
    const csvRows = [
      [
        "Date",
        "Category",
        "Item Name",
        "Amount",
        "Currency",
        "Status",
        "Beneficiary",
        "Note",
        "Details",
      ].join(","),
      ...items.map((transaction) => [
        new Date(transaction.createdAt).toLocaleString(),
        transaction.purpose,
        transaction.note || "",
        transaction.amount.toFixed(2),
        transaction.currency,
        transaction.status,
        transaction.details?.includes("Beneficiary:") ? transaction.details.split("Beneficiary:")[1]?.split(";")[0]?.trim() || "" : "",
        transaction.note || "",
        transaction.details || "",
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")),
    ];

    return csvRows.join("\n");
  };

  const downloadExpenseReport = () => {
    const expenseItems = completedTransactions.filter((transaction) => transaction.type === "expense");
    const csv = generateExpenseCsv(expenseItems);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expense-items-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addExpense = async () => {
    setExpenseError(null);

    if (!expenseAmount || Number(expenseAmount) <= 0) {
      setExpenseError("Please enter a valid amount.");
      return;
    }

    if (!expenseDescription.trim()) {
      setExpenseError("Please enter an expense description.");
      return;
    }

    if (expensePurpose === "Other") {
      if (!expenseItemName.trim()) {
        setExpenseError("Please enter the item name for Other expenses.");
        return;
      }
      if (!expenseDate || !expenseTime) {
        setExpenseError("Please enter a date and time for Other expenses.");
        return;
      }
    }

    const expenseData: any = {
      donor: "Church Expense",
      email: null,
      amount: Number(expenseAmount),
      purpose: expensePurpose,
      type: "expense",
      status: "Completed",
      note: expenseDescription,
      details: expenseNote,
    };

    if (expensePurpose === "Other") {
      expenseData.note = `${expenseItemName} - ${expenseDescription}`;
      expenseData.details = `Item: ${expenseItemName}; Date: ${expenseDate}; Time: ${expenseTime}; Beneficiary: ${expenseBeneficiaryName}; Phone: ${expenseBeneficiaryPhone}; Note: ${expenseNote}`;
    } else {
      expenseData.details = `Beneficiary: ${expenseBeneficiaryName}; Phone: ${expenseBeneficiaryPhone}; Note: ${expenseNote}`;
    }

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        throw new Error("Failed to save expense.");
      }

      setExpenseAmount("");
      setExpenseDescription("");
      setExpenseNote("");
      setExpensePurpose("Purchase");
      setExpenseItemName("");
      setExpenseDate("");
      setExpenseTime("");
      setExpenseBeneficiaryName("");
      setExpenseBeneficiaryPhone("");
      await fetchTransactions();
    } catch (error) {
      console.error(error);
      setExpenseError("Failed to save expense. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Church Expenses Management</h1>

      <div className="grid gap-6 lg:grid-cols-5 mb-8">
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
          <p className="mt-3 text-3xl font-semibold text-red-600">GHS {totalExpenses.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Scholarships</p>
          <p className="mt-3 text-2xl font-semibold text-red-600">GHS {expenseTotals.scholarships.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Expense Donations</p>
          <p className="mt-3 text-2xl font-semibold text-red-600">GHS {expenseTotals.donations.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Other Expenses</p>
          <p className="mt-3 text-2xl font-semibold text-red-600">GHS {expenseTotals.other.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Purchases/Utilities</p>
          <p className="mt-3 text-2xl font-semibold text-red-600">GHS {expenseTotals.purchases.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">Add New Expense</h2>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-dark dark:text-white">Expense Amount (GHS)</label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark dark:text-white">Expense Category</label>
                <select
                  value={expensePurpose}
                  onChange={(e) => setExpensePurpose(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                >
                  <option value="Purchase">Purchase</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Scholarships">Scholarships</option>
                  <option value="Donations">Donations</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark dark:text-white">Expense Description</label>
              <textarea
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-3 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                placeholder="What was purchased?"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-dark dark:text-white">Beneficiary Name</label>
                <input
                  type="text"
                  value={expenseBeneficiaryName}
                  onChange={(e) => setExpenseBeneficiaryName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                  placeholder="Name of beneficiary (if applicable)"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark dark:text-white">Beneficiary Phone</label>
                <input
                  type="tel"
                  value={expenseBeneficiaryPhone}
                  onChange={(e) => setExpenseBeneficiaryPhone(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                  placeholder="Phone number (if applicable)"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark dark:text-white">Additional Note</label>
              <input
                type="text"
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                placeholder="Vendor, purpose, or reference"
              />
            </div>

            {expensePurpose === "Other" && (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-dark dark:text-white">Item Name</label>
                  <input
                    type="text"
                    value={expenseItemName}
                    onChange={(e) => setExpenseItemName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark dark:text-white">Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark dark:text-white">Time</label>
                  <input
                    type="time"
                    value={expenseTime}
                    onChange={(e) => setExpenseTime(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={addExpense}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Save Expense
            </button>
            {expenseError && (
              <p className="text-sm text-red-600 dark:text-red-400">{expenseError}</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">Expense Reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Download detailed expense reports for accounting and transparency.
          </p>
          <button
            type="button"
            onClick={downloadExpenseReport}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          >
            Download Expense Items Report
          </button>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Balance</h3>
            <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              GHS {netBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total Income: GHS {totalReceived.toLocaleString()} | Total Expenses: GHS {totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">Recent Expenses</h2>

        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading expenses...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Beneficiary</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {completedTransactions
                  .filter((transaction) => transaction.type === "expense")
                  .slice(0, 10)
                  .map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{new Date(transaction.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{transaction.purpose}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{transaction.note || transaction.details || "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">GHS {transaction.amount.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {transaction.details?.includes("Beneficiary:") ? transaction.details.split("Beneficiary:")[1]?.split(";")[0]?.trim() || "-" : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;