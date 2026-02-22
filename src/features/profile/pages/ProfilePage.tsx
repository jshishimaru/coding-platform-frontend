import { useState, useEffect } from "react";
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
  User,
  Trophy,
  Zap,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { apiClient } from "@/lib/api-client";

/* ─── Types ─── */
interface ContestHistoryEntry {
  contest_id: number;
  title: string;
  start_time: string;
  end_time: string;
  is_rated: boolean;
  score: number;
  rank: number | null;
  rating_before: number | null;
  rating_after: number | null;
  rating_change: number | null;
}

/* ─── Helpers ─── */
function getRatingTier(rating: number): { name: string; color: string } {
  if (rating >= 2400) return { name: "Grandmaster", color: "text-red-500" };
  if (rating >= 2100) return { name: "Master", color: "text-orange-400" };
  if (rating >= 1800) return { name: "Expert", color: "text-blue-400" };
  if (rating >= 1400) return { name: "Specialist", color: "text-cyan-400" };
  if (rating >= 1200) return { name: "Pupil", color: "text-green-400" };
  return { name: "Newbie", color: "text-zinc-400" };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-text-muted">{label}</span>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-text-muted">{icon}</span>}
        <span className="text-xl font-bold tabular-nums text-text">{value}</span>
      </div>
    </div>
  );
}

/* ─── Page Component ─── */
export function ProfilePage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<ContestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ history: ContestHistoryEntry[] }>("/contests/history")
      .then((res) => setHistory(res.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  const tier = getRatingTier(user.rating);

  return (
    <div className="space-y-6">
      {/* Row 1 — Identity Hero Island */}
      <Island className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar Block */}
          <div className="aspect-square h-32 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-bg-secondary">
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <User size={48} strokeWidth={1.5} />
            </div>
          </div>

          {/* Info Block */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text">{user.username}</h1>
                <p className="text-sm text-text-muted">{user.email}</p>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    Joined {formatDate(user.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award size={12} />
                    {user.role}
                  </div>
                </div>
              </div>

              {/* Rating Block */}
              <div className="text-right">
                <div className={`text-sm font-semibold ${tier.color}`}>{tier.name}</div>
                <div className="flex items-baseline justify-end gap-2">
                  <span className="text-4xl font-bold tabular-nums text-text">{user.rating}</span>
                </div>
              </div>
            </div>

            {/* Horizontal Stats */}
            <div className="mt-6 flex items-center gap-8 border-t border-border pt-4">
              <StatItem label="Rating" value={user.rating.toString()} icon={<Zap size={16} />} />
              <StatItem label="Tier" value={tier.name} icon={<Trophy size={16} />} />
              <StatItem label="Contests Played" value={history.length.toString()} icon={<Award size={16} />} />
            </div>
          </div>
        </div>
      </Island>

      {/* Row 2 — Contest History */}
      <Island>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">Contest History</h3>
          <span className="text-xs text-text-muted">{history.length} contests</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-accent" />
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-sm text-text-muted">
            No contest history yet. Participate in a contest to see your results here.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Contest</TableHead>
                <TableHead className="w-20">Rank</TableHead>
                <TableHead className="w-20">Score</TableHead>
                <TableHead className="w-28">Rating Before</TableHead>
                <TableHead className="w-28">Rating After</TableHead>
                <TableHead className="w-24">Change</TableHead>
                <TableHead className="w-32 text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.contest_id}>
                  <TableCell className="font-medium text-sm">{entry.title}</TableCell>
                  <TableCell className="text-sm">
                    {entry.rank != null && entry.rank <= 3 ? (
                      <span className="flex items-center gap-1">
                        <Trophy size={14} className={
                          entry.rank === 1 ? "text-yellow-400" :
                          entry.rank === 2 ? "text-zinc-300" : "text-amber-600"
                        } />
                        #{entry.rank}
                      </span>
                    ) : entry.rank != null ? (
                      <span className="text-text-muted">#{entry.rank}</span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-accent">{entry.score}</TableCell>
                  <TableCell className="text-xs text-text-muted">{entry.rating_before ?? "—"}</TableCell>
                  <TableCell className="text-xs font-semibold">{entry.rating_after ?? "—"}</TableCell>
                  <TableCell>
                    {entry.rating_change != null ? (
                      <span className={`flex items-center gap-1 text-xs font-mono font-medium ${
                        entry.rating_change >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {entry.rating_change >= 0 ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {entry.rating_change >= 0 ? "+" : ""}{entry.rating_change}
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs text-text-muted">
                    {formatDate(entry.start_time)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Island>
    </div>
  );
}
