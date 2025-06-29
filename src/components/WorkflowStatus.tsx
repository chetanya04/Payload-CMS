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

const WorkflowStatus: React.FC<PayloadFieldProps> = (props) => {
  // ——————————————————————————— helpers & state
  const docId =
    props.data?.id ||
    props.doc?.id ||
    props.value?.id ||
    (typeof window !== "undefined" && window.location.pathname.split("/").pop());

  const [workflow, setWorkflow] = useState<WorkflowInstance | null>(null);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ——————————————————————————— fetch both workflow + logs
  useEffect(() => {
    if (docId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [docId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [wfRes, logRes] = await Promise.all([
        fetch(`/api/document-workflows?where[documentId][equals]=${docId}`),
        fetch(`/api/workflow-logs?where[documentId][equals]=${docId}&sort=-createdAt`),
      ]);

      if (!wfRes.ok || !logRes.ok) throw new Error("Failed to fetch workflow data");

      const wfData = await wfRes.json();
      const logData = await logRes.json();

      setWorkflow(wfData.docs?.[0] || null);
      setLogs(logData.docs || []);
    } catch (err) {
      setError("Failed to load workflow.");
    } finally {
      setLoading(false);
    }
  };

  // ——————————————————————————— approve / reject
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

      if (!response.ok) throw new Error(`Failed to ${action} document`);

      await fetchData(); // refresh workflow + logs
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
      alert(`❌ Failed to ${action} the document.`);
    }
  };

  const handleApprove = () => handleAction("approved");

  const handleReject = () => {
    const reason = window.prompt("Rejection reason:");
    if (reason !== null) handleAction("rejected", reason || "Rejected");
  };

  // ——————————————————————————— UI helpers
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return "#28a745";
      case "rejected":
        return "#dc3545";
      case "pending":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  // ——————————————————————————— render guards
  if (!docId)
    return (
      <p style={{ padding: "1rem", background: "#f0f0f0" }}>
        💾 Save the document to view workflow status.
      </p>
    );

  if (loading) return <p style={{ padding: "1rem" }}>⏳ Loading workflow…</p>;

  if (error)
    return (
      <p style={{ padding: "1rem", color: "red" }}>
        ⚠️ {error}
      </p>
    );

  if (!workflow)
    return (
      <p style={{ padding: "1rem", background: "#fafafa" }}>
        📄 No workflow instance found for this document.
      </p>
    );

  // ——————————————————————————— main render
  return (
    <div
      style={{
        padding: "1rem",
        background: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "6px",
        marginTop: "1rem",
      }}
    >
      <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        📋 Workflow Status
        <span
          style={{
            color: "#fff",
            background: getStatusColor(workflow.status),
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {workflow.status}
        </span>
      </h3>

      <p>
        <strong>Current Step:</strong> {workflow.currentStep}
      </p>

      {workflow.status === "pending" && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <button
            onClick={handleApprove}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ✅ Approve
          </button>
          <button
            onClick={handleReject}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ❌ Reject
          </button>
        </div>
      )}

      {/* ——— Workflow History ——— */}
      <h4 style={{ marginTop: "2rem" }}>📝 Workflow History</h4>
      {logs.length === 0 ? (
        <p style={{ fontStyle: "italic", color: "#666" }}>No history yet.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
          {logs.map((log) => (
            <li
              key={log.id}
              style={{
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                <strong style={{ textTransform: "capitalize" }}>{log.action}</strong>{" "}
                {log.comment && `— ${log.comment}`}
              </span>
              <span style={{ fontSize: "12px", color: "#888888" }}>
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
