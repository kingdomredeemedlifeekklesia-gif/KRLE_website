"use client";

import { useEffect, useState } from "react";

const DonationForm = () => {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("Tithe");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("mtn");
  const [recurring, setRecurring] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [paystackLoading, setPaystackLoading] = useState(true);
  const covenantSeedAmounts = [100, 500, 1000];

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
  const isKeyMissing = !publicKey || publicKey.includes("your_paystack_public_key_here");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  const loadPaystackScript = () => {
    if (typeof window === "undefined") return;

    if ((window as any).PaystackPop) {
      setPaystackLoaded(true);
      setPaystackLoading(false);
      return;
    }

    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]') as HTMLScriptElement | null;
    if (existingScript) {
      if (existingScript.readyState === "complete" || existingScript.readyState === "loaded") {
        if ((window as any).PaystackPop) {
          setPaystackLoaded(true);
          setPaystackLoading(false);
          return;
        }
      }

      existingScript.addEventListener("load", () => {
        setPaystackLoaded(true);
        setPaystackLoading(false);
      });
      existingScript.addEventListener("error", () => {
        setPaystackLoaded(false);
        setPaystackLoading(false);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      setPaystackLoaded(true);
      setPaystackLoading(false);
      script.setAttribute("data-loaded", "true");
    };
    script.onerror = () => {
      setPaystackLoaded(false);
      setPaystackLoading(false);
    };
    document.body.appendChild(script);
  };

  useEffect(() => {
    loadPaystackScript();
  }, []);

  const handlePayment = () => {
    setPaymentStatus(null);
    setPaymentError(null);

    if (isKeyMissing) {
      setPaymentError(
        "Paystack public key is not configured. Please set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in .env.local."
      );
      return;
    }

    if (!paystackLoaded) {
      if (paystackLoading) {
        setPaymentError("Paystack is still loading. Please wait a moment and try again.");
      } else {
        setPaymentError("Paystack could not load. Please refresh the page and try again.");
      }
      return;
    }

    if (!(window as any).PaystackPop || typeof (window as any).PaystackPop.setup !== "function") {
      setPaymentError("Paystack is not available yet. Please refresh the page and try again.");
      return;
    }

    if (purpose === "Covenant Seed" && paymentMethod !== "card") {
      setPaymentError("Covenant Seed donations must use card payment for monthly deduction.");
      return;
    }

    const normalizedPhone = formatPhoneForPaystack(phone);
    const paymentConfig: any = {
      key: publicKey,
      email,
      amount: Math.round(parseFloat(amount) * 100),
      currency: "GHS",
      ref: `txn_${Date.now()}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Name",
            variable_name: "name",
            value: name,
          },
          {
            display_name: "Purpose",
            variable_name: "purpose",
            value: purpose,
          },
          {
            display_name: "Payment Method",
            variable_name: "payment_method",
            value: paymentMethod === "mobile_money" ? `Mobile Money (${provider.toUpperCase()})` : "Card",
          },
          {
            display_name: "Recurring Gift",
            variable_name: "recurring",
            value: purpose === "Covenant Seed" && recurring ? "Monthly Covenant Deduction" : "One-time",
          },
        ],
      },
      callback: (response: any) => {
        fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: response.reference }),
        })
          .then(verifyResponse => verifyResponse.json())
          .then(result => {
            if (result.success) {
              setPaymentStatus(`Payment successful! Reference: ${response.reference}`);
              alert(`Payment successful! Reference: ${response.reference}`);
            } else {
              setPaymentError('Payment verification failed. Please contact support.');
            }
          })
          .catch(error => {
            console.error('Verification error:', error);
            setPaymentError('Payment verification failed. Please contact support.');
          });
      },
      onClose: () => {
        setPaymentError("Payment cancelled.");
      },
    };

    if (paymentMethod === "mobile_money") {
      if (!normalizedPhone) {
        setPaymentError("Please enter a valid mobile money phone number.");
        return;
      }
      paymentConfig.channels = ["mobile_money"];
      paymentConfig.mobile_money = {
        phone: normalizedPhone,
        provider,
        country: "GH",
      };
    } else {
      paymentConfig.channels = ["card"];
    }

    try {
      const paystack = (window as any).PaystackPop.setup(paymentConfig);
      paystack.openIframe();
    } catch (error) {
      console.error("Paystack setup error:", error);
      setPaymentError(
        "Unable to start Paystack payment. If mobile money does not work, please use the bank transfer/mobile money instructions below."
      );
    }
  };

  return (
    <div className="rounded-[20px] border border-body-color/10 bg-white p-8 shadow-three dark:border-white/10 dark:bg-[#11131A] dark:shadow-none">
      <h2 className="mb-6 text-2xl font-bold text-dark dark:text-white">Secure Online Donation</h2>
      {isKeyMissing && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-600/30 dark:bg-red-900/10 dark:text-red-200">
          Paystack public key is missing. Set <span className="font-semibold">NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</span> in <span className="font-semibold">.env.local</span> and restart the server.
        </div>
      )}
      {paymentError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-600/30 dark:bg-red-900/10 dark:text-red-200">
          {paymentError}
        </div>
      )}
      {paymentStatus && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-600/30 dark:bg-green-900/10 dark:text-green-200">
          {paymentStatus}
        </div>
      )}
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-dark dark:text-white">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-body-color/20 bg-white px-3 py-2 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:bg-[#2C303B] dark:text-white"
            placeholder="Enter your full name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-dark dark:text-white">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-body-color/20 bg-white px-3 py-2 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:bg-[#2C303B] dark:text-white"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-dark dark:text-white">
            {purpose === "Covenant Seed" ? "Covenant Seed Amount (GHS)" : "Donation Amount (GHS)"}
          </label>
          {purpose === "Covenant Seed" ? (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {covenantSeedAmounts.map((amountOption) => (
                <button
                  key={amountOption}
                  type="button"
                  onClick={() => setAmount(String(amountOption))}
                  className={`rounded-md border px-4 py-3 text-sm font-semibold ${amount === String(amountOption) ? "bg-primary text-white" : "bg-slate-100 text-dark hover:bg-slate-200 dark:bg-white/10 dark:text-white"}`}
                >
                  GHS {amountOption}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border border-body-color/20 bg-white px-3 py-2 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:bg-[#2C303B] dark:text-white"
              placeholder="Enter amount"
              min="1"
              required
            />
          )}
          {purpose === "Covenant Seed" && (
            <p className="mt-2 text-sm text-body-color dark:text-body-color-dark">
              Choose a fixed Covenant Seed amount. Your card details will be collected in Paystack checkout and retained for automatic monthly deduction.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-dark dark:text-white">
            Purpose of Donation
          </label>
          <select
            id="purpose"
            value={purpose}
            onChange={(e) => {
              const value = e.target.value;
              setPurpose(value);
              if (value === "Covenant Seed") {
                setPaymentMethod("card");
                setRecurring(true);
                setAmount(String(covenantSeedAmounts[0]));
              } else {
                setRecurring(false);
              }
            }}
            className="mt-1 block w-full rounded-md border border-body-color/20 bg-white px-3 py-2 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:bg-[#2C303B] dark:text-white"
          >
            <option value="Tithe">Tithe</option>
            <option value="Offertory">Offertory</option>
            <option value="Thanksgiving Program Sponsor">Thanksgiving Program Sponsor</option>
            <option value="Covenant Seed">Covenant Seed</option>
            <option value="General">General</option>
          </select>
        </div>
        {purpose === "Covenant Seed" && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-dark dark:border-primary/30 dark:bg-white/5 dark:text-white">
            <p className="mb-3 font-semibold text-dark dark:text-white">Covenant Seed Monthly Deduction</p>
            <label className="inline-flex items-center gap-2 text-dark dark:text-white">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="h-4 w-4 rounded border-body-color/20 bg-primary text-primary focus:ring-primary"
              />
              Automatic monthly card deduction enabled.
            </label>
            <p className="mt-2 text-xs text-body-color dark:text-body-color-dark">
              Covenant Seed is a fixed monthly commitment. Card details are collected through Paystack and used for secure recurring deduction.
            </p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-dark dark:text-white">
            Payment Method
          </label>
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${paymentMethod === "card" ? "bg-primary text-white" : "bg-slate-100 text-dark hover:bg-slate-200 dark:bg-white/10 dark:text-white"}`}
            >
              Card
            </button>
            {purpose !== "Covenant Seed" && (
              <button
                type="button"
                onClick={() => setPaymentMethod("mobile_money")}
                className={`rounded-md px-4 py-2 text-sm font-semibold ${paymentMethod === "mobile_money" ? "bg-primary text-white" : "bg-slate-100 text-dark hover:bg-slate-200 dark:bg-white/10 dark:text-white"}`}
              >
                Mobile Money
              </button>
            )}
          </div>
          {purpose === "Covenant Seed" && (
            <p className="mt-3 text-sm text-body-color dark:text-body-color-dark">
              Covenant Seed requires card payment so your monthly deduction can be authorized securely through Paystack. Your card details are entered in the Paystack checkout.
            </p>
          )}
        </div>
        {paymentMethod === "mobile_money" && (
          <>
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-dark dark:text-white">
                Mobile Money Provider
              </label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1 block w-full rounded-md border border-body-color/20 bg-white px-3 py-2 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:bg-[#2C303B] dark:text-white"
              >
                <option value="mtn">MTN</option>
                <option value="airtel">AirtelTigo</option>
                <option value="africell">Telecel</option>
              </select>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-dark dark:text-white">
                Mobile Money Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border border-body-color/20 bg-white px-3 py-2 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/20 dark:bg-[#2C303B] dark:text-white"
                placeholder="e.g. +256700123456"
                required={paymentMethod === "mobile_money"}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Use your mobile money number in international format, e.g. +256700123456.</p>
            </div>
          </>
        )}
        {paystackLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Paystack payment gateway...</p>
        )}
        <div className="text-center">
          <button
            type="submit"
            disabled={
              !amount ||
              !email ||
              !name ||
              isKeyMissing ||
              !paystackLoaded ||
              (paymentMethod === "mobile_money" && !phone)
            }
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Pay with Paystack
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;