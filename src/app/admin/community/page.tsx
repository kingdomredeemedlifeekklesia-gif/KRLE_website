"use client";

import { useEffect, useState } from "react";

interface CommunityMember {
  id: string;
  name: string;
  whatsappNumber: string;
  joinedAt: string;
}

const CommunityPage = () => {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch members
  useEffect(() => {
    fetchMembers();
  }, []);

  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(getApiUrl("/api/community/join"), { cache: "no-store" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to load members.");
      }
      const data: CommunityMember[] = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load community members.");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual entry
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setError("");

    try {
      const response = await fetch(getApiUrl("/api/community/join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, whatsappNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add member.");
      }

      setName("");
      setWhatsappNumber("");
      setSuccessMessage(`${name} has been added to the community!`);
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteMember = async (id: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName}?`)) return;

    try {
      const response = await fetch(getApiUrl(`/api/community/join?id=${id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete member.");
      }

      setSuccessMessage(`${memberName} has been removed.`);
      await fetchMembers();
    } catch (err) {
      setError("Failed to delete member.");
    }
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    if (members.length === 0) {
      alert("No members to export.");
      return;
    }

    const headers = ["Name", "WhatsApp Number", "Joined Date"];
    const rows = members.map((m) => [
      m.name,
      m.whatsappNumber,
      new Date(m.joinedAt).toLocaleDateString(),
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `community-members-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Community Members Management
      </h1>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded text-green-700 dark:text-green-300">
          ✓ {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-red-700 dark:text-red-300">
          ✗ {error}
        </div>
      )}

      {/* Manual Entry Form */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Add New Member
        </h2>
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="tel"
              placeholder="WhatsApp Number (e.g., +1234567890)"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              required
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Adding..." : "Add Member"}
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Registered Members ({members.length})
          </h2>
          <button
            onClick={handleExportCSV}
            disabled={members.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Export CSV
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No members have joined yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    WhatsApp Number
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Joined Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {member.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {member.whatsappNumber}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-sm">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Delete
                      </button>
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

export default CommunityPage;
