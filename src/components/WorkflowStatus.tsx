"use client";
import React, { useEffect, useState } from "react";

interface WorkflowInstance {
  id: string;
  status: string;
  currentStep: string;
  documentId: string;
}

interface WorkflowLog {
  id: string;
  action: "approved" | "rejected" | "commented";
  comment: string;
  createdAt: string;
  userId: string;
}

interface PayloadFieldProps {
  path: string;
  name: string;
  label?: string;
  data?: any;
  user?: any;
  doc?: any;
  value?: any;
  [key: string]: any;
}

// Centralized styling and constants
const styles = {
  container: {
    padding: "1rem",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginTop: "1rem",
  },
  message: { padding: "1rem" },
  header: {
    marginTop: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  badge: {
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
  },
  buttonGroup: {
    marginTop: "1rem",
    display: "flex",
    gap: "1rem",
  },
  button: {
    padding: "8px 16px",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  logItem: {
    padding: "0.5rem 0",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
  },
};

const statusColors = {
  approved: "#28a745",
  completed: "#28a745",
  rejected: "#dc3545",
  pending: "#ffc107",
  default: "#6c757d",
};

const WorkflowStatus: React.FC<PayloadFieldProps> = (props) => {
  // Get document ID from various possible sources
  const docId = 
    props.data?.id || 
    props.doc?.id || 
    props.value?.id || 
    (typeof window !== "undefined" && window.location.pathname.split("/").pop());

  // State management
  const [workflow, setWorkflow] = useState<WorkflowInstance | null>(null);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workflow data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [wfRes, logRes] = await Promise.all([
        fetch(`/api/document-workflows?where[documentId][equals]=${docId}`),
        fetch(`/api/workflow-logs?where[documentId][equals]=${docId}&sort=-createdAt`),
      ]);

      if (!wfRes.ok || !logRes.ok) throw new Error("Failed to fetch data");

      const [wfData, logData] = await Promise.all([wfRes.json(), logRes.json()]);
      setWorkflow(wfData.docs?.[0] || null);
      setLogs(logData.docs || []);
    } catch (err) {
      setError("Failed to load workflow");
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or docId changes
  useEffect(() => {
    if (docId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [docId]);

  // Handle approve/reject actions
  const handleAction = async (action: "approved" | "rejected", comment?: string) => {
    try {
      const response = await fetch("/api/workflow-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          collection: "blog",
          stepId: workflow?.currentStep || "1",
          action,
          userId: props.user?.id || "system",
          comment: comment || (action === "approved" ? "Approved" : "Rejected"),
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${action}`);
      await fetchData(); // Refresh data
    } catch (err) {
      alert(`Failed to ${action} document`);
    }
  };

  const handleApprove = () => handleAction("approved");
  
  const handleReject = () => {
    const reason = window.prompt("Rejection reason:");
    if (reason !== null) {
      handleAction("rejected", reason || "Rejected");
    }
  };

  // Helper function for status colors
  const getStatusColor = (status: string) => 
    statusColors[status?.toLowerCase() as keyof typeof statusColors] || statusColors.default;

  // Early returns for different states
  if (!docId) {
    return (
      <p style={{ ...styles.message, background: "#f0f0f0" }}>
        💾 Save the document to view workflow status
      </p>
    );
  }

  if (loading) {
    return <p style={styles.message}>⏳ Loading workflow…</p>;
  }

  if (error) {
    return (
      <p style={{ ...styles.message, color: "red" }}>
        ⚠️ {error}
      </p>
    );
  }

  if (!workflow) {
    return (
      <p style={{ ...styles.message, background: "#fafafa" }}>
        📄 No workflow found for this document
      </p>
    );
  }

  // Main render
  return (
    <div style={styles.container}>
      {/* Header with status badge */}
      <h3 style={styles.header}>
        📋 Workflow Status
        <span
          style={{
            ...styles.badge,
            background: getStatusColor(workflow.status),
          }}
        >
          {workflow.status}
        </span>
      </h3>

      {/* Current step info */}
      <p>
        <strong>Current Step:</strong> {workflow.currentStep}
      </p>

      {/* Action buttons (only show when pending) */}
      {workflow.status === "pending" && (
        <div style={styles.buttonGroup}>
          <button
            onClick={handleApprove}
            style={{ ...styles.button, backgroundColor: "#28a745" }}
          >
            ✅ Approve
          </button>
          <button
            onClick={handleReject}
            style={{ ...styles.button, backgroundColor: "#dc3545" }}
          >
            ❌ Reject
          </button>
        </div>
      )}

      {/* Workflow history */}
      <h4 style={{ marginTop: "2rem" }}>📝 Workflow History</h4>
      {logs.length === 0 ? (
        <p style={{ fontStyle: "italic", color: "#666" }}>No history yet.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
          {logs.map((log) => (
            <li key={log.id} style={styles.logItem}>
              <span>
                <strong style={{ textTransform: "capitalize" }}>
                  {log.action}
                </strong>
                {log.comment && ` — ${log.comment}`}
              </span>
              <span style={{ fontSize: "12px", color: "#888" }}>
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkflowStatus;