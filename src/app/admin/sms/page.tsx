"use client";

import { useEffect, useState } from "react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  message: string;
  status: string;
}

interface CommunityMember {
  id: string;
  name: string;
  whatsappNumber: string;
  joinedAt: string;
}

interface SMSLog {
  id: string;
  recipient: string;
  message: string;
  timestamp: string;
  status: "sent" | "failed";
}

const SMSPage = () => {
  const [activeTab, setActiveTab] = useState<"individual" | "bulk" | "contacts" | "logs">("individual");
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Individual SMS state
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [individualMessage, setIndividualMessage] = useState("");
  const [sendingIndividual, setSendingIndividual] = useState(false);

  // Bulk SMS state
  const [bulkMessage, setBulkMessage] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [bulkType, setBulkType] = useState<"all" | "selected">("all");
  const [sendingBulk, setSendingBulk] = useState(false);

  // SMS Templates
  const [templates, setTemplates] = useState([
    {
      id: "1",
      name: "Welcome Message",
      content: "Welcome to our community! We are glad to have you.",
    },
    {
      id: "2",
      name: "Event Reminder",
      content: "Reminder: We have an upcoming event. Check our website for details.",
    },
    {
      id: "3",
      name: "Donation Appeal",
      content: "Support our ministry and make a difference today!",
    },
  ]);

  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  useEffect(() => {
    if (activeTab === "individual" || activeTab === "contacts") {
      fetchContacts();
    } else if (activeTab === "bulk") {
      fetchCommunityMembers();
    }
  }, [activeTab]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/contacts"));
      if (!response.ok) throw new Error("Failed to load contacts");
      const data: ContactMessage[] = await response.json();
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/community/join"));
      if (!response.ok) throw new Error("Failed to load members");
      const data: CommunityMember[] = await response.json();
      setCommunityMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load community members");
    } finally {
      setLoading(false);
    }
  };

  const handleSendIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone.trim() || !individualMessage.trim()) {
      setError("Please fill in phone number and message");
      return;
    }

    setSendingIndividual(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(getApiUrl("/api/sms"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: recipientPhone,
          message: individualMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send SMS");
      }

      // Add to logs
      const newLog: SMSLog = {
        id: Date.now().toString(),
        recipient: `${recipientName || recipientPhone}`,
        message: individualMessage,
        timestamp: new Date().toLocaleString(),
        status: "sent",
      };
      setSmsLogs([newLog, ...smsLogs]);

      setSuccessMessage(`SMS sent to ${recipientName || recipientPhone}!`);
      setRecipientPhone("");
      setRecipientName("");
      setIndividualMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send SMS");
    } finally {
      setSendingIndividual(false);
    }
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkMessage.trim()) {
      setError("Please enter a message");
      return;
    }

    const membersToSend =
      bulkType === "all"
        ? communityMembers
        : communityMembers.filter((m) => selectedMembers.has(m.id));

    if (membersToSend.length === 0) {
      setError("Please select at least one member");
      return;
    }

    if (!confirm(`Send SMS to ${membersToSend.length} member(s)?`)) {
      return;
    }

    setSendingBulk(true);
    setError("");
    setSuccessMessage("");

    try {
      const phones = membersToSend.map((m) => m.whatsappNumber);
      const response = await fetch(getApiUrl("/api/sms"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phones,
          message: bulkMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send bulk SMS");
      }

      // Add logs for each recipient
      const newLogs = membersToSend.map((member) => ({
        id: `${Date.now()}-${member.id}`,
        recipient: member.name,
        message: bulkMessage,
        timestamp: new Date().toLocaleString(),
        status: "sent" as const,
      }));
      setSmsLogs([...newLogs, ...smsLogs]);

      setSuccessMessage(
        `SMS sent to ${membersToSend.length} member(s)!`
      );
      setBulkMessage("");
      setSelectedMembers(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send bulk SMS");
    } finally {
      setSendingBulk(false);
    }
  };

  const toggleMemberSelection = (id: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMembers(newSelected);
  };

  const useTemplate = (template: (typeof templates)[0]) => {
    if (activeTab === "individual") {
      setIndividualMessage(template.content);
    } else if (activeTab === "bulk") {
      setBulkMessage(template.content);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">SMS Management</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "individual", label: "📱 Individual SMS" },
            { id: "bulk", label: "📤 Bulk SMS" },
            { id: "contacts", label: "📋 Contact List" },
            { id: "logs", label: "📊 SMS Logs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Individual SMS Tab */}
        {activeTab === "individual" && (
          <form onSubmit={handleSendIndividual} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={individualMessage}
                onChange={(e) => setIndividualMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white resize-none"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {individualMessage.length} characters
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Templates
              </h3>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => useTemplate(template)}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingIndividual}
              className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition-colors font-medium"
            >
              {sendingIndividual ? "Sending..." : "Send SMS"}
            </button>
          </form>
        )}

        {/* Bulk SMS Tab */}
        {activeTab === "bulk" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Select Recipients
              </h3>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={bulkType === "all"}
                    onChange={() => setBulkType("all")}
                    className="mr-2"
                  />
                  <span>Send to All ({communityMembers.length})</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={bulkType === "selected"}
                    onChange={() => setBulkType("selected")}
                    className="mr-2"
                  />
                  <span>Send to Selected ({selectedMembers.size})</span>
                </label>
              </div>

              {bulkType === "selected" && (
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {communityMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.whatsappNumber}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSendBulk} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white resize-none"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {bulkMessage.length} characters
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick Templates
                </h3>
                <div className="flex flex-wrap gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => useTemplate(template)}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingBulk}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition-colors font-medium"
              >
                {sendingBulk
                  ? "Sending..."
                  : `Send to ${
                      bulkType === "all"
                        ? communityMembers.length
                        : selectedMembers.size
                    } Member(s)`}
              </button>
            </form>
          </div>
        )}

        {/* Contact List Tab */}
        {activeTab === "contacts" && (
          <div>
            {loading ? (
              <p className="text-gray-600 dark:text-gray-400">Loading contacts...</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {contacts.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No contacts found</p>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    >
                      <p className="font-medium text-gray-800 dark:text-white">
                        {contact.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Email: {contact.email}
                      </p>
                      {contact.whatsapp && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          WhatsApp: {contact.whatsapp}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Message: {contact.message.substring(0, 50)}...
                      </p>
                      <button
                        onClick={() => {
                          if (contact.whatsapp) {
                            setRecipientName(contact.name);
                            setRecipientPhone(contact.whatsapp);
                            setActiveTab("individual");
                          }
                        }}
                        className="mt-2 px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                        disabled={!contact.whatsapp}
                      >
                        {contact.whatsapp ? "Send SMS" : "No Phone"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* SMS Logs Tab */}
        {activeTab === "logs" && (
          <div>
            {smsLogs.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No SMS logs yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {smsLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-4 border-green-500"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white">
                          To: {log.recipient}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {log.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {log.timestamp}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          log.status === "sent"
                            ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {log.status === "sent" ? "✓ Sent" : "✗ Failed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSPage;
