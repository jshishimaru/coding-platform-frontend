import { useState, useRef } from "react";
import { Island } from "@/components/ui/Island";
import { Button } from "@/components/ui/Button";
import Editor from "@monaco-editor/react";
import { apiClient } from "@/lib/api-client";
import {
  Play,
  Trash2,
  ChevronDown,
  Clock,
  MemoryStick,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  Loader2,
} from "lucide-react";

/* ─── Types ─── */
interface ExecutionResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  time_taken_ms: number;
  memory_used_kb: number;
  status: string;
  compile_time_ms: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  success:               { label: "Accepted",                color: "text-green-400",  icon: CheckCircle2 },
  compilation_error:     { label: "Compilation Error",       color: "text-red-400",    icon: XCircle },
  runtime_error:         { label: "Runtime Error",           color: "text-orange-400", icon: AlertTriangle },
  time_limit_exceeded:   { label: "Time Limit Exceeded",     color: "text-yellow-400", icon: Timer },
  memory_limit_exceeded: { label: "Memory Limit Exceeded",   color: "text-yellow-400", icon: MemoryStick },
  error:                 { label: "Internal Error",          color: "text-red-400",    icon: XCircle },
};

const CPP_TEMPLATE = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string name;
    cin >> name;
    cout << "Hello, " << name << "!" << endl;

    return 0;
}`;

/* ─── Main Page ─── */
export function SandboxPage() {
  const [code, setCode] = useState(CPP_TEMPLATE);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [activeTab, setActiveTab] = useState<"stdout" | "stderr">("stdout");

  const editorRef = useRef<any>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    setActiveTab("stdout");

    try {
      const res = await apiClient.post<ExecutionResult>("/sandbox/run", {
        code,
        input,
        language: "cpp",
        time_limit: 10,
        memory_limit: 256,
      });
      setResult(res);
      // Switch to stderr tab if there's a compilation or runtime error
      if (res.status === "compilation_error" || (res.status === "runtime_error" && res.stderr)) {
        setActiveTab("stderr");
      }
    } catch (err: any) {
      setResult({
        stdout: "",
        stderr: err.message || "Failed to execute code",
        exit_code: -1,
        time_taken_ms: 0,
        memory_used_kb: 0,
        status: "error",
        compile_time_ms: 0,
      });
      setActiveTab("stderr");
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setCode(CPP_TEMPLATE);
    setInput("");
    setResult(null);
  };

  const statusCfg = result ? STATUS_CONFIG[result.status] || STATUS_CONFIG.error : null;
  const StatusIcon = statusCfg?.icon;

  return (
    <div className="space-y-4">
      {/* Row 1 — Control Strip */}
      <Island>
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            {/* Language Selector (C++ only for now) */}
            <div className="relative">
              <select
                value="cpp"
                disabled
                className="appearance-none rounded-lg border border-border bg-bg py-2 pl-3 pr-9 text-sm font-medium text-text outline-none opacity-80"
              >
                <option value="cpp">C++17</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
            </div>

            {/* Run Button */}
            <Button
              variant="primary"
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 text-sm"
            >
              {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {isRunning ? "Running..." : "Run"}
            </Button>

            {/* Clear Button */}
            <Button
              variant="secondary"
              onClick={handleClear}
              className="flex items-center gap-2 text-sm"
            >
              <Trash2 size={14} />
              Clear
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {result && statusCfg && StatusIcon && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.color}`}>
                <StatusIcon size={14} />
                <span>{statusCfg.label}</span>
              </div>
            )}

            {/* Execution Stats */}
            {result && result.status !== "compilation_error" && result.time_taken_ms > 0 && (
              <div className="flex items-center gap-3 border-l border-border pl-3">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock size={12} />
                  <span className="font-mono">{result.time_taken_ms}ms</span>
                </div>
                {result.memory_used_kb > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <MemoryStick size={12} />
                    <span className="font-mono">
                      {result.memory_used_kb > 1024
                        ? `${(result.memory_used_kb / 1024).toFixed(1)}MB`
                        : `${result.memory_used_kb}KB`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Editor Theme */}
            <div className="relative">
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value as "vs-dark" | "light")}
                className="appearance-none rounded-lg border border-border bg-bg py-1.5 pl-3 pr-9 text-xs text-text outline-none transition-colors hover:border-accent focus:border-accent focus:ring-1 focus:ring-accent"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
            </div>

            {/* Font Size */}
            <div className="relative">
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="appearance-none rounded-lg border border-border bg-bg py-1.5 pl-3 pr-9 text-xs text-text outline-none transition-colors hover:border-accent focus:border-accent focus:ring-1 focus:ring-accent"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
            </div>
          </div>
        </div>
      </Island>

      {/* Row 2 — Main Workspace */}
      <Island className="p-0 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Left — Editor */}
          <div className="flex-[0_0_70%] border-r border-border">
            <Editor
              height="100%"
              language="cpp"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme={editorTheme}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: "on",
                renderLineHighlight: "all",
                smoothScrolling: true,
                cursorBlinking: "smooth",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            />
          </div>

          {/* Right — Input / Output / Errors */}
          <div className="flex-[0_0_30%] flex flex-col">
            {/* Input Panel */}
            <div className="h-[200px] flex flex-col border-b border-border">
              <div className="flex items-center border-b border-border bg-bg px-4 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Input (stdin)
                </h3>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input here..."
                className="flex-1 resize-none bg-bg-secondary p-4 font-mono text-sm text-text placeholder-text-muted outline-none"
              />
            </div>

            {/* Output / Stderr Panel with Tabs */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center border-b border-border bg-bg">
                <button
                  onClick={() => setActiveTab("stdout")}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    activeTab === "stdout"
                      ? "text-accent border-b-2 border-accent"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  Output
                </button>
                <button
                  onClick={() => setActiveTab("stderr")}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    activeTab === "stderr"
                      ? "text-accent border-b-2 border-accent"
                      : "text-text-muted hover:text-text"
                  } ${result?.stderr ? "text-red-400" : ""}`}
                >
                  Errors
                  {result?.stderr && (
                    <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-bg-secondary p-4 font-mono text-sm">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Compiling and running...</span>
                  </div>
                ) : activeTab === "stdout" ? (
                  result?.stdout ? (
                    <pre className="whitespace-pre-wrap text-text">{result.stdout}</pre>
                  ) : result ? (
                    <span className="text-text-muted">
                      {result.status === "compilation_error"
                        ? "Compilation failed — see Errors tab"
                        : "No output produced"}
                    </span>
                  ) : (
                    <span className="text-text-muted">
                      Run your code to see results.
                    </span>
                  )
                ) : result?.stderr ? (
                  <pre className="whitespace-pre-wrap text-red-400">{result.stderr}</pre>
                ) : (
                  <span className="text-text-muted">No errors.</span>
                )}
              </div>

              {/* Stats Footer */}
              {result && result.status !== "error" && (
                <div className="flex items-center gap-4 border-t border-border bg-bg px-4 py-2 text-[11px] text-text-muted">
                  <span>Compile: {result.compile_time_ms}ms</span>
                  {result.status !== "compilation_error" && (
                    <>
                      <span>Run: {result.time_taken_ms}ms</span>
                      <span>
                        Memory:{" "}
                        {result.memory_used_kb > 1024
                          ? `${(result.memory_used_kb / 1024).toFixed(1)}MB`
                          : `${result.memory_used_kb}KB`}
                      </span>
                      <span>Exit: {result.exit_code}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Island>
    </div>
  );
}
