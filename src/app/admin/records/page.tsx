"use client";

import { useEffect, useState } from "react";

interface RecordItem {
  id: string;
  type: string;
  name: string;
  email: string;
  joinedAt: string;
  status: string;
}

const RecordsPage = () => {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState({
    type: "Member",
    name: "",
    email: "",
    joinedAt: new Date().toISOString().slice(0, 10),
    status: "Active",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(getApiUrl("/api/records"), { cache: "no-store" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Unable to load records.");
      }
      const data: RecordItem[] = await response.json();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    if (filter === "all") return true;
    return record.type.toLowerCase() === filter;
  });

  const resetForm = () => {
    setEditingId(null);
    setRecordForm({
      type: "Member",
      name: "",
      email: "",
      joinedAt: new Date().toISOString().slice(0, 10),
      status: "Active",
    });
    setSuccessMessage("");
    setError("");
  };

  const handleFormChange = (field: string, value: string) => {
    setRecordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        type: recordForm.type,
        name: recordForm.name.trim(),
        email: recordForm.email.trim(),
        joinedAt: recordForm.joinedAt,
        status: recordForm.status,
      };

      if (!payload.name || !payload.email) {
        throw new Error("Name and email are required.");
      }

      if (payload.name.length < 2) {
        throw new Error("Name must be at least 2 characters long.");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        throw new Error("Please enter a valid email address.");
      }

      const response = await fetch(getApiUrl("/api/records"), {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to save record.");
      }

      setSuccessMessage(editingId ? "Record updated successfully." : "Record created successfully.");
      resetForm();
      await fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRecord = (record: RecordItem) => {
    setEditingId(record.id);
    setRecordForm({
      type: record.type,
      name: record.name,
      email: record.email,
      joinedAt: record.joinedAt.slice(0, 10),
      status: record.status,
    });
    setSuccessMessage("");
    setError("");
  };

  const handleDeleteRecord = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;

    try {
      const response = await fetch(getApiUrl(`/api/records?id=${id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to delete record.");
      }

      setSuccessMessage("Record deleted successfully.");
      await fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Records Management</h1>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded text-green-700 dark:text-green-300">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr] mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? "Edit Record" : "Add New Record"}
          </h2>
          <form onSubmit={handleSaveRecord} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">Type</span>
                <select
                  value={recordForm.type}
                  onChange={(e) => handleFormChange("type", e.target.value)}
                  className="mt-1 block w-full rounded border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Member">Member</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Covenant Seed Member">Covenant Seed Member</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">Status</span>
                <select
                  value={recordForm.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  className="mt-1 block w-full rounded border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300">Full Name</span>
              <input
                type="text"
                value={recordForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
                className="mt-1 block w-full rounded border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
              <input
                type="email"
                value={recordForm.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                required
                className="mt-1 block w-full rounded border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300">Joined Date</span>
              <input
                type="date"
                value={recordForm.joinedAt}
                onChange={(e) => handleFormChange("joinedAt", e.target.value)}
                className="mt-1 block w-full rounded border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : editingId ? "Update Record" : "Create Record"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 border border-gray-300 rounded text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Records</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto rounded border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2"
            >
              <option value="all">All Records</option>
              <option value="member">Members</option>
              <option value="volunteer">Volunteers</option>
              <option value="covenant seed member">Covenant Seed Members</option>
            </select>
          </div>

          {loading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading records...</p>
          ) : filteredRecords.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{record.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{record.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{record.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{new Date(record.joinedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          record.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id, record.name)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
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
    </div>
  );
};

export default RecordsPage;
