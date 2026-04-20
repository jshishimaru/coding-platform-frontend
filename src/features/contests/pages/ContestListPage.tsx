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
  Trophy,
  Clock,
  TrendingUp,
  Loader2,
  Users,
  Zap,
  Lock,
  Eye,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

/* ─── Types ─── */
interface Contest {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_rated: boolean;
  status: "upcoming" | "live" | "ended";
  participants: number;
  problem_count: number;
  group_id?: number | null;
  group_name?: string;
  proctored?: boolean;
  grade_visibility?: "private" | "group";
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function durationMinutes(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

const STATUS_BADGE: Record<string, string> = {
  live: "border-green-400/30 bg-green-400/10 text-green-400",
  upcoming: "border-blue-400/30 bg-blue-400/10 text-blue-400",
  ended: "border-zinc-400/30 bg-zinc-400/10 text-zinc-400",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] || STATUS_BADGE.ended;
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${cls}`}>
      {status === "live" ? "● Live" : status}
    </span>
  );
}

/* ─── Page Component ─── */
export function ContestListPage() {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    apiClient
      .get<{ contests: Contest[] }>("/contests")
      .then((res) => setContests(res.contests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const liveContests = contests.filter((c) => c.status === "live");
  const upcomingContests = contests.filter((c) => c.status === "upcoming");

  const filtered = contests
    .filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "participants") return b.participants - a.participants;
      if (sortBy === "duration") return durationMinutes(a.start_time, a.end_time) - durationMinutes(b.start_time, b.end_time);
      return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Row 1 — Status Panels */}
      <div className="grid grid-cols-12 gap-6">
        {/* Live Contest Panel */}
        <div className="col-span-5">
          <Island className="h-full">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Live Contests
            </h3>
            {liveContests.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <Trophy size={28} className="mx-auto mb-1 text-text-muted" />
                  <p className="text-xs text-text-muted">No live contests right now</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {liveContests.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/contests/${c.id}`)}
                    className="cursor-pointer rounded-lg border border-green-400/20 bg-green-400/5 p-3 transition-colors hover:border-green-400/40"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text">{c.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                          <Clock size={10} />
                          <span className="font-mono text-warning">{formatTimeLeft(c.end_time)} left</span>
                          <span>·</span>
                          <span>{c.problem_count} problems</span>
                        </div>
                      </div>
                      <Zap size={16} className="text-green-400 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Island>
        </div>

        {/* Upcoming */}
        <div className="col-span-4">
          <Island className="h-full">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Upcoming
            </h3>
            {upcomingContests.length === 0 ? (
              <p className="py-4 text-center text-xs text-text-muted">No upcoming contests</p>
            ) : (
              <div className="space-y-2">
                {upcomingContests.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/contests/${c.id}`)}
                    className="cursor-pointer rounded-lg border border-border bg-bg p-2.5 transition-colors hover:border-accent"
                  >
                    <p className="text-xs font-semibold text-text">{c.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-text-muted">
                      <span>Starts {formatTimeLeft(c.start_time)}</span>
                      <span>·</span>
                      <span>{durationMinutes(c.start_time, c.end_time)}min</span>
                      {c.is_rated && <span className="text-accent">rated</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Island>
        </div>

        {/* Stats */}
        <div className="col-span-3">
          <Island className="h-full">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Overview
            </h3>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-text-muted">Total Contests</span>
                <span className="text-lg font-bold tabular-nums text-text">{contests.length}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-text-muted">Live Now</span>
                <span className="text-lg font-bold tabular-nums text-green-400">{liveContests.length}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-text-muted">Upcoming</span>
                <span className="text-lg font-bold tabular-nums text-blue-400">{upcomingContests.length}</span>
              </div>
            </div>
          </Island>
        </div>
      </div>

      {/* Row 2 — Main Contest Table */}
      <Island>
        <div className="mb-4 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search contests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-1.5">
            {["all", "live", "upcoming", "ended"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? "border-accent bg-accent-subtle text-accent"
                    : "border-border bg-bg text-text-muted hover:border-accent hover:text-text"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-lg border border-border bg-bg py-1.5 pl-3 pr-9 text-xs text-text outline-none transition-colors hover:border-accent focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="date">Sort by Date</option>
              <option value="duration">Sort by Duration</option>
              <option value="participants">Sort by Participants</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Contest</TableHead>
              <TableHead className="w-32">Start</TableHead>
              <TableHead className="w-24">Duration</TableHead>
              <TableHead className="w-20">Problems</TableHead>
              <TableHead className="w-28">Participants</TableHead>
              <TableHead className="w-20">Rated</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 size={20} className="inline animate-spin text-accent" />
                </TableCell>
              </TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-text-muted text-sm">
                  No contests found
                </TableCell>
              </TableRow>
            )}
            {filtered.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer"
                onClick={() => navigate(`/contests/${c.id}`)}
              >
                <TableCell className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <span>{c.title}</span>
                    {c.group_id && c.group_name && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-subtle px-2 py-0.5 text-[10px] font-medium text-accent">
                        <Users size={10} /> {c.group_name}
                      </span>
                    )}
                    {c.proctored && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning"
                        title="This contest is proctored"
                      >
                        <Eye size={10} /> Proctored
                      </span>
                    )}
                    {c.grade_visibility === "private" && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-secondary px-2 py-0.5 text-[10px] font-medium text-text-muted"
                        title="Grades are private"
                      >
                        <Lock size={10} /> Private
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-text-muted">{formatDate(c.start_time)}</TableCell>
                <TableCell className="text-xs text-text-muted">
                  {durationMinutes(c.start_time, c.end_time)}min
                </TableCell>
                <TableCell className="text-xs text-text-muted">{c.problem_count}</TableCell>
                <TableCell className="text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    {c.participants}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {c.is_rated ? (
                    <span className="flex items-center gap-1 text-accent">
                      <TrendingUp size={12} /> Rated
                    </span>
                  ) : (
                    <span className="text-text-muted">Unrated</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={c.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Island>
    </div>
  );
}
