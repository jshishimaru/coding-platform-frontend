import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Island } from "@/components/ui/Island";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

/* ─── Types ─── */
interface Question {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  created_at: string;
}

/* ─── Difficulty Helpers ─── */
const DIFFICULTY_BG: Record<string, string> = {
  easy: "border-green-400/30 bg-green-400/10 text-green-400",
  medium: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  hard: "border-red-400/30 bg-red-400/10 text-red-400",
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cls = DIFFICULTY_BG[difficulty] || DIFFICULTY_BG.medium;
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${cls}`}>
      {difficulty}
    </span>
  );
}



/* ─── Page Component ─── */
export function QuestionListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ questions: Question[] }>("/questions")
      .then((res) => setQuestions(res.questions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = questions
    .filter((q) => {
      if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
      if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "difficulty") {
        const order: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
        return (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1);
      }
      return a.id - b.id;
    });

  const progressPercentage = 0;

  return (
    <div className="space-y-6">
      {/* Row 1 — Control Islands */}
      <div className="grid grid-cols-12 gap-6">
        {/* Search Panel */}
        <div className="col-span-5">
          <Island className="h-full">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Search
            </h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search questions or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </Island>
        </div>

        {/* Difficulty Filter Panel */}
        <div className="col-span-4">
          <Island className="h-full">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Difficulty
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {["all", "easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    difficultyFilter === d
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border bg-bg text-text-muted hover:border-accent hover:text-text"
                  }`}
                >
                  {d === "all" ? "All" : d}
                </button>
              ))}
            </div>
          </Island>
        </div>

        {/* Progress Summary Panel */}
        <div className="col-span-3">
          <Island className="h-full">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Progress
            </h3>
            <div className="space-y-2">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold tabular-nums text-text">{questions.length}</span>
                  <span className="text-xs text-text-muted">questions</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg">
                  <div 
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Island>
        </div>
      </div>

      {/* Row 2 — Main Question Workspace */}
      <Island>
        {/* Controls */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">All Questions</h3>
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-lg border border-border bg-bg py-1.5 pl-3 pr-9 text-xs text-text outline-none transition-colors hover:border-accent focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="id">Sort by ID</option>
              <option value="title">Sort by Title</option>
              <option value="difficulty">Sort by Difficulty</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* Questions Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="w-28">Time Limit</TableHead>
              <TableHead className="w-28">Memory</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 size={20} className="inline animate-spin text-accent" />
                </TableCell>
              </TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-text-muted text-sm">
                  No questions found
                </TableCell>
              </TableRow>
            )}
            {filtered.map((q) => (
              <TableRow key={q.id} className="cursor-pointer" onClick={() => navigate(`/questions/${q.slug}`)}>
                <TableCell className="font-mono text-xs text-text-muted">{q.id}</TableCell>
                <TableCell className="font-medium text-sm">{q.title}</TableCell>
                <TableCell>
                  <DifficultyBadge difficulty={q.difficulty} />
                </TableCell>
                <TableCell className="text-xs text-text-muted">{q.time_limit_ms}ms</TableCell>
                <TableCell className="text-xs text-text-muted">{q.memory_limit_mb}MB</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Island>
    </div>
  );
}
