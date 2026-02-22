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
  Code2,
  Trophy,
  Zap,
  Clock,
  Users,
  Loader2,
  FileText,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/store";

/* ─── Types ─── */
interface Contest {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  is_rated: boolean;
  status: "upcoming" | "live" | "ended";
  participants: number;
  problem_count: number;
}

interface Question {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
}

/* ─── Helpers ─── */
function formatTimeLeft(target: string): string {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return "ended";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

/* ─── Page Component ─── */
export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [contests, setContests] = useState<Contest[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<{ contests: Contest[] }>("/contests").catch(() => ({ contests: [] })),
      apiClient.get<{ questions: Question[] }>("/questions").catch(() => ({ questions: [] })),
    ])
      .then(([c, q]) => {
        setContests(c.contests || []);
        setQuestions(q.questions || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const liveContests = contests.filter((c) => c.status === "live");
  const upcomingContests = contests.filter((c) => c.status === "upcoming");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}
    >
      {/* Row 1 — Welcome + Contest Status */}
      <div className="col-span-7">
        <Island className="h-full flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-subtle">
              <Code2 size={30} className="text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-snug text-text">
                Welcome back{user ? `, ${user.username}` : ""}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Solve problems, compete in contests, and level up your skills.
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <div className="flex items-center gap-1.5 rounded-md bg-bg px-2.5 py-1.5 text-[11px] font-medium text-text-muted">
              <span className="text-accent"><FileText size={13} /></span>
              {questions.length} problems available
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-bg px-2.5 py-1.5 text-[11px] font-medium text-text-muted">
              <span className="text-accent"><Trophy size={13} /></span>
              {contests.length} total contests
            </div>
            {user && (
              <div className="flex items-center gap-1.5 rounded-md bg-bg px-2.5 py-1.5 text-[11px] font-medium text-text-muted">
                <span className="text-accent"><Zap size={13} /></span>
                Rating: {user.rating}
              </div>
            )}
          </div>
        </Island>
      </div>

      <div className="col-span-5">
        <Island className="h-full">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Live Contests</h3>
            {liveContests.length > 0 && (
              <span className="text-xs font-medium uppercase tracking-wide text-green-400">
                ● {liveContests.length} live
              </span>
            )}
          </div>

          {liveContests.length === 0 ? (
            <p className="py-4 text-center text-xs text-text-muted">No live contests right now</p>
          ) : (
            <div className="space-y-2">
              {liveContests.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/contests/${c.id}`)}
                  className="cursor-pointer rounded-lg border border-green-400/20 bg-green-400/5 p-3 transition-colors hover:border-green-400/40"
                >
                  <p className="text-sm font-semibold text-text">{c.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                    <Clock size={10} />
                    <span className="font-mono text-warning">{formatTimeLeft(c.end_time)} left</span>
                    <span>·</span>
                    <Users size={10} />
                    <span>{c.participants}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {upcomingContests.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">Upcoming</p>
              {upcomingContests.slice(0, 1).map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/contests/${c.id}`)}
                  className="cursor-pointer rounded-lg border border-border p-2 text-xs hover:border-accent transition-colors"
                >
                  <span className="font-medium text-text">{c.title}</span>
                  <span className="ml-2 text-text-muted">starts {formatTimeLeft(c.start_time)}</span>
                </div>
              ))}
            </div>
          )}
        </Island>
      </div>

      {/* Row 2 — Recent Problems */}
      <div className="col-span-12">
        <Island>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Problems</h3>
            <button
              onClick={() => navigate("/questions")}
              className="text-xs text-accent hover:underline"
            >
              View all →
            </button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-14">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-24">Difficulty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-sm text-text-muted">
                    No problems yet
                  </TableCell>
                </TableRow>
              ) : (
                questions.slice(0, 8).map((q) => (
                  <TableRow
                    key={q.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/questions/${q.slug}`)}
                  >
                    <TableCell className="font-mono text-text-muted text-xs">{q.id}</TableCell>
                    <TableCell className="font-medium text-sm">{q.title}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium capitalize ${DIFFICULTY_COLOR[q.difficulty] || "text-text-muted"}`}>
                        {q.difficulty}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Island>
      </div>
    </div>
  );
}
