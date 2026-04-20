import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Island } from "@/components/ui/Island";
import { apiClient } from "@/lib/api-client";
import {
  ArrowLeft,
  Clock,
  MemoryStick,
  Loader2,
  CheckCircle,
  XCircle,
  Hourglass,
  Lock,
  ExternalLink,
  MessageSquare,
  Award,
} from "lucide-react";
import { SubmissionStatusBadge } from "../components/SubmissionStatusBadge";
import type { SubmissionStatus } from "@/types";

interface BackendSubmission {
  id: number;
  problem_id: number;
  problem_slug: string;
  problem_title: string;
  problem_type?: "standard" | "subjective";
  contest_id?: number | null;
  contest_title?: string;
  status: SubmissionStatus;
  language: string;
  runtime_ms?: number | null;
  memory_kb?: number | null;
  passed_count: number;
  total_count: number;
  submitted_at: string;
  manual_score?: number | null;
  feedback?: string;
  is_locked?: boolean;
  graded_at?: string | null;
  grader_name?: string;
}

interface TestCaseResult {
  test_case_id: number;
  status: string;
  stdout: string;
  stderr: string;
  time_taken_ms: number;
  memory_used_kb: number;
  checker_output: string;
  is_sample: boolean;
}

interface BackendResult {
  status: string;
  compile_time_ms?: number;
  compile_error?: string;
  test_case_results?: TestCaseResult[];
  passed_count?: number;
  total_count?: number;
  max_time_ms?: number;
  max_memory_kb?: number;
}

interface GetSubmissionResponse {
  submission: BackendSubmission;
  source_code: string;
  result?: BackendResult;
}

function formatDate(s: string | null | undefined): string {
  if (!s) return "—";
  return new Date(s).toLocaleString();
}

export function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => apiClient.get<GetSubmissionResponse>(`/submissions/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-20 text-center text-sm text-text-muted">
        Submission not found or access denied.
      </div>
    );
  }

  const { submission: s, source_code, result } = data;
  const isSubjective = s.problem_type === "subjective";
  const scoreDisplay =
    s.manual_score != null
      ? `${s.manual_score} pts`
      : s.total_count > 0
      ? `${s.passed_count}/${s.total_count}`
      : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-2 flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-text">Submission #{s.id}</h1>
            <SubmissionStatusBadge status={s.status} />
            {isSubjective && (
              <span className="rounded-full border border-accent/30 bg-accent-subtle px-2 py-0.5 text-[10px] font-medium text-accent">
                Subjective
              </span>
            )}
            {s.is_locked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-secondary px-2 py-0.5 text-[10px] font-medium text-text-muted">
                <Lock size={10} /> Graded & locked
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Submitted {formatDate(s.submitted_at)} · {s.language.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: code */}
        <div className="col-span-12 lg:col-span-8">
          <Island className="p-0 overflow-hidden" noHover>
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h3 className="text-sm font-semibold text-text">Source code</h3>
              <span className="text-[11px] text-text-muted">{s.language}</span>
            </div>
            <Editor
              height="520px"
              language={s.language === "cpp" ? "cpp" : s.language}
              value={source_code}
              theme="vs-dark"
              options={{
                readOnly: true,
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: "on",
              }}
            />
          </Island>

          {!isSubjective && result && result.test_case_results && result.test_case_results.length > 0 && (
            <Island className="mt-4" noHover>
              <h3 className="mb-3 text-sm font-semibold text-text">Test cases</h3>
              <div className="space-y-2">
                {result.test_case_results.map((tc, i) => {
                  const ok = tc.status === "accepted";
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border p-3 text-xs ${
                        ok
                          ? "border-green-400/30 bg-green-400/5"
                          : "border-red-400/30 bg-red-400/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {ok ? (
                            <CheckCircle size={13} className="text-green-400" />
                          ) : (
                            <XCircle size={13} className="text-red-400" />
                          )}
                          <span className="font-semibold text-text">
                            Test #{i + 1} {tc.is_sample ? "(sample)" : "(hidden)"}
                          </span>
                          <span className="capitalize text-text-muted">
                            {tc.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-text-muted">
                          {tc.time_taken_ms > 0 && (
                            <span>
                              <Clock size={10} className="mr-0.5 inline" /> {tc.time_taken_ms}ms
                            </span>
                          )}
                          {tc.memory_used_kb > 0 && (
                            <span>
                              <MemoryStick size={10} className="mr-0.5 inline" />
                              {tc.memory_used_kb > 1024
                                ? `${(tc.memory_used_kb / 1024).toFixed(1)}MB`
                                : `${tc.memory_used_kb}KB`}
                            </span>
                          )}
                        </div>
                      </div>
                      {tc.stderr && (
                        <pre className="mt-2 whitespace-pre-wrap rounded bg-bg p-2 font-mono text-[11px] text-red-400">
                          {tc.stderr}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>
            </Island>
          )}

          {!isSubjective && result?.compile_error && (
            <Island className="mt-4" noHover>
              <h3 className="mb-2 text-sm font-semibold text-text">Compile error</h3>
              <pre className="whitespace-pre-wrap rounded-lg bg-bg p-3 font-mono text-xs text-red-400">
                {result.compile_error}
              </pre>
            </Island>
          )}
        </div>

        {/* Right: sidebar */}
        <div className="col-span-12 space-y-4 lg:col-span-4">
          <Island noHover>
            <h3 className="mb-3 text-sm font-semibold text-text">Problem</h3>
            <Link
              to={`/questions/${s.problem_slug}`}
              className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              {s.problem_title} <ExternalLink size={12} />
            </Link>
            <p className="mt-1 text-xs text-text-muted">{s.problem_slug}</p>
            {s.contest_id && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-[11px] uppercase tracking-wide text-text-muted">Contest</p>
                <Link
                  to={`/contests/${s.contest_id}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  {s.contest_title || `Contest #${s.contest_id}`}
                </Link>
              </div>
            )}
          </Island>

          <Island noHover>
            <h3 className="mb-3 text-sm font-semibold text-text">Result</h3>
            <dl className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-text-muted">Status</dt>
                <dd>
                  <SubmissionStatusBadge status={s.status} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-muted">Score</dt>
                <dd className="font-mono text-text">{scoreDisplay}</dd>
              </div>
              {s.runtime_ms != null && (
                <div className="flex items-center justify-between">
                  <dt className="text-text-muted">Max runtime</dt>
                  <dd className="font-mono text-text">{s.runtime_ms}ms</dd>
                </div>
              )}
              {s.memory_kb != null && (
                <div className="flex items-center justify-between">
                  <dt className="text-text-muted">Max memory</dt>
                  <dd className="font-mono text-text">
                    {s.memory_kb > 1024
                      ? `${(s.memory_kb / 1024).toFixed(1)}MB`
                      : `${s.memory_kb}KB`}
                  </dd>
                </div>
              )}
            </dl>
          </Island>

          {(s.manual_score != null || s.feedback || s.graded_at) && (
            <Island noHover>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
                <Award size={14} className="text-accent" /> Instructor grading
              </h3>
              {s.manual_score != null && (
                <div className="mb-3 rounded-lg border border-accent/30 bg-accent-subtle p-3">
                  <p className="text-[11px] uppercase tracking-wide text-accent">Manual score</p>
                  <p className="text-2xl font-bold text-text">{s.manual_score}</p>
                </div>
              )}
              {s.feedback ? (
                <div>
                  <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-text-muted">
                    <MessageSquare size={11} /> Feedback
                  </p>
                  <p className="whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 text-xs text-text">
                    {s.feedback}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-text-muted">No written feedback.</p>
              )}
              <div className="mt-3 flex items-center justify-between text-[11px] text-text-muted">
                <span>{s.grader_name ? `Graded by ${s.grader_name}` : "Graded"}</span>
                <span>{formatDate(s.graded_at)}</span>
              </div>
            </Island>
          )}

          {isSubjective && !s.graded_at && (
            <Island noHover>
              <div className="flex items-center gap-2 text-sm text-accent">
                <Hourglass size={14} /> Awaiting manual review
              </div>
              <p className="mt-2 text-xs text-text-muted">
                An instructor will review this submission and publish feedback here.
              </p>
            </Island>
          )}
        </div>
      </div>
    </div>
  );
}
