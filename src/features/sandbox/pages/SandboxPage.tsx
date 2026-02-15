import { useState, useRef } from "react";
import { Island } from "@/components/ui/Island";
import { Button } from "@/components/ui/Button";
import Editor from "@monaco-editor/react";
import {
  Play,
  Trash2,
  ChevronDown,
  Clock,
} from "lucide-react";

/* ─── Types ─── */
interface Language {
  id: string;
  name: string;
  template: string;
}

/* ─── Sample Data ─── */
const languages: Language[] = [
  {
    id: "javascript",
    name: "JavaScript",
    template: `// JavaScript code
function solve() {
  const input = readInput();
  console.log("Hello from JavaScript!");
  console.log("Input:", input);
}

solve();`,
  },
  {
    id: "python",
    name: "Python",
    template: `# Python code
def solve():
    input_data = input()
    print("Hello from Python!")
    print("Input:", input_data)

solve()`,
  },
  {
    id: "cpp",
    name: "C++",
    template: `// C++ code
#include <iostream>
using namespace std;

int main() {
    string input;
    getline(cin, input);
    cout << "Hello from C++!" << endl;
    cout << "Input: " << input << endl;
    return 0;
}`,
  },
  {
    id: "java",
    name: "Java",
    template: `// Java code
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine();
        System.out.println("Hello from Java!");
        System.out.println("Input: " + input);
    }
}`,
  },
];

/* ─── Main Page ─── */
export function SandboxPage() {
  const [language, setLanguage] = useState<Language>(languages[0]);
  const [code, setCode] = useState(language.template);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [fontSize, setFontSize] = useState(14);

  const editorRef = useRef<any>(null);

  const handleLanguageChange = (langId: string) => {
    const lang = languages.find((l) => l.id === langId);
    if (lang) {
      setLanguage(lang);
      setCode(lang.template);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Running code...\n");
    const startTime = Date.now();

    // Simulate code execution
    setTimeout(() => {
      const endTime = Date.now();
      const execTime = endTime - startTime;
      setExecutionTime(execTime);

      // Mock output
      const mockOutput = `Execution completed successfully.\n\nInput received:\n${input || "(empty)"}\n\nOutput:\nHello from ${language.name}!\nInput: ${input || "(empty)"}`;
      setOutput(mockOutput);
      setIsRunning(false);
    }, 1200);
  };

  const handleClear = () => {
    setCode(language.template);
    setInput("");
    setOutput("");
    setExecutionTime(null);
  };

  return (
    <div className="space-y-6">
      {/* Row 1 — Control Strip */}
      <Island>
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={language.id}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="appearance-none rounded-lg border border-border bg-bg py-2 pl-3 pr-9 text-sm font-medium text-text outline-none transition-colors hover:border-accent focus:border-accent focus:ring-1 focus:ring-accent"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
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
              <Play size={14} />
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
            {/* Execution Time */}
            {executionTime !== null && (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Clock size={12} />
                <span className="font-mono">{executionTime}ms</span>
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
              language={language.id === "cpp" ? "cpp" : language.id}
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

          {/* Right — Input/Output */}
          <div className="flex-[0_0_30%] flex flex-col">
            {/* Input Panel */}
            <div className="flex-1 flex flex-col border-b border-border">
              <div className="flex items-center justify-between border-b border-border bg-bg px-4 py-2">
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

            {/* Output Panel */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-border bg-bg px-4 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Output (stdout)
                </h3>
              </div>
              <div className="flex-1 overflow-auto bg-bg-secondary p-4 font-mono text-sm text-text">
                {output ? (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                ) : (
                  <span className="text-text-muted">No output yet. Run your code to see results.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Island>
    </div>
  );
}
