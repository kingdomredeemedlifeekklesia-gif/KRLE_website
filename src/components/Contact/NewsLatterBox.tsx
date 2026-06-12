"use client";

import { useState } from "react";

const NewsLatterBox = () => {
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      // Validation
      if (!name.trim() || name.trim().length < 2) {
        throw new Error("Please enter a valid name (at least 2 characters).");
      }

      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      const cleanPhone = whatsappNumber.replace(/\s/g, "");
      if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
        throw new Error("Please enter a valid WhatsApp number (e.g., +256770000000).");
      }

      const response = await fetch("/api/community/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, whatsappNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Unable to join. Please try again.");
      }

      setName("");
      setWhatsappNumber("");
      setStatus("success");
      setFeedback("Welcome! You have joined our community and will receive daily updates.");
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "There was a problem joining. Please try again later.");
    }
  };

  return (
    <div className="h-full shadow-three relative z-10 rounded-xs bg-white p-8 sm:p-11 lg:p-8 xl:p-11">
      <h3 className="mb-4 text-2xl leading-tight font-bold text-black">
        Join our community and receive daily updates
      </h3>
      <p className="border-body-color/25 text-body-color mb-11 border-b pb-11 text-base leading-relaxed">
        Enter your full name and WhatsApp number to receive daily devotionals, service reminders, and community updates via SMS and WhatsApp.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="border-stroke text-body-color focus:border-primary mb-4 w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden"
          required
        />
        <input
          type="tel"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="Enter your WhatsApp number (e.g., +1234567890)"
          className="border-stroke text-body-color focus:border-primary mb-4 w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden"
          required
        />
        {feedback && (
          <p className={`mb-4 text-sm ${status === "success" ? "text-green-600" : "text-red-600"}`}>
            {feedback}
          </p>
        )}
        <input
          type="submit"
          value={status === "sending" ? "Joining..." : "Join Community"}
          disabled={status === "sending"}
          className="bg-primary shadow-submit hover:bg-primary/90 mb-5 flex w-full cursor-pointer items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300 disabled:cursor-not-allowed disabled:bg-primary/50"
        />
        <p className="text-body-color text-center text-base leading-relaxed">
          We respect your privacy and will only send relevant community updates.
        </p>
      </form>

      <div>
        <span className="absolute top-7 left-2">
          <svg
            width="57"
            height="65"
            viewBox="0 0 57 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.5"
              d="M0.407629 15.9573L39.1541 64.0714L56.4489 0.160793L0.407629 15.9573Z"
              fill="url(#paint0_linear_1028_600)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_1028_600"
                x1="-18.3187"
                y1="55.1044"
                x2="37.161"
                y2="15.3509"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0.62" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      </div>
    </div>
  );
};

export default NewsLatterBox;
