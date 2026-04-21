import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiClient } from "@/lib/api-client";
import {
  ArrowLeft,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Timer,
  MemoryStick,
  Clock,
  Loader2,
  ChevronDown,
  Hourglass,
} from "lucide-react";

/* ─── Types ─── */
interface SampleTestCase {
  id: number;
  input: string;
  expected_output: string;
}

interface QuestionDetail {
  id: number;
  title: string;
  slug: string;
  statement: string;
  difficulty: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  created_at: string;
  sample_test_cases: SampleTestCase[];
  problem_type?: "standard" | "subjective";
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

interface JudgeResult {
  status: string;
  compile_time_ms: number;
  compile_error: string;
  test_case_results: TestCaseResult[];
  passed_count: number;
  total_count: number;
  max_time_ms: number;
  max_memory_kb: number;
}

const STATUS_ICONS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  accepted:              { label: "Accepted",              color: "text-green-400",  icon: CheckCircle2 },
  wrong_answer:          { label: "Wrong Answer",          color: "text-red-400",    icon: XCircle },
  compilation_error:     { label: "Compilation Error",     color: "text-red-400",    icon: XCircle },
  runtime_error:         { label: "Runtime Error",         color: "text-orange-400", icon: AlertTriangle },
  time_limit_exceeded:   { label: "Time Limit Exceeded",   color: "text-yellow-400", icon: Timer },
  memory_limit_exceeded: { label: "Memory Limit Exceeded", color: "text-yellow-400", icon: MemoryStick },
  error:                 { label: "Error",                 color: "text-red-400",    icon: XCircle },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400 bg-green-400/10 border-green-400/30",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  hard: "text-red-400 bg-red-400/10 border-red-400/30",
};

const CPP_TEMPLATE = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your solution here

    return 0;
}`;

/* ─── Page Component ─── */
export function QuestionDetailPage() {
  const { slug, contestId } = useParams<{ slug: string; contestId?: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<any>(null);
  const isContestMode = Boolean(contestId);
  const backPath = isContestMode ? `/contests/${contestId}` : "/questions";

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(CPP_TEMPLATE);
  const [fontSize, setFontSize] = useState(14);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [selectedTC, setSelectedTC] = useState(0);
  const [resultTab, setResultTab] = useState<"results" | "compile">("results");
  const [pendingReview, setPendingReview] = useState(false);

  // Fetch question
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setJudgeResult(null);
    setPendingReview(false);
    setSelectedTC(0);
    const detailPath = isContestMode
      ? `/contests/${contestId}/problems/${slug}`
      : `/questions/${slug}`;
    apiClient
      .get<QuestionDetail>(detailPath)
      .then((q) => setQuestion(q))
      .catch(() => navigate(backPath))
      .finally(() => setLoading(false));
  }, [backPath, contestId, isContestMode, slug, navigate]);

  // Run sample tests
  const handleRun = async () => {
    if (!slug) return;
    setIsRunning(true);
    setJudgeResult(null);
    setResultTab("results");
    const runPath = isContestMode
      ? `/contests/${contestId}/problems/${slug}/run`
      : `/questions/${slug}/run`;
    try {
      const res = await apiClient.post<JudgeResult>(runPath, {
        code,
        language: "cpp",
      });
      setJudgeResult(res);
      setSelectedTC(0);
      if (res.status === "compilation_error") setResultTab("compile");
    } catch (err: any) {
      setJudgeResult({
        status: "error",
        compile_time_ms: 0,
        compile_error: err.message,
        test_case_results: [],
        passed_count: 0,
        total_count: 0,
        max_time_ms: 0,
        max_memory_kb: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code
  const handleSubmit = async () => {
    if (!slug || !question) return;
    setIsSubmitting(true);
    setJudgeResult(null);
    setPendingReview(false);
    setResultTab("results");
    const submitPath = isContestMode ? `/contests/${contestId}/submit` : "/submissions";
    const payload = isContestMode
      ? { problem_id: question.id, code, language: "cpp" }
      : { problem_slug: slug, code, language: "cpp" };
    try {
      const res = await apiClient.post<{
        result?: JudgeResult;
        submission: { status: string };
      }>(submitPath, payload);
      if (res.result) {
        setJudgeResult(res.result);
        setSelectedTC(0);
        if (res.result.status === "compilation_error") setResultTab("compile");
      } else if (res.submission?.status === "pending_review") {
        setPendingReview(true);
      }
    } catch (err: any) {
      setJudgeResult({
        status: "error",
        compile_time_ms: 0,
        compile_error: err.message,
        test_case_results: [],
        passed_count: 0,
        total_count: 0,
        max_time_ms: 0,
        max_memory_kb: 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !question) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const busy = isRunning || isSubmitting;
  const statusCfg = judgeResult ? STATUS_ICONS[judgeResult.status] || STATUS_ICONS.error : null;
  const StatusIcon = statusCfg?.icon;
  const selectedResult = judgeResult?.test_case_results?.[selectedTC];
  const diffClass = DIFFICULTY_COLORS[question.difficulty] || DIFFICULTY_COLORS.medium;
  const isSubjective = question.problem_type === "subjective";

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-2 overflow-hidden">
      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-bg-secondary px-4 py-2 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(backPath)} className="text-text-muted hover:text-text transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-sm font-semibold text-text">{question.title}</h1>
          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${diffClass}`}>
            {question.difficulty}
          </span>
          {isSubjective && (
            <span className="rounded-md border border-accent/30 bg-accent-subtle px-2 py-0.5 text-[11px] font-semibold text-accent">
              Manual review
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isSubjective && (
            <>
              <span className="text-[11px] text-text-muted">
                <Clock size={11} className="mr-1 inline" />
                {question.time_limit_ms}ms
              </span>
              <span className="text-[11px] text-text-muted">
                <MemoryStick size={11} className="mr-1 inline" />
                {question.memory_limit_mb}MB
              </span>
            </>
          )}
          <div className="relative ml-2">
            <select value="cpp" disabled className="appearance-none rounded-lg border border-border bg-bg py-1 pl-2 pr-7 text-xs text-text opacity-80">
              <option value="cpp">C++17</option>
            </select>
            <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
          <div className="relative">
            <select value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
              className="appearance-none rounded-lg border border-border bg-bg py-1 pl-2 pr-7 text-xs text-text">
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
            </select>
            <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
          {!isSubjective && (
            <Button variant="secondary" size="sm" onClick={handleRun} disabled={busy} className="flex items-center gap-1.5 text-xs">
              {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              Run
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={busy} className="flex items-center gap-1.5 text-xs">
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {isSubjective ? "Submit for review" : "Submit"}
          </Button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 gap-2 overflow-hidden">
        {/* Left: Question Description */}
        <div className="w-[40%] overflow-y-auto rounded-xl border border-border bg-bg-secondary p-5">
          {/* Markdown */}
          <div className="markdown-body mb-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="mb-4 text-xl font-bold text-text">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-3 mt-5 text-lg font-bold text-text">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold text-text">{children}</h3>,
                p: ({ children }) => <p className="mb-3 leading-relaxed text-text-muted">{children}</p>,
                ul: ({ children }) => <ul className="mb-3 list-disc pl-5 text-text-muted">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 list-decimal pl-5 text-text-muted">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  if (isBlock) {
                    return (
                      <pre className="mb-3 overflow-x-auto rounded-lg bg-bg p-4">
                        <code className="text-sm text-text">{children}</code>
                      </pre>
                    );
                  }
                  return <code className="rounded bg-bg px-1.5 py-0.5 text-sm text-accent">{children}</code>;
                },
                pre: ({ children }) => <>{children}</>,
                table: ({ children }) => <table className="mb-3 w-full border-collapse text-sm">{children}</table>,
                th: ({ children }) => <th className="border border-border bg-bg px-3 py-1.5 text-left text-text-muted">{children}</th>,
                td: ({ children }) => <td className="border border-border px-3 py-1.5 text-text">{children}</td>,
              }}
            >
              {question.statement}
            </ReactMarkdown>
          </div>

          {/* Sample Test Cases */}
          {question.sample_test_cases.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text">Sample Test Cases</h3>
              {question.sample_test_cases.map((tc, i) => (
                <div key={tc.id} className="rounded-lg border border-border bg-bg overflow-hidden">
                  <div className="border-b border-border bg-bg px-3 py-1.5 text-xs font-semibold text-text-muted">
                    Sample {i + 1}
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <div className="p-3">
                      <div className="mb-1 text-[10px] font-semibold uppercase text-text-muted">Input</div>
                      <pre className="whitespace-pre-wrap font-mono text-xs text-text">{tc.input}</pre>
                    </div>
                    <div className="p-3">
                      <div className="mb-1 text-[10px] font-semibold uppercase text-text-muted">Expected Output</div>
                      <pre className="whitespace-pre-wrap font-mono text-xs text-text">{tc.expected_output}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Editor + Results */}
        <div className="flex w-[60%] flex-col gap-2 overflow-hidden">
          {/* Editor */}
          <div className="flex-[6] overflow-hidden rounded-xl border border-border">
            <Editor
              height="100%"
              language="cpp"
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              onMount={(editor) => { editorRef.current = editor; }}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: "on",
                renderLineHighlight: "all",
                smoothScrolling: true,
                cursorBlinking: "smooth",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            />
          </div>

          {/* Results */}
          <div className="flex-[4] overflow-hidden rounded-xl border border-border bg-bg-secondary flex flex-col">
            {/* Result Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <div className="flex items-center gap-2">
                <button onClick={() => setResultTab("results")}
                  className={`text-xs font-semibold uppercase tracking-wide transition-colors ${resultTab === "results" ? "text-accent" : "text-text-muted hover:text-text"}`}>
                  Test Results
                </button>
                <button onClick={() => setResultTab("compile")}
                  className={`text-xs font-semibold uppercase tracking-wide transition-colors ${resultTab === "compile" ? "text-accent" : "text-text-muted hover:text-text"}`}>
                  Compile
                </button>
              </div>
              {judgeResult && statusCfg && StatusIcon && (
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.color}`}>
                    <StatusIcon size={14} />
                    <span>{statusCfg.label}</span>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {judgeResult.passed_count}/{judgeResult.total_count} passed
                  </span>
                  {judgeResult.max_time_ms > 0 && (
                    <span className="text-[11px] text-text-muted">
                      <Clock size={10} className="mr-0.5 inline" />{judgeResult.max_time_ms}ms
                    </span>
                  )}
                  {judgeResult.max_memory_kb > 0 && (
                    <span className="text-[11px] text-text-muted">
                      <MemoryStick size={10} className="mr-0.5 inline" />
                      {judgeResult.max_memory_kb > 1024 ? `${(judgeResult.max_memory_kb / 1024).toFixed(1)}MB` : `${judgeResult.max_memory_kb}KB`}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Result Body */}
            <div className="flex-1 overflow-auto p-3">
              {busy && (
                <div className="flex items-center gap-2 text-text-muted py-4 justify-center">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">{isSubmitting ? "Judging all test cases..." : "Running sample tests..."}</span>
                </div>
              )}

              {!busy && pendingReview && (
                <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-subtle p-3 text-sm text-accent">
                  <Hourglass size={16} />
                  <span className="font-semibold">Submission received — awaiting manual review</span>
                  <span className="text-xs text-text-muted">
                    An instructor will grade this submission and provide feedback.
                  </span>
                </div>
              )}

              {!busy && !judgeResult && !pendingReview && (
                <div className="py-4 text-center text-sm text-text-muted">
                  {isSubjective
                    ? "This is a subjective problem — submit your solution for manual review by an instructor."
                    : "Click Run to test with sample cases, or Submit to judge against all test cases."}
                </div>
              )}

              {!busy && judgeResult && resultTab === "compile" && (
                <div className="space-y-2">
                  <div className="text-xs text-text-muted">Compile time: {judgeResult.compile_time_ms}ms</div>
                  {judgeResult.compile_error ? (
                    <pre className="whitespace-pre-wrap rounded-lg bg-bg p-3 font-mono text-xs text-red-400">{judgeResult.compile_error}</pre>
                  ) : (
                    <div className="text-sm text-green-400">Compilation successful</div>
                  )}
                </div>
              )}

              {!busy && judgeResult && resultTab === "results" && judgeResult.test_case_results.length > 0 && (
                <div className="space-y-3">
                  {/* Test case pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {judgeResult.test_case_results.map((tc, i) => {
                      const isAC = tc.status === "accepted";
                      return (
                        <button key={i} onClick={() => setSelectedTC(i)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                            selectedTC === i ? "border-accent bg-accent/10 text-accent" :
                            isAC ? "border-green-400/30 text-green-400 hover:bg-green-400/10" :
                            "border-red-400/30 text-red-400 hover:bg-red-400/10"
                          }`}>
                          {isAC ? <CheckCircle2 size={11} className="mr-1 inline" /> : <XCircle size={11} className="mr-1 inline" />}
                          #{i + 1}{tc.is_sample ? " (Sample)" : ""}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected test case details */}
                  {selectedResult && (
                    <div className="rounded-lg border border-border bg-bg overflow-hidden">
                      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                        <span className="text-xs font-semibold text-text-muted">
                          Test Case #{selectedTC + 1} {selectedResult.is_sample ? "(Sample)" : "(Hidden)"}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-text-muted">
                          <span className={selectedResult.status === "accepted" ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                            {(STATUS_ICONS[selectedResult.status] || STATUS_ICONS.error).label}
                          </span>
                          {selectedResult.time_taken_ms > 0 && <span>{selectedResult.time_taken_ms}ms</span>}
                          {selectedResult.memory_used_kb > 0 && (
                            <span>
                              {selectedResult.memory_used_kb > 1024
                                ? `${(selectedResult.memory_used_kb / 1024).toFixed(1)}MB`
                                : `${selectedResult.memory_used_kb}KB`}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedResult.is_sample && (
                        <div className="grid grid-cols-3 divide-x divide-border text-xs">
                          <div className="p-3">
                            <div className="mb-1 text-[10px] font-semibold uppercase text-text-muted">Input</div>
                            <pre className="whitespace-pre-wrap font-mono text-text">
                              {question.sample_test_cases.find((s) => s.id === selectedResult.test_case_id)?.input || "—"}
                            </pre>
                          </div>
                          <div className="p-3">
                            <div className="mb-1 text-[10px] font-semibold uppercase text-text-muted">Expected</div>
                            <pre className="whitespace-pre-wrap font-mono text-text">
                              {question.sample_test_cases.find((s) => s.id === selectedResult.test_case_id)?.expected_output || "—"}
                            </pre>
                          </div>
                          <div className="p-3">
                            <div className="mb-1 text-[10px] font-semibold uppercase text-text-muted">Your Output</div>
                            <pre className="whitespace-pre-wrap font-mono text-text">{selectedResult.stdout || "(empty)"}</pre>
                          </div>
                        </div>
                      )}
                      {!selectedResult.is_sample && (
                        <div className="p-3 text-xs text-text-muted">
                          Hidden test case — input and expected output are not visible.
                          {selectedResult.stderr && (
                            <pre className="mt-2 whitespace-pre-wrap text-red-400">{selectedResult.stderr}</pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!busy && judgeResult && resultTab === "results" && judgeResult.status === "compilation_error" && (
                <div className="py-2">
                  <p className="text-sm text-red-400">Compilation failed — see Compile tab for details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
