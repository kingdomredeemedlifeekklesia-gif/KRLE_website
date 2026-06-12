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

interface RecordItem {
  id: string;
  type: string;
  name: string;
  email: string;
  joinedAt: string;
  status: string;
}

interface RecurringSubscription {
  id: string;
  donor: string | null;
  email: string | null;
  amount: number;
  currency: string;
  purpose: string;
  active: boolean;
  nextChargeAt: string | null;
  lastChargedAt: string | null;
  lastChargeStatus: string | null;
}

const periodOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const PaymentsPage = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
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
  const [depositAmount, setDepositAmount] = useState("");
  const [depositEmail, setDepositEmail] = useState("");
  const [depositSource, setDepositSource] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [depositMethod, setDepositMethod] = useState("card");
  const [depositProvider, setDepositProvider] = useState("mtn");
  const [depositPhone, setDepositPhone] = useState("");
  const [depositError, setDepositError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    fetchRecords();
    fetchSubscriptions();
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchTransactions();
      fetchSubscriptions();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch(getApiUrl("/api/records"), { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load record data.");
      }
      const data: RecordItem[] = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Fetch records error:", error);
    }
  };

  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const fetchSubscriptions = async () => {
    setSubscriptionsLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/paystack/recurring"), { cache: "no-store" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.warn("Unable to load recurring subscriptions:", errorData?.error || response.statusText);
        setSubscriptions([]);
        return;
      }
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error("Fetch subscriptions error:", error);
      setSubscriptions([]);
    } finally {
      setSubscriptionsLoading(false);
    }
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (statusFilter !== "all" && transaction.status.toLowerCase() !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [statusFilter, transactions]);

  const periodTransactions = useMemo(() => {
    const now = new Date();
    return filteredTransactions.filter((transaction) => {
      const created = new Date(transaction.createdAt);
      if (period === "daily") {
        return (
          created.getFullYear() === now.getFullYear() &&
          created.getMonth() === now.getMonth() &&
          created.getDate() === now.getDate()
        );
      }
      if (period === "weekly") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return created >= weekAgo;
      }
      if (period === "monthly") {
        return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
      }
      if (period === "yearly") {
        return created.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [period, filteredTransactions]);

  const completedTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.status === "Completed"),
    [transactions]
  );

  const totalReceived = useMemo(
    () => completedTransactions
      .filter((transaction) => transaction.type === "donation" || transaction.type === "deposit")
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [completedTransactions]
  );

  const totalDeposits = useMemo(
    () => completedTransactions
      .filter((transaction) => transaction.type === "deposit")
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [completedTransactions]
  );

  const totalExpenses = useMemo(
    () => completedTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [completedTransactions]
  );

  const totTithe = useMemo(
    () => completedTransactions
      .filter((transaction) => transaction.type === "donation" && transaction.purpose.toLowerCase() === "tithe")
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [completedTransactions]
  );

  const totOffertory = useMemo(
    () => completedTransactions
      .filter((transaction) => transaction.type === "donation" && transaction.purpose.toLowerCase() === "offertory")
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [completedTransactions]
  );

  const totThanksgiving = useMemo(
    () => completedTransactions
      .filter((transaction) => transaction.type === "donation" && transaction.purpose.toLowerCase().includes("thanksgiving"))
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [completedTransactions]
  );

  const netBalance = totalReceived - totalExpenses;

  const covenantMembers = useMemo(
    () => records.filter((record) => record.type.toLowerCase() === "covenant seed member"),
    [records]
  );

  const covenantMonthlyTransactions = useMemo(() => {
    const now = new Date();
    return completedTransactions.filter((transaction) => {
      const created = new Date(transaction.createdAt);
      return (
        transaction.purpose.toLowerCase().includes("covenant seed") &&
        transaction.status === "Completed" &&
        created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth()
      );
    });
  }, [completedTransactions]);

  const covenantPaidEmails = useMemo(
    () => new Set(covenantMonthlyTransactions.map((transaction) => transaction.email?.toLowerCase()).filter(Boolean)),
    [covenantMonthlyTransactions]
  );

  const covenantPaidThisMonth = useMemo(
    () => covenantMembers.filter((member) => member.email && covenantPaidEmails.has(member.email.toLowerCase())).length,
    [covenantMembers, covenantPaidEmails]
  );

  const covenantTotalCollectedThisMonth = useMemo(
    () => covenantMonthlyTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    [covenantMonthlyTransactions]
  );

  const covenantMemberStatus = useMemo(
    () => covenantMembers.map((member) => {
      const paidThisMonth = member.email ? covenantPaidEmails.has(member.email.toLowerCase()) : false;
      const lastPaidTransaction = covenantMonthlyTransactions
        .filter((transaction) => transaction.email?.toLowerCase() === member.email?.toLowerCase())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      return {
        ...member,
        paidThisMonth,
        lastPaidAt: lastPaidTransaction?.createdAt || null,
      };
    }),
    [covenantMembers, covenantMonthlyTransactions, covenantPaidEmails]
  );

  const activeRecurringCount = subscriptions.filter((subscription) => subscription.active).length;
  const dueRecurringCount = subscriptions.filter((subscription) => {
    if (!subscription.nextChargeAt) return false;
    return new Date(subscription.nextChargeAt) <= new Date();
  }).length;

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

  const transactionCount = transactions.length;

  const generateCsv = (items: PaymentTransaction[]) => {
    const csvRows = [
      [
        "Date",
        "Donor / Payee",
        "Email",
        "Type",
        "Purpose",
        "Amount",
        "Currency",
        "Status",
        "Provider",
        "Beneficiary",
        "Note",
        "Details",
      ].join(","),
      ...items.map((transaction) => [
        new Date(transaction.createdAt).toLocaleString(),
        transaction.donor || transaction.note || "",
        transaction.email || "",
        transaction.type,
        transaction.purpose,
        transaction.amount.toFixed(2),
        transaction.currency,
        transaction.status,
        transaction.provider || "",
        transaction.details?.includes("Beneficiary:") ? transaction.details.split("Beneficiary:")[1]?.split(";")[0]?.trim() || "" : "",
        transaction.note || "",
        transaction.details || "",
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")),
    ];

    return csvRows.join("\n");
  };

  const downloadReport = () => {
    const csv = generateCsv(periodTransactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financial-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatPhoneForPaystack = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      return `233${digits.slice(1)}`;
    }
    if (digits.startsWith("233")) {
      return digits;
    }
    if (digits.startsWith("+233")) {
      return digits.slice(1);
    }
    return digits;
  };

  const addDeposit = async (reference: string) => {
    setDepositError(null);

    if (!depositAmount || Number(depositAmount) <= 0) {
      setDepositError("Please enter a valid deposit amount.");
      return false;
    }

    const depositData: any = {
      donor: "Admin Deposit",
      email: depositEmail || null,
      amount: Number(depositAmount),
      purpose: depositSource || "Deposit",
      type: "deposit",
      status: "Completed",
      provider: depositMethod === "mobile_money" ? `${depositProvider.toUpperCase()} Mobile Money` : "Paystack Card",
      note: depositNote || `Admin deposit via Paystack (${reference})`,
      details: depositSource
        ? `Source: ${depositSource}; Reference: ${reference}; Note: ${depositNote}`
        : `Reference: ${reference}; Note: ${depositNote}`,
    };

    try {
      const response = await fetch(getApiUrl("/api/payments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(depositData),
      });

      if (!response.ok) {
        throw new Error("Failed to save deposit.");
      }

      setDepositAmount("");
      setDepositEmail("");
      setDepositSource("");
      setDepositNote("");
      setDepositMethod("card");
      setDepositProvider("mtn");
      setDepositPhone("");
      await fetchTransactions();
      return true;
    } catch (error) {
      console.error(error);
      setDepositError("Failed to save deposit. Please try again.");
      return false;
    }
  };

  const handleDepositPayment = async () => {
    setDepositError(null);

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
    if (!publicKey || publicKey.includes("your_paystack_public_key_here")) {
      setDepositError("Paystack public key is not configured. Please set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in .env.local.");
      return;
    }

    if (!depositEmail) {
      setDepositError("Please enter an email address for the deposit.");
      return;
    }

    if (!depositAmount || Number(depositAmount) <= 0) {
      setDepositError("Please enter a valid deposit amount.");
      return;
    }

    if (depositMethod === "mobile_money" && !depositPhone) {
      setDepositError("Please enter a valid mobile money phone number.");
      return;
    }

    if (!(window as any).PaystackPop || typeof (window as any).PaystackPop.setup !== "function") {
      setDepositError("Paystack is not loaded yet. Please refresh the page and try again.");
      return;
    }

    const normalizedPhone = formatPhoneForPaystack(depositPhone);
    const paymentConfig: any = {
      key: publicKey,
      email: depositEmail,
      amount: Math.round(parseFloat(depositAmount) * 100),
      currency: "GHS",
      ref: `txn_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: "Source", variable_name: "source", value: depositSource || "Admin Deposit" },
          { display_name: "Note", variable_name: "note", value: depositNote },
          { display_name: "Payment Method", variable_name: "payment_method", value: depositMethod === "mobile_money" ? `${depositProvider.toUpperCase()} Mobile Money` : "Card" },
        ],
      },
      callback: async (response: any) => {
        try {
          const verifyResponse = await fetch(getApiUrl('/api/paystack/verify'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: response.reference }),
          });
          const result = await verifyResponse.json();
          if (result.success) {
            setDepositError(null);
            alert(`Deposit successful! Reference: ${response.reference}`);
            fetchTransactions(); // Refresh the list immediately
          } else {
            setDepositError('Payment verification failed. Please contact support.');
          }
        } catch (error) {
          console.error('Verification error:', error);
          setDepositError('Payment verification failed. Please contact support.');
        }
      },
      onClose: () => {
        setDepositError("Payment cancelled.");
      },
    };

    if (depositMethod === "mobile_money") {
      paymentConfig.channels = ["mobile_money"];
      paymentConfig.mobile_money = {
        phone: normalizedPhone,
        provider: depositProvider,
        country: "GH",
      };
    } else {
      paymentConfig.channels = ["card"];
    }

    try {
      console.log("Paystack config:", paymentConfig);
      const paystack = (window as any).PaystackPop.setup(paymentConfig);
      console.log("Paystack setup successful, opening iframe");
      paystack.openIframe();
    } catch (error) {
      console.error("Paystack setup error:", error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      setDepositError(`Unable to start Paystack payment. Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const generateExpenseCsv = (items: PaymentTransaction[]) => {
    const csvRows = [
      [
        "Date",
        "Category",
        "Item Name",
        "Amount",
        "Currency",
        "Status",
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
      const response = await fetch(getApiUrl("/api/payments"), {
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
      setShowExpenseForm(false);
      await fetchTransactions();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments & Financial Reports</h1>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 mb-8">
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
          <p className="mt-3 text-3xl font-semibold text-dark dark:text-white">{transactionCount}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount Received</p>
          <p className="mt-3 text-3xl font-semibold text-green-600">GHS {totalReceived.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Deposits</p>
          <p className="mt-3 text-3xl font-semibold text-sky-600">GHS {totalDeposits.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Paid Covenant Seed Members</p>
          <p className="mt-3 text-3xl font-semibold text-primary">{covenantPaidThisMonth}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Covenant Seed This Month</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">GHS {covenantTotalCollectedThisMonth.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Covenant Seed Members</p>
          <p className="mt-3 text-3xl font-semibold text-dark dark:text-white">{covenantMembers.length}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Members Due This Month</p>
          <p className="mt-3 text-3xl font-semibold text-red-600">{Math.max(covenantMembers.length - covenantPaidThisMonth, 0)}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Paid This Month</p>
          <p className="mt-3 text-3xl font-semibold text-primary">{covenantPaidThisMonth}</p>
        </div>
        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Covenant Seed Total</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">GHS {covenantTotalCollectedThisMonth.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 mb-8">
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

      <div className="mb-8 rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-dark dark:text-white">Report Filters</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose a period and download the report as a spreadsheet.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-body-color/10 bg-white px-4 py-2 text-sm text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-body-color/10 bg-white px-4 py-2 text-sm text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={downloadReport}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Download Spreadsheet
            </button>
            <button
              type="button"
              onClick={downloadExpenseReport}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              Download Expense Items Report
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <div className="mb-6 rounded-3xl bg-slate-50 p-6 dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Deposit Funds</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Add money directly to the church account. Deposits count as income and increase the available balance immediately.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Amount (GHS)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
              <input
                type="email"
                value={depositEmail}
                onChange={(e) => setDepositEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                placeholder="Admin email"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Source</label>
              <input
                type="text"
                value={depositSource}
                onChange={(e) => setDepositSource(e.target.value)}
                className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                placeholder="Deposit source"
              />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Payment Method</label>
              <select
                value={depositMethod}
                onChange={(e) => setDepositMethod(e.target.value)}
                className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
              >
                <option value="card">Card</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
            {depositMethod === "mobile_money" && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Mobile Money Phone</label>
                <input
                  type="tel"
                  value={depositPhone}
                  onChange={(e) => setDepositPhone(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                  placeholder="e.g. +256770000000"
                />
              </div>
            )}
            {depositMethod === "mobile_money" && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Provider</label>
                <select
                  value={depositProvider}
                  onChange={(e) => setDepositProvider(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                >
                  <option value="mtn">MTN</option>
                  <option value="airtel">Airtel</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Note</label>
              <input
                type="text"
                value={depositNote}
                onChange={(e) => setDepositNote(e.target.value)}
                className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                placeholder="Optional note"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDepositPayment}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Deposit with Paystack
            </button>
            {depositError && <p className="text-sm text-red-600 dark:text-red-400">{depositError}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-dark dark:text-white">Expense Tracker</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Record purchases or money spent from church funds.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="rounded-lg bg-secondary px-5 py-2 text-sm font-semibold text-white hover:bg-secondary/90"
          >
            {showExpenseForm ? "Hide Expense Form" : "Add Expense"}
          </button>
        </div>

        {showExpenseForm && (
          <>
            <div className="space-y-4 border-t border-body-color/10 pt-6 dark:border-white/10">
              <div className="grid gap-4 md:grid-cols-3">
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
                <div>
                  <label className="text-sm font-medium text-dark dark:text-white">Expense Note</label>
                  <input
                    type="text"
                    value={expenseNote}
                    onChange={(e) => setExpenseNote(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-2 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                    placeholder="Vendor, purpose, or reference"
                  />
                </div>
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
                <label className="text-sm font-medium text-dark dark:text-white">Expense Description</label>
                <textarea
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-body-color/10 bg-white px-4 py-3 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-white/10 dark:bg-gray-900 dark:text-white"
                  placeholder="What was purchased?"
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
                onClick={downloadExpenseReport}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
              >
                Download Expense Items Report
              </button>
              <button
                type="button"
                onClick={addExpense}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Save Expense
              </button>
            </div>
            {expenseError && (
              <p className="text-sm text-red-600 dark:text-red-400">{expenseError}</p>
            )}
          </>
        )}
      </div>

      <div className="mb-8 rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-dark dark:text-white">Covenant Seed Subscriptions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Recurring Covenant Seed charges are processed automatically when the site is visited and due billing dates are reached.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-body-color/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-gray-950">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Recurring Subscriptions</p>
            <p className="mt-3 text-3xl font-semibold text-dark dark:text-white">{activeRecurringCount}</p>
          </div>
          <div className="rounded-2xl border border-body-color/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-gray-950">
            <p className="text-sm text-gray-500 dark:text-gray-400">Due for Charge</p>
            <p className="mt-3 text-3xl font-semibold text-dark dark:text-white">{dueRecurringCount}</p>
          </div>
          <div className="rounded-2xl border border-body-color/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-gray-950">
            <p className="text-sm text-gray-500 dark:text-gray-400">Subscriptions Loaded</p>
            <p className="mt-3 text-3xl font-semibold text-dark dark:text-white">{subscriptions.length}</p>
          </div>
          <div className="rounded-2xl border border-body-color/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-gray-950">
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading Status</p>
            <p className="mt-3 text-3xl font-semibold text-dark dark:text-white">
              {subscriptionsLoading ? "Loading..." : "Ready"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">Covenant Seed Member Activity</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Track members subscribed to Covenant Seed and compare monthly deductions against the active member list.
        </p>
        {covenantMembers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Covenant Seed members have been added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Paid This Month</th>
                  <th className="px-4 py-3">Last Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {covenantMemberStatus.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{member.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{member.email}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        member.status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      {member.paidThisMonth ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {member.lastPaidAt ? new Date(member.lastPaidAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">Transactions</h2>

        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading transactions...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{new Date(transaction.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{transaction.type}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{transaction.purpose}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">GHS {transaction.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        transaction.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{transaction.note || transaction.details || "-"}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{transaction.provider || "-"}</td>
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

export default PaymentsPage;
