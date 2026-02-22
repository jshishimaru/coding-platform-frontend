import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Trophy,
  TrendingUp,
  TrendingDown,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { API_URL } from "@/config/env";
import Editor from "@monaco-editor/react";

/* ─── Types ─── */
interface ContestProblem {
  problem_id: number;
  title: string;
  slug: string;
  points: number;
  problem_order: number;
  difficulty: string;
  time_limit_ms: number;
  memory_limit_mb: number;
}

interface ContestDetail {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_rated: boolean;
  status: "upcoming" | "live" | "ended";
  problems: ContestProblem[];
}

interface LeaderboardSolve {
  problem_id: number;
  points_earned: number;
  solved_at: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  score: number;
  penalty_time: number;
  rating: number;
  rating_before?: number;
  rating_change?: number;
  solves: LeaderboardSolve[];
}

interface RatingPrediction {
  user_id: number;
  username: string;
  current_rating: number;
  predicted_rating: number;
  predicted_change: number;
  current_rank: number;
}

/* ─── Helpers ─── */
function formatCountdown(target: string): string {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const DIFFICULTY_BG: Record<string, string> = {
  easy: "border-green-400/30 bg-green-400/10 text-green-400",
  medium: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  hard: "border-red-400/30 bg-red-400/10 text-red-400",
};

/* ─── Component ─── */
export function ContestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contest, setContest] = useState<ContestDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [predictions, setPredictions] = useState<RatingPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"problems" | "leaderboard" | "ratings">("problems");

  // Submission state
  const [selectedProblem, setSelectedProblem] = useState<ContestProblem | null>(null);
  const [code, setCode] = useState("// Write your C++ solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ status: string; passed: number; total: number } | null>(null);

  // Countdown
  const [countdown, setCountdown] = useState("");

  // SSE for rating predictions
  const sseRef = useRef<EventSource | null>(null);

  const fetchLeaderboard = useCallback(() => {
    if (!id) return;
    apiClient
      .get<{ leaderboard: LeaderboardEntry[] }>(`/contests/${id}/leaderboard`)
      .then((res) => setLeaderboard(res.leaderboard || []))
      .catch(() => {});
  }, [id]);

  // Fetch contest + leaderboard
  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiClient.get<ContestDetail>(`/contests/${id}`),
      apiClient.get<{ leaderboard: LeaderboardEntry[] }>(`/contests/${id}/leaderboard`),
      apiClient.get<{ predictions: RatingPrediction[] }>(`/contests/${id}/ratings/predict`),
    ])
      .then(([c, lb, pred]) => {
        setContest(c);
        setLeaderboard(lb.leaderboard || []);
        setPredictions(pred.predictions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!contest) return;
    const target = contest.status === "live" ? contest.end_time : contest.start_time;
    const interval = setInterval(() => {
      setCountdown(formatCountdown(target));
    }, 1000);
    setCountdown(formatCountdown(target));
    return () => clearInterval(interval);
  }, [contest]);

  // SSE for rating predictions during live contest
  useEffect(() => {
    if (!id || !contest || contest.status !== "live" || !contest.is_rated) return;

    const baseUrl = API_URL.replace(/\/api$/, "");
    const eventSource = new EventSource(`${baseUrl}/api/contests/${id}/ratings/stream`);
    sseRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "rating_update" && data.predictions) {
          setPredictions(data.predictions);
        }
      } catch {}
    };

    return () => {
      eventSource.close();
      sseRef.current = null;
    };
  }, [id, contest]);

  // Refresh leaderboard periodically during live
  useEffect(() => {
    if (!contest || contest.status !== "live") return;
    const interval = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(interval);
  }, [contest, fetchLeaderboard]);

  const handleSubmit = async () => {
    if (!selectedProblem || !id || submitting) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await apiClient.post<{
        submission: { status: string; passed_count: number; total_count: number };
        result: { status: string; passed_count: number; total_count: number };
      }>(`/contests/${id}/submit`, {
        problem_id: selectedProblem.problem_id,
        code,
        language: "cpp",
      });
      setSubmitResult({
        status: res.result.status,
        passed: res.result.passed_count,
        total: res.result.total_count,
      });
      // Refresh leaderboard after submission
      fetchLeaderboard();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setSubmitResult({ status: message, passed: 0, total: 0 });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="py-20 text-center text-text-muted">Contest not found</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/contests")}
            className="rounded-lg border border-border p-2 text-text-muted hover:text-text hover:border-accent transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text">{contest.title}</h1>
            <p className="text-sm text-text-muted">{contest.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-mono font-bold tabular-nums ${
            contest.status === "live" ? "text-green-400" : contest.status === "upcoming" ? "text-blue-400" : "text-text-muted"
          }`}>
            {contest.status === "ended" ? "Ended" : countdown}
          </div>
          <div className="text-xs text-text-muted mt-1">
            {contest.status === "live" ? "Time remaining" : contest.status === "upcoming" ? "Starts in" : ""}
            {contest.is_rated && <span className="ml-2 text-accent">● Rated</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0">
        {(["problems", "leaderboard", "ratings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {tab === "ratings" ? "Rating Predictor" : tab}
          </button>
        ))}
      </div>

      {/* Problems Tab */}
      {activeTab === "problems" && (
        <div className="grid grid-cols-12 gap-6">
          {/* Problem list */}
          <div className={selectedProblem ? "col-span-4" : "col-span-12"}>
            <Island>
              <h3 className="mb-3 text-sm font-semibold text-text">Problems</h3>
              <div className="space-y-2">
                {contest.problems.map((p) => (
                  <div
                    key={p.problem_id}
                    onClick={() => {
                      setSelectedProblem(p);
                      setSubmitResult(null);
                    }}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                      selectedProblem?.problem_id === p.problem_id
                        ? "border-accent bg-accent-subtle"
                        : "border-border bg-bg hover:border-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-text-muted">
                          {String.fromCharCode(64 + p.problem_order)}
                        </span>
                        <span className="text-sm font-medium text-text">{p.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${DIFFICULTY_BG[p.difficulty] || DIFFICULTY_BG.medium}`}>
                          {p.difficulty}
                        </span>
                        <span className="text-xs font-bold text-accent">{p.points}pt</span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-text-muted">
                        {p.time_limit_ms}ms · {p.memory_limit_mb}MB
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/questions/${p.slug}`);
                        }}
                        className="flex items-center gap-1 text-[10px] text-accent hover:underline"
                      >
                        <ExternalLink size={10} />
                        View Problem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Island>
          </div>

          {/* Code Editor */}
          {selectedProblem && contest.status === "live" && (
            <div className="col-span-8">
              <Island>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-text">
                        {String.fromCharCode(64 + selectedProblem.problem_order)}. {selectedProblem.title}
                      </h3>
                      <p className="text-[11px] text-text-muted">
                        {selectedProblem.points} points · {selectedProblem.time_limit_ms}ms · {selectedProblem.memory_limit_mb}MB
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/questions/${selectedProblem.slug}`)}
                      className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-accent hover:border-accent hover:bg-accent-subtle transition-colors"
                    >
                      <ExternalLink size={12} />
                      Full Problem Statement
                    </button>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 text-xs"
                  >
                    {submitting ? (
                      <><Loader2 size={14} className="animate-spin" /> Judging...</>
                    ) : (
                      <><Send size={14} /> Submit</>
                    )}
                  </Button>
                </div>

                {/* Submit result */}
                {submitResult && (
                  <div className={`mb-3 rounded-lg border p-3 text-sm ${
                    submitResult.status === "accepted"
                      ? "border-green-400/30 bg-green-400/10 text-green-400"
                      : "border-red-400/30 bg-red-400/10 text-red-400"
                  }`}>
                    <div className="flex items-center gap-2">
                      {submitResult.status === "accepted" ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      <span className="font-semibold capitalize">{submitResult.status.replace(/_/g, " ")}</span>
                      <span className="text-xs">
                        ({submitResult.passed}/{submitResult.total} passed)
                      </span>
                    </div>
                  </div>
                )}

                <div className="overflow-hidden rounded-lg border border-border">
                  <Editor
                    height="400px"
                    defaultLanguage="cpp"
                    value={code}
                    onChange={(v) => setCode(v || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      padding: { top: 12 },
                    }}
                  />
                </div>
              </Island>
            </div>
          )}

          {selectedProblem && contest.status !== "live" && (
            <div className="col-span-8">
              <Island>
                <div className="flex items-center justify-center py-12 text-text-muted">
                  {contest.status === "upcoming"
                    ? "Contest hasn't started yet. Come back when it's live!"
                    : "This contest has ended. Submissions are closed."}
                </div>
              </Island>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <Island>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Leaderboard</h3>
            <span className="text-xs text-text-muted">{leaderboard.length} participants</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16">#</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="w-20">Score</TableHead>
                <TableHead className="w-24">Penalty</TableHead>
                <TableHead className="w-20">Rating</TableHead>
                {contest.status === "ended" && (
                  <TableHead className="w-28">Rating Change</TableHead>
                )}
                {contest.problems.map((p) => (
                  <TableHead key={p.problem_id} className="w-16 text-center">
                    {String.fromCharCode(64 + p.problem_order)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5 + contest.problems.length} className="text-center py-8 text-sm text-text-muted">
                    No participants yet
                  </TableCell>
                </TableRow>
              )}
              {leaderboard.map((entry) => (
                <TableRow key={entry.user_id}>
                  <TableCell className="font-mono text-xs">
                    {entry.rank <= 3 ? (
                      <Trophy size={14} className={
                        entry.rank === 1 ? "text-yellow-400" :
                        entry.rank === 2 ? "text-zinc-300" : "text-amber-600"
                      } />
                    ) : entry.rank}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{entry.username}</TableCell>
                  <TableCell className="font-mono text-sm font-bold text-accent">{entry.score}</TableCell>
                  <TableCell className="text-xs text-text-muted">{entry.penalty_time}min</TableCell>
                  <TableCell className="text-xs text-text-muted">{entry.rating}</TableCell>
                  {contest.status === "ended" && (
                    <TableCell className="text-xs">
                      {entry.rating_change != null ? (
                        <span className={entry.rating_change >= 0 ? "text-green-400" : "text-red-400"}>
                          {entry.rating_change >= 0 ? "+" : ""}{entry.rating_change}
                        </span>
                      ) : "—"}
                    </TableCell>
                  )}
                  {contest.problems.map((p) => {
                    const solve = entry.solves.find((s) => s.problem_id === p.problem_id);
                    return (
                      <TableCell key={p.problem_id} className="text-center">
                        {solve ? (
                          <span className="text-xs font-bold text-green-400">+{solve.points_earned}</span>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Island>
      )}

      {/* Rating Predictor Tab */}
      {activeTab === "ratings" && (
        <Island>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text">Rating Predictions</h3>
              {contest.status === "live" && contest.is_rated && (
                <span className="flex items-center gap-1 rounded-full bg-green-400/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            {!contest.is_rated && (
              <span className="text-xs text-text-muted">This contest is unrated</span>
            )}
          </div>

          {!contest.is_rated ? (
            <div className="py-12 text-center text-sm text-text-muted">
              Rating predictions are only available for rated contests.
            </div>
          ) : predictions.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              No participants yet. Predictions will appear when users start submitting.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="w-28">Current Rating</TableHead>
                  <TableHead className="w-28">Predicted</TableHead>
                  <TableHead className="w-28">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((p) => (
                  <TableRow key={p.user_id}>
                    <TableCell className="font-mono text-xs">{p.current_rank}</TableCell>
                    <TableCell className="text-sm font-medium">{p.username}</TableCell>
                    <TableCell className="text-sm text-text-muted">{p.current_rating}</TableCell>
                    <TableCell className="text-sm font-bold">{p.predicted_rating}</TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1 text-sm font-bold ${
                        p.predicted_change >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {p.predicted_change >= 0 ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {p.predicted_change >= 0 ? "+" : ""}{p.predicted_change}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Island>
      )}
    </div>
  );
}
