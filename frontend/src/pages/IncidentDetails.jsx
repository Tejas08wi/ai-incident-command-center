import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import incidentService from "../services/incidentService";
import aiService from "../services/aiService";
import agentService from "../services/agentService";
import investigationService from "../services/investigationService";

function IncidentDetails() {
  const { id } = useParams();

  const [incident, setIncident] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quick AI Analysis
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  // Full AI Investigation
  const [investigation, setInvestigation] = useState(null);
  const [investigationLoading, setInvestigationLoading] = useState(false);
  const [investigationError, setInvestigationError] = useState("");

  const [threadId, setThreadId] = useState(null);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Investigation History
  const [investigationHistory, setInvestigationHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // Investigation Evidence
  const [selectedEvidenceInvestigationId, setSelectedEvidenceInvestigationId] =
    useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState("");
  const evidenceRef = useRef(null);

  // Investigation Audit Logs
  const [selectedAuditInvestigationId, setSelectedAuditInvestigationId] =
    useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const auditTimelineRef = useRef(null);

  // =========================
  // Load Incident
  // =========================

  useEffect(() => {
    const loadIncident = async () => {
      try {
        setError("");

        const data = await incidentService.getIncidentById(id);

        setIncident(data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load incident.");
      } finally {
        setLoading(false);
      }
    };

    loadIncident();
  }, [id]);

  // =========================
  // Load Investigation History
  // =========================

  const loadInvestigationHistory = async () => {
    try {
      setHistoryError("");
      setHistoryLoading(true);

      const data = await investigationService.getInvestigationsByIncident(id);

      setInvestigationHistory(data);

      // Clear selected investigation details if they no longer exist
      if (
        selectedEvidenceInvestigationId &&
        !data.some(
          (item) => item.id === selectedEvidenceInvestigationId
        )
      ) {
        setSelectedEvidenceInvestigationId(null);
        setEvidence([]);
      }

      if (
        selectedAuditInvestigationId &&
        !data.some(
          (item) => item.id === selectedAuditInvestigationId
        )
      ) {
        setSelectedAuditInvestigationId(null);
        setAuditLogs([]);
      }
    } catch (error) {
      setHistoryError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to load investigation history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadInvestigationHistory();
  }, [id]);

  // =========================
  // Quick AI Analysis
  // =========================

  const handleQuickAnalysis = async () => {
    try {
      setAnalysisError("");
      setAnalysisLoading(true);

      const data = await aiService.analyzeIncident(id);

      setAnalysis(data);
    } catch (error) {
      setAnalysisError(
        error.response?.data?.message || "Failed to generate AI analysis.",
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  // =========================
  // Start Full Investigation
  // =========================

  const handleStartInvestigation = async () => {
    try {
      setInvestigationError("");
      setInvestigationLoading(true);

      setInvestigation(null);
      setApprovalRequired(false);

      const newThreadId = `incident-${id}-${Date.now()}`;

      setThreadId(newThreadId);

      const data = await agentService.startInvestigation(
        `Investigate incident ${id}`,
        newThreadId,
      );

      setInvestigation(data);

      if (data.status === "approval_required") {
        setApprovalRequired(true);
      }

      await loadInvestigationHistory();
    } catch (error) {
      setInvestigationError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to start AI investigation.",
      );
    } finally {
      setInvestigationLoading(false);
    }
  };

  // =========================
  // Human Approval
  // =========================

  const handleApproval = async (approval) => {
    if (!threadId) {
      return;
    }

    try {
      setInvestigationError("");
      setApprovalLoading(true);

      if (approval === "approve") {
        setInvestigation({
          status: "investigating",
          message:
            "Investigation approved. The AI agent is collecting evidence and analyzing the incident...",
        });
      }

      const data = await agentService.resumeInvestigation(threadId, approval);

      setInvestigation(data);
      setApprovalRequired(false);

      // Refresh persisted investigation history
      await loadInvestigationHistory();
    } catch (error) {
      setInvestigationError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to resume AI investigation.",
      );
    } finally {
      setApprovalLoading(false);
    }
  };

  // =========================
  // Load Evidence
  // =========================

  const handleViewEvidence = async (investigationId) => {
    try {
      setEvidenceError("");
      setEvidenceLoading(true);

      // Show Evidence and hide Audit Timeline
      setSelectedEvidenceInvestigationId(investigationId);
      setSelectedAuditInvestigationId(null);
      setAuditLogs([]);

      const data =
        await investigationService.getInvestigationEvidence(investigationId);

      setEvidence(data);

      setTimeout(() => {
        evidenceRef.current?.scrollIntoView({
          behavior: "smooth",
            block: "nearest",
        });
      }, 100);
    } catch (error) {
      setEvidence([]);
      setEvidenceError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to load investigation evidence.",
      );
    } finally {
      setEvidenceLoading(false);
    }
  };
  // =========================
  // Load Audit Logs
  // =========================

  const handleViewAuditLogs = async (investigationId) => {
    try {
      setAuditError("");
      setAuditLoading(true);

      // Show Audit Timeline and hide Evidence
      setSelectedAuditInvestigationId(investigationId);
      setSelectedEvidenceInvestigationId(null);
      setEvidence([]);

      const data = await investigationService.getAuditLogs(investigationId);

      setAuditLogs(data);

      setTimeout(() => {
        auditTimelineRef.current?.scrollIntoView({
          behavior: "smooth",
            block: "nearest",
        });
      }, 100);
    } catch (error) {
      setAuditLogs([]);

      setAuditError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to load investigation audit logs.",
      );
    } finally {
      setAuditLoading(false);
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="rounded-xl border border-[#1D232D] bg-[#10141B] p-6 flex items-center gap-3">
        <span className="h-4 w-4 rounded-full border-2 border-[#F5A623]/30 border-t-[#F5A623] animate-spin" />
        <p className="text-[#8A92A6] font-mono text-sm">Loading incident…</p>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (error) {
    return (
      <div>
        <Link
          to="/incidents"
          className="text-sm text-[#F5A623] hover:text-[#FFB84D]"
        >
          ← Back to incidents
        </Link>

        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-6">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return null;
  }

  // =========================
  // Investigation UI Helpers
  // =========================

  const investigationStatus = investigation?.status?.toLowerCase();

  const isInvestigating =
    investigationLoading ||
    approvalLoading ||
    investigationStatus === "investigating";

  const isCompleted = investigationStatus === "success";

  const isRejected = investigationStatus === "rejected";

  const severityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return "#EF4444";
      case "HIGH":
        return "#F5A623";
      case "MEDIUM":
        return "#EAB308";
      default:
        return "#8A92A6";
    }
  };

  const statusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return "#F5A623";
      case "RESOLVED":
      case "CLOSED":
        return "#4ADE80";
      case "IN_PROGRESS":
        return "#60A5FA";
      default:
        return "#8A92A6";
    }
  };

  return (
    <div>
      {/* =========================
          Back Navigation
      ========================= */}

      <div className="mb-6">
        <Link
          to="/incidents"
          className="text-sm text-[#F5A623] hover:text-[#FFB84D]"
        >
          ← Back to incidents
        </Link>
      </div>

      {/* =========================
          Incident Header
      ========================= */}

      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-mono text-sm text-[#525A69]">Incident #{incident.id}</p>

            <h1 className="mt-1 text-3xl font-semibold text-[#EDEFF3]">
              {incident.title}
            </h1>
          </div>

          <div className="flex gap-2">
            <span
              className="flex items-center gap-1.5 rounded-full bg-[#1D232D] px-3 py-1 font-mono text-xs"
              style={{ color: statusColor(incident.status) }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: statusColor(incident.status) }}
              />
              {incident.status}
            </span>

            <span
              className="rounded-full bg-[#1D232D] px-3 py-1 font-mono text-xs"
              style={{ color: severityColor(incident.severity) }}
            >
              {incident.severity}
            </span>
          </div>
        </div>
      </div>

      {/* =========================
          Incident Information
      ========================= */}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#1D232D] bg-[#10141B] p-6">
            <h2 className="text-lg font-semibold text-[#EDEFF3]">Description</h2>

            <p className="mt-4 whitespace-pre-wrap leading-7 text-[#C4C9D4]">
              {incident.description}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#1D232D] bg-[#10141B] p-6">
          <h2 className="text-lg font-semibold text-[#EDEFF3]">
            Incident Information
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-[#525A69]">
                Service
              </p>

              <p className="mt-1 text-sm text-[#C4C9D4]">
                {incident.serviceName}
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-[#525A69]">
                Severity
              </p>

              <p
                className="mt-1 flex items-center gap-1.5 text-sm"
                style={{ color: severityColor(incident.severity) }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: severityColor(incident.severity) }}
                />
                {incident.severity}
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-[#525A69]">
                Status
              </p>

              <p
                className="mt-1 flex items-center gap-1.5 text-sm"
                style={{ color: statusColor(incident.status) }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: statusColor(incident.status) }}
                />
                {incident.status}
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-[#525A69]">
                Created
              </p>

              <p className="mt-1 text-sm text-[#C4C9D4]">
                {incident.createdAt
                  ? new Date(incident.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          Quick AI Analysis
      ========================= */}

      <div className="mt-8 rounded-xl border border-[#1D232D] bg-[#10141B] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#EDEFF3]">AI Analysis</h2>

            <p className="mt-1 text-sm text-[#8A92A6]">
              Generate a quick analysis using the incident information.
            </p>
          </div>

          <button
            onClick={handleQuickAnalysis}
            disabled={analysisLoading}
            className="rounded-lg bg-[#F5A623] px-5 py-3 text-sm font-medium text-[#0A0D12] transition hover:bg-[#FFB84D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analysisLoading ? "Analyzing…" : "Quick AI Analysis"}
          </button>
        </div>

        {analysisError && (
          <div className="mt-5 rounded-lg border border-red-900 bg-red-950/40 p-4">
            <p className="text-sm text-red-300">{analysisError}</p>
          </div>
        )}

        {analysis && (
          <div className="mt-6 space-y-6 border-t border-[#1D232D] pt-6">
            <div>
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wide text-[#525A69]">
                Analysis
              </h3>

              <p className="mt-2 leading-7 text-[#C4C9D4]">
                {analysis.analysis}
              </p>
            </div>

            <div>
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wide text-[#525A69]">
                Possible Causes
              </h3>

              <ul className="mt-3 space-y-2">
                {analysis.possibleCauses?.map((cause, index) => (
                  <li
                    key={index}
                    className="rounded-lg bg-[#0A0D12] px-4 py-3 text-sm text-[#C4C9D4]"
                  >
                    {cause}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wide text-[#525A69]">
                Immediate Actions
              </h3>

              <ul className="mt-3 space-y-2">
                {analysis.immediateActions?.map((action, index) => (
                  <li
                    key={index}
                    className="rounded-lg bg-[#0A0D12] px-4 py-3 text-sm text-[#C4C9D4]"
                  >
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          Full AI Investigation
      ========================= */}

      <div className="mt-6 rounded-xl border border-[#1D232D] bg-[#10141B] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#EDEFF3]">
              AI Investigation
            </h2>

            <p className="mt-1 text-sm text-[#8A92A6]">
              Full agentic investigation using LangGraph, MCP, evidence
              collection, and human approval.
            </p>
          </div>

          <button
            onClick={handleStartInvestigation}
            disabled={
              investigationLoading ||
              approvalLoading ||
              approvalRequired ||
              isInvestigating
            }
            className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {investigationLoading
              ? "Starting Investigation…"
              : approvalRequired
                ? "Approval Required"
                : isInvestigating
                  ? "Investigating…"
                  : isCompleted
                    ? "Start New Investigation"
                    : isRejected
                      ? "Start New Investigation"
                      : "Start AI Investigation"}
          </button>
        </div>

        {/* Error */}

        {investigationError && (
          <div className="mt-5 rounded-lg border border-red-900 bg-red-950/40 p-4">
            <p className="text-sm text-red-300">{investigationError}</p>
          </div>
        )}

        {/* Approval Required */}

        {approvalRequired && (
          <div className="mt-6 rounded-xl border border-yellow-800 bg-yellow-950/30 p-5">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-yellow-400">
              Human Approval Required
            </p>

            <p className="mt-2 text-sm leading-6 text-[#C4C9D4]">
              The AI agent has analyzed the incident and is requesting approval
              before continuing with the investigation and evidence collection.
            </p>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleApproval("approve")}
                disabled={approvalLoading}
                className="rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {approvalLoading ? "Processing…" : "Approve Investigation"}
              </button>

              <button
                onClick={() => handleApproval("reject")}
                disabled={approvalLoading}
                className="rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Investigation Result */}

        {investigation && (
          <div className="mt-6 space-y-5 border-t border-[#1D232D] pt-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-sm font-semibold uppercase tracking-wide text-[#525A69]">
                  Investigation Status
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium font-mono ${
                    isCompleted
                      ? "bg-green-950 text-green-300"
                      : isRejected
                        ? "bg-red-950 text-red-300"
                        : approvalRequired
                          ? "bg-yellow-950 text-yellow-300"
                          : isInvestigating
                            ? "bg-violet-950 text-violet-300"
                            : "bg-[#1D232D] text-[#8A92A6]"
                  }`}
                >
                  {investigation.status}
                </span>
              </div>
            </div>

            {/* Investigation progress */}

            {isInvestigating && !approvalRequired && (
              <div className="rounded-lg border border-violet-900 bg-violet-950/30 p-4">
                <p className="text-sm text-violet-300">
                  The AI agent is collecting evidence, evaluating the incident,
                  and preparing the investigation result.
                </p>
              </div>
            )}

            {/* Rejected */}

            {isRejected && (
              <div className="rounded-lg border border-red-900 bg-red-950/30 p-4">
                <p className="text-sm text-red-300">
                  The investigation was rejected by the human operator. No
                  further investigation tools were executed.
                </p>
              </div>
            )}

            {/* Successful investigation */}

            {isCompleted && (
              <div className="rounded-lg border border-green-900 bg-green-950/30 p-4">
                <p className="text-sm text-green-300">
                  Investigation completed successfully.
                </p>
              </div>
            )}

            {/* Agent response */}

            {investigation.message && (
              <div>
                <h3 className="font-mono text-sm font-semibold uppercase tracking-wide text-[#525A69]">
                  Agent Response
                </h3>

                <div className="mt-3 rounded-lg bg-[#0A0D12] p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[#C4C9D4]">
                    {investigation.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================
          Investigation History
      ========================= */}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#1D232D] bg-[#10141B] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#EDEFF3]">
              Investigation History
            </h2>

            <p className="mt-1 text-sm text-[#8A92A6]">
              Previous AI investigations performed for this incident.
            </p>
          </div>

          <button
            onClick={loadInvestigationHistory}
            disabled={historyLoading}
            className="rounded-lg border border-[#1D232D] px-4 py-2.5 text-sm text-[#C4C9D4] transition hover:bg-[#161B24] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {historyLoading ? "Refreshing…" : "Refresh History"}
          </button>
        </div>

        {historyError && (
          <div className="mt-5 rounded-lg border border-red-900 bg-red-950/40 p-4">
            <p className="text-sm text-red-300">{historyError}</p>
          </div>
        )}

        {historyLoading && investigationHistory.length === 0 && (
          <div className="mt-6">
            <p className="text-sm text-[#8A92A6]">
              Loading investigation history…
            </p>
          </div>
        )}

        {!historyLoading &&
          investigationHistory.length === 0 &&
          !historyError && (
            <div className="mt-6 rounded-lg bg-[#0A0D12] p-5">
              <p className="text-sm text-[#8A92A6]">
                No previous investigations found for this incident.
              </p>
            </div>
          )}

        {investigationHistory.length > 0 && (
          <div className="mt-6 max-h-[34rem] space-y-3 overflow-y-auto pr-2">
            {investigationHistory.map((item, index) => {
              const isEvidenceSelected =
                selectedEvidenceInvestigationId === item.id;

              const isAuditSelected =
                selectedAuditInvestigationId === item.id;

              const isSelected =
                isEvidenceSelected || isAuditSelected;

              const status = item.status?.toUpperCase();

              return (
                <div
                  key={item.id}
                  className={`relative border-l-2 p-4 pl-5 transition first:pt-2 last:pb-2 ${
                    isSelected
                      ? "border-violet-500 bg-violet-950/20"
                      : "border-[#1D232D] hover:border-[#525A69]"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                          status === "COMPLETED"
                            ? "bg-green-950 text-green-300"
                            : status === "REJECTED"
                              ? "bg-red-950 text-red-300"
                              : "bg-[#1D232D] text-[#8A92A6]"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#EDEFF3]">
                          Investigation #{item.id}
                        </p>

                        <p className="mt-0.5 font-mono text-xs text-[#525A69]">
                          Run {index + 1}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-medium font-mono ${
                        status === "COMPLETED"
                          ? "bg-green-950 text-green-300"
                          : status === "REJECTED"
                            ? "bg-red-950 text-red-300"
                            : "bg-[#1D232D] text-[#8A92A6]"
                      }`}
                    >
                      {status || "UNKNOWN"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <p className="text-[#525A69]">
                        Started <span className="text-[#C4C9D4]">{item.startedAt
                          ? new Date(item.startedAt).toLocaleString()
                          : "—"}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-[#525A69]">
                        Completed <span className="text-[#C4C9D4]">{item.completedAt
                          ? new Date(item.completedAt).toLocaleString()
                          : "—"}</span>
                      </p>
                    </div>
                  </div>

                  {item.finalAnalysis && (
                    <div className="mt-3 border-l border-[#1D232D] pl-3">
                      <p
                        className={`text-xs leading-5 text-[#8A92A6] ${
                          expandedHistoryId === item.id
                            ? "whitespace-pre-wrap"
                            : "line-clamp-2"
                        }`}
                      >
                        {item.finalAnalysis}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedHistoryId(
                            expandedHistoryId === item.id ? null : item.id,
                          )
                        }
                        className="mt-1 text-xs font-medium text-violet-300 transition hover:text-violet-200"
                      >
                        {expandedHistoryId === item.id
                          ? "Hide full response"
                          : "View full response"}
                      </button>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[#1D232D] pt-3">
                    <button
                      onClick={() => handleViewEvidence(item.id)}
                      disabled={
                        evidenceLoading &&
                        selectedEvidenceInvestigationId === item.id
                      }
                      className="rounded-lg border border-[#1D232D] px-3 py-2 text-xs font-medium text-[#C4C9D4] transition hover:bg-[#161B24] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {evidenceLoading &&
                      selectedEvidenceInvestigationId === item.id
                        ? "Loading Evidence…"
                        : isEvidenceSelected
                          ? "Refresh Evidence"
                          : "View Evidence"}
                    </button>

                    <button
                      onClick={() => handleViewAuditLogs(item.id)}
                      disabled={
                        auditLoading &&
                        selectedAuditInvestigationId === item.id
                      }
                      className="rounded-lg border border-[#1D232D] px-3 py-2 text-xs font-medium text-[#C4C9D4] transition hover:bg-[#161B24] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {auditLoading &&
                      selectedAuditInvestigationId === item.id
                        ? "Loading Timeline…"
                        : isAuditSelected
                          ? "Refresh Timeline"
                          : "View Audit Timeline"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================
          Investigation Evidence
      ========================= */}

      {selectedEvidenceInvestigationId && (
        <div
          ref={evidenceRef}
          className="rounded-xl border border-[#1D232D] bg-[#10141B] p-6 lg:sticky lg:top-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-[#EDEFF3]">
              Investigation Evidence
            </h2>

            <p className="mt-1 text-sm text-[#8A92A6]">
              Evidence collected during investigation #
              {selectedEvidenceInvestigationId}.
            </p>
          </div>

          {evidenceError && (
            <div className="mt-5 rounded-lg border border-red-900 bg-red-950/40 p-4">
              <p className="text-sm text-red-300">{evidenceError}</p>
            </div>
          )}

          {evidenceLoading && (
            <div className="mt-6">
              <p className="text-sm text-[#8A92A6]">Loading evidence…</p>
            </div>
          )}

          {!evidenceLoading && evidence.length === 0 && !evidenceError && (
            <div className="mt-6 rounded-lg bg-[#0A0D12] p-5">
              <p className="text-sm text-[#8A92A6]">
                No evidence was collected during this investigation.
              </p>
            </div>
          )}

          {evidence.length > 0 && (
            <div className="mt-6 space-y-5">
              {evidence.map((item, index) => (
                <div
                  key={item.id || index}
                  className="rounded-xl border border-[#1D232D] bg-[#0A0D12] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-wide text-[#525A69]">
                        Evidence #{index + 1}
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-[#EDEFF3]">
                        {item.toolName}
                      </h3>
                    </div>

                    <p className="text-xs text-[#525A69]">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="font-mono text-xs uppercase tracking-wide text-[#525A69]">
                      Arguments
                    </p>

                    <pre className="mt-2 overflow-x-auto rounded-lg bg-[#10141B] p-4 text-xs leading-6 text-[#C4C9D4]">
                      {item.arguments || "—"}
                    </pre>
                  </div>

                  <div className="mt-5">
                    <p className="font-mono text-xs uppercase tracking-wide text-[#525A69]">
                      Result
                    </p>

                    <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-[#10141B] p-4 text-xs leading-6 text-[#C4C9D4]">
                      {item.result || "—"}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* =========================
    Investigation Audit Timeline
========================= */}

      {selectedAuditInvestigationId && (
        <div
          ref={auditTimelineRef}
          className="rounded-xl border border-[#1D232D] bg-[#10141B] p-6 lg:sticky lg:top-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-[#EDEFF3]">
              Investigation Audit Timeline
            </h2>

            <p className="mt-1 text-sm text-[#8A92A6]">
              Audit events recorded during investigation #
              {selectedAuditInvestigationId}.
            </p>
          </div>

          {auditError && (
            <div className="mt-5 rounded-lg border border-red-900 bg-red-950/40 p-4">
              <p className="text-sm text-red-300">{auditError}</p>
            </div>
          )}

          {auditLoading && (
            <div className="mt-6">
              <p className="text-sm text-[#8A92A6]">Loading audit timeline…</p>
            </div>
          )}

          {!auditLoading && auditLogs.length === 0 && !auditError && (
            <div className="mt-6 rounded-lg bg-[#0A0D12] p-5">
              <p className="text-sm text-[#8A92A6]">
                No audit events found for this investigation.
              </p>
            </div>
          )}

          {auditLogs.length > 0 && (
            <div className="mt-6">
              <div className="relative ml-3 border-l border-[#1D232D]">
                {auditLogs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="relative pb-8 pl-8 last:pb-0"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute -left-2 top-1 h-4 w-4 rounded-full border-2 border-[#10141B] bg-violet-500" />

                    <div className="rounded-xl border border-[#1D232D] bg-[#0A0D12] p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-wide text-[#525A69]">
                            Event
                          </p>

                          <h3 className="mt-1 text-sm font-semibold text-[#EDEFF3]">
                            {log.eventType}
                          </h3>
                        </div>

                        <p className="text-xs text-[#525A69]">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="font-mono text-xs uppercase tracking-wide text-[#525A69]">
                          Message
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#C4C9D4]">
                          {log.message || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default IncidentDetails;