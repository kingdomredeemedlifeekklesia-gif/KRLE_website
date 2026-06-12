"use client";

import { useEffect, useState } from "react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  message: string;
  status: string;
  adminReply: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

const EmailsPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"inbox" | "compose">("inbox");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "replied">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // Compose state
  const [newEmailTo, setNewEmailTo] = useState("");
  const [newEmailSubject, setNewEmailSubject] = useState("");
  const [newEmailBody, setNewEmailBody] = useState("");
  const [composing, setComposing] = useState(false);

  // Email templates
  const [templates] = useState([
    {
      id: "1",
      name: "Thank You Response",
      content: "Thank you for reaching out to us. We have received your message and will get back to you soon.",
    },
    {
      id: "2",
      name: "Event Announcement",
      content: "We are excited to announce an upcoming event. Please visit our website for more details and to register.",
    },
    {
      id: "3",
      name: "Prayer Request",
      content: "Thank you for sharing your prayer request with us. We will keep you in our prayers.",
    },
    {
      id: "4",
      name: "Donation Acknowledgment",
      content: "Thank you for your generous donation. Your contribution will help us continue our mission.",
    },
  ]);

  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let filtered = messages;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  }, [messages, statusFilter, searchTerm]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/contacts"));
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to load messages.");
      }
      const data: ContactMessage[] = await response.json();
      setMessages(data);
      if (data.length > 0 && !selectedMessage) {
        setSelectedMessage(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load contact messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);

    if (message.status === "unread") {
      try {
        const response = await fetch(getApiUrl("/api/contacts"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: message.id, status: "read" }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark message as read.");
        }

        const updated = await response.json();
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setSelectedMessage(updated);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      setError("Please enter a reply message.");
      return;
    }

    setReplying(true);
    setError("");
    setSuccessMessage("");

    try {
      const sendEmailResponse = await fetch(getApiUrl("/api/send-email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedMessage.email,
          subject: `Re: Your message to Kingdom Redeemed Life Ecclesia`,
          body: replyText,
        }),
      });

      if (!sendEmailResponse.ok) {
        const errorData = await sendEmailResponse.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to send reply email.");
      }

      const response = await fetch(getApiUrl("/api/contacts"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMessage.id,
          adminReply: replyText,
          status: "replied",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update message status.");
      }

      const updatedMessage = await response.json();
      setSelectedMessage(updatedMessage);
      setMessages(messages.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
      setReplyText("");
      setSuccessMessage("Reply email sent successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/contacts?id=${messageId}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete message.");
      }

      setMessages(messages.filter((m) => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        const remaining = messages.find((m) => m.id !== messageId);
        setSelectedMessage(remaining ?? null);
      }
      setSuccessMessage("Message deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete message.");
    }
  };

  const handleSendEmail = async () => {
    if (!newEmailTo.trim() || !newEmailSubject.trim() || !newEmailBody.trim()) {
      setError("Please fill in all email fields.");
      return;
    }

    setComposing(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(getApiUrl("/api/send-email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: newEmailTo,
          subject: newEmailSubject,
          body: newEmailBody,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email.");
      }

      setNewEmailTo("");
      setNewEmailSubject("");
      setNewEmailBody("");
      setActiveTab("inbox");
      setSuccessMessage("Email sent successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email.");
    } finally {
      setComposing(false);
    }
  };

  const useTemplate = (template: (typeof templates)[0]) => {
    setNewEmailBody(template.content);
  };

  const getStats = () => {
    return {
      total: messages.length,
      unread: messages.filter((m) => m.status === "unread").length,
      read: messages.filter((m) => m.status === "read").length,
      replied: messages.filter((m) => m.status === "replied").length,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Email Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your contact messages and send emails</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Messages</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Unread</p>
          <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Read</p>
          <p className="text-2xl font-bold text-blue-600">{stats.read}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Replied</p>
          <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex-1 px-6 py-4 font-medium border-b-2 transition-colors ${
              activeTab === "inbox"
                ? "text-primary border-primary"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            📬 Inbox
          </button>
          <button
            onClick={() => setActiveTab("compose")}
            className={`flex-1 px-6 py-4 font-medium border-b-2 transition-colors ${
              activeTab === "compose"
                ? "text-primary border-primary"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            ✏️ Compose Email
          </button>
        </div>

        <div className="p-6">
          {/* Inbox Tab */}
          {activeTab === "inbox" && (
            <div>
              {loading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Message List */}
                  <div className="lg:col-span-1">
                    {/* Filters */}
                    <div className="space-y-4 mb-4">
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                      />

                      <div className="flex flex-wrap gap-2">
                        {["all", "unread", "read", "replied"].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setStatusFilter(filter as any)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                              statusFilter === filter
                                ? "bg-primary text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                          >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                      {filteredMessages.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No messages found</p>
                      ) : (
                        filteredMessages.map((message) => (
                          <button
                            key={message.id}
                            onClick={() => handleSelectMessage(message)}
                            className={`w-full text-left p-3 rounded-lg transition-all ${
                              selectedMessage?.id === message.id
                                ? "bg-primary/10 border-2 border-primary"
                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 dark:text-white truncate">
                                  {message.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {message.email}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                                  {message.message}
                                </p>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded whitespace-nowrap font-medium ${
                                  message.status === "replied"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                    : message.status === "read"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                }`}
                              >
                                {message.status === "replied"
                                  ? "✓"
                                  : message.status === "read"
                                  ? "•"
                                  : "●"}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Message Details */}
                  <div className="lg:col-span-2 space-y-4">
                    {selectedMessage ? (
                      <>
                        {/* Contact Info */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                            Contact Information
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Name</p>
                              <p className="text-gray-800 dark:text-white font-medium">{selectedMessage.name}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Email</p>
                              <p className="text-gray-800 dark:text-white font-medium break-all">
                                {selectedMessage.email}
                              </p>
                            </div>
                            {selectedMessage.whatsapp && (
                              <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">WhatsApp</p>
                                <p className="text-gray-800 dark:text-white font-medium">
                                  {selectedMessage.whatsapp}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Date</p>
                              <p className="text-gray-800 dark:text-white font-medium">
                                {new Date(selectedMessage.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Message</h3>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {selectedMessage.message}
                          </p>
                        </div>

                        {/* Reply Section */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                          <h3 className="font-semibold text-green-900 dark:text-green-200 mb-3">Send Reply</h3>
                          {selectedMessage.adminReply && (
                            <div className="mb-3 p-3 bg-green-100 dark:bg-green-900/40 rounded border border-green-300 dark:border-green-700">
                              <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                                Already replied:
                              </p>
                              <p className="text-sm text-green-800 dark:text-green-200">
                                {selectedMessage.adminReply}
                              </p>
                            </div>
                          )}
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply message..."
                            rows={3}
                            className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-900/30 dark:text-white text-sm resize-none mb-3"
                          />
                          <button
                            onClick={handleReply}
                            disabled={replying}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors font-medium"
                          >
                            {replying ? "Sending..." : "Send Reply"}
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(selectedMessage.id)}
                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                        >
                          Delete Message
                        </button>
                      </>
                    ) : (
                      <div className="col-span-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">Select a message to view details</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compose Tab */}
          {activeTab === "compose" && (
            <div className="max-w-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To Email
                  </label>
                  <input
                    type="email"
                    value={newEmailTo}
                    onChange={(e) => setNewEmailTo(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newEmailSubject}
                    onChange={(e) => setNewEmailSubject(e.target.value)}
                    placeholder="Email subject"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newEmailBody}
                    onChange={(e) => setNewEmailBody(e.target.value)}
                    placeholder="Write your email message here..."
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white resize-none"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {newEmailBody.length} characters
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Templates</h3>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => useTemplate(template)}
                        className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSendEmail}
                  disabled={composing}
                  className="w-full px-4 py-3 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  {composing ? "Sending..." : "Send Email"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailsPage;
