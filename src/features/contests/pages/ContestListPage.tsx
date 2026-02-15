import { useState } from "react";
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
  Calendar,
  PlayCircle,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

/* ─── Types ─── */
interface Contest {
  id: string;
  name: string;
  startTime: Date;
  duration: number; // minutes
  division: "Div 1" | "Div 2" | "Div 3" | "All";
  participants: number;
  registered: boolean;
}

interface ActiveContest {
  name: string;
  endsAt: Date;
  rank: number;
  solved: number;
  totalProblems: number;
}

/* ─── Sample Data ─── */
const activeContest: ActiveContest | null = {
  name: "ByteCode Weekly #128",
  endsAt: new Date(Date.now() + 3600000 * 2.5), // 2.5 hours from now
  rank: 142,
  solved: 2,
  totalProblems: 5,
};

const nextContest = {
  name: "Global Round #45",
  startsAt: new Date(Date.now() + 86400000 * 2), // 2 days from now
  duration: 150,
  division: "All" as const,
};

const userPerformance = {
  currentRating: 1847,
  lastChange: +42,
  bestRating: 1923,
  avgRank: 287,
  totalContests: 34,
};

const upcomingContests: Contest[] = [
  {
    id: "1",
    name: "Educational Round #172",
    startTime: new Date(Date.now() + 86400000 * 1),
    duration: 120,
    division: "Div 2",
    participants: 0,
    registered: false,
  },
  {
    id: "2",
    name: "Global Round #45",
    startTime: new Date(Date.now() + 86400000 * 2),
    duration: 150,
    division: "All",
    participants: 0,
    registered: true,
  },
  {
    id: "3",
    name: "Div 3 Round #523",
    startTime: new Date(Date.now() + 86400000 * 4),
    duration: 120,
    division: "Div 3",
    participants: 0,
    registered: false,
  },
];

const recentContests: Contest[] = [
  {
    id: "r1",
    name: "ByteCode Weekly #127",
    startTime: new Date(Date.now() - 86400000 * 1),
    duration: 90,
    division: "All",
    participants: 8432,
    registered: true,
  },
  {
    id: "r2",
    name: "Educational Round #171",
    startTime: new Date(Date.now() - 86400000 * 3),
    duration: 120,
    division: "Div 2",
    participants: 12034,
    registered: true,
  },
  {
    id: "r3",
    name: "Div 1 + Div 2 Round #912",
    startTime: new Date(Date.now() - 86400000 * 7),
    duration: 150,
    division: "All",
    participants: 15234,
    registered: false,
  },
];

const virtualContests: Contest[] = [
  {
    id: "v1",
    name: "Global Round #44",
    startTime: new Date(Date.now() - 86400000 * 14),
    duration: 150,
    division: "All",
    participants: 18234,
    registered: false,
  },
  {
    id: "v2",
    name: "April Fools 2025",
    startTime: new Date(Date.now() - 86400000 * 90),
    duration: 120,
    division: "All",
    participants: 9432,
    registered: false,
  },
];

/* ─── Helpers ─── */
function formatTimeLeft(date: Date): string {
  const diff = date.getTime() - Date.now();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function formatDate(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;
  const days = Math.floor(Math.abs(diff) / 86400000);
  const hours = Math.floor((Math.abs(diff) % 86400000) / 3600000);

  if (diff > 0) {
    if (days === 0) return `in ${hours}h`;
    if (days === 1) return `tomorrow`;
    return `in ${days}d`;
  } else {
    if (days === 0) return `${hours}h ago`;
    if (days === 1) return `yesterday`;
    return `${days}d ago`;
  }
}

function getDivisionColor(division: string): string {
  if (division === "Div 1") return "text-error";
  if (division === "Div 2") return "text-warning";
  if (division === "Div 3") return "text-success";
  return "text-accent";
}

/* ─── Row 1 Panels ─── */
function ActiveContestPanel() {
  if (!activeContest) {
    return (
      <Island className="h-full">
        <div className="flex h-full items-center justify-center text-center">
          <div>
            <Trophy size={32} className="mx-auto mb-2 text-text-muted" />
            <p className="text-xs text-text-muted">No active contest</p>
          </div>
        </div>
      </Island>
    );
  }

  return (
    <Island className="h-full">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
        Active Contest
      </h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-text">{activeContest.name}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
            <Clock size={12} />
            <span className="font-mono text-warning">{formatTimeLeft(activeContest.endsAt)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-text-muted">Rank:</span>{" "}
            <span className="font-bold text-text">{activeContest.rank}</span>
          </div>
          <div>
            <span className="text-text-muted">Solved:</span>{" "}
            <span className="font-bold text-accent">
              {activeContest.solved}/{activeContest.totalProblems}
            </span>
          </div>
        </div>
        <Button variant="primary" className="w-full text-xs">
          Continue
        </Button>
      </div>
    </Island>
  );
}

function NextContestPanel() {
  return (
    <Island className="h-full">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
        Next Contest
      </h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-text">{nextContest.name}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
            <Calendar size={12} />
            <span>{formatDate(nextContest.startsAt)}</span>
            <span>·</span>
            <span>{nextContest.duration}min</span>
          </div>
        </div>
        <div className="text-xs">
          <span
            className={`font-semibold ${getDivisionColor(nextContest.division)}`}
          >
            {nextContest.division}
          </span>
        </div>
        <Button variant="primary" className="w-full text-xs">
          Register
        </Button>
      </div>
    </Island>
  );
}

function PerformancePanel() {
  return (
    <Island className="h-full">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
        Performance
      </h3>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-text-muted">Rating</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tabular-nums text-text">
              {userPerformance.currentRating}
            </span>
            <span
              className={`text-xs font-semibold ${
                userPerformance.lastChange >= 0 ? "text-success" : "text-error"
              }`}
            >
              {userPerformance.lastChange >= 0 ? "+" : ""}
              {userPerformance.lastChange}
            </span>
          </div>
        </div>
        <div className="flex items-baseline justify-between text-[11px]">
          <span className="text-text-muted">Best</span>
          <span className="font-semibold text-accent">{userPerformance.bestRating}</span>
        </div>
        <div className="flex items-baseline justify-between text-[11px]">
          <span className="text-text-muted">Avg Rank</span>
          <span className="font-semibold text-text">{userPerformance.avgRank}</span>
        </div>
        <div className="flex items-baseline justify-between text-[11px]">
          <span className="text-text-muted">Total</span>
          <span className="font-semibold text-text">{userPerformance.totalContests}</span>
        </div>
      </div>
    </Island>
  );
}

/* ─── Row 2 Panels ─── */
function ContestGroupPanel({
  title,
  icon,
  contests,
}: {
  title: string;
  icon: React.ReactNode;
  contests: Contest[];
}) {
  return (
    <Island className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-subtle text-accent">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-text">{title}</h3>
      </div>

      <div className="space-y-2">
        {contests.map((contest) => (
          <div
            key={contest.id}
            className="cursor-pointer rounded-lg border border-border bg-bg p-2.5 transition-colors hover:border-accent"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-semibold text-text">{contest.name}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-text-muted">
                  <span>{formatDate(contest.startTime)}</span>
                  <span>·</span>
                  <span>{contest.duration}min</span>
                  <span>·</span>
                  <span className={getDivisionColor(contest.division)}>
                    {contest.division}
                  </span>
                </div>
              </div>
              {contest.registered && (
                <span className="text-xs font-medium text-success">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Island>
  );
}

/* ─── Main Page ─── */
export function ContestListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");

  const allContests = [...upcomingContests, ...recentContests, ...virtualContests];

  return (
    <div className="space-y-6">
      {/* Row 1 — Live Status Panels */}
      <div className="grid grid-cols-3 gap-6">
        <ActiveContestPanel />
        <NextContestPanel />
        <PerformancePanel />
      </div>

      {/* Row 2 — Discovery Panels */}
      <div className="grid grid-cols-3 gap-6">
        <ContestGroupPanel
          title="Upcoming Contests"
          icon={<Calendar size={18} />}
          contests={upcomingContests}
        />
        <ContestGroupPanel
          title="Recent Contests"
          icon={<TrendingUp size={18} />}
          contests={recentContests}
        />
        <ContestGroupPanel
          title="Virtual Contests"
          icon={<PlayCircle size={18} />}
          contests={virtualContests}
        />
      </div>

      {/* Row 3 — Main Contest Workspace */}
      <Island>
        {/* Controls */}
        <div className="mb-4 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search contests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Division Filter */}
          <div className="flex gap-1.5">
            {["all", "Div 1", "Div 2", "Div 3"].map((div) => (
              <button
                key={div}
                onClick={() => setDivisionFilter(div)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  divisionFilter === div
                    ? "border-accent bg-accent-subtle text-accent"
                    : "border-border bg-bg text-text-muted hover:border-accent hover:text-text"
                }`}
              >
                {div === "all" ? "All" : div}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
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
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
          </div>
        </div>

        {/* Contest Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Contest</TableHead>
              <TableHead className="w-32">Start Time</TableHead>
              <TableHead className="w-24">Duration</TableHead>
              <TableHead className="w-24">Division</TableHead>
              <TableHead className="w-28">Participants</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {allContests.map((contest) => (
              <TableRow key={contest.id} className="cursor-pointer">
                <TableCell className="font-medium text-sm">{contest.name}</TableCell>
                <TableCell className="text-xs text-text-muted">
                  {formatDate(contest.startTime)}
                </TableCell>
                <TableCell className="text-xs text-text-muted">
                  {contest.duration}min
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs font-semibold ${getDivisionColor(contest.division)}`}
                  >
                    {contest.division}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-text-muted">
                  {contest.participants > 0
                    ? contest.participants.toLocaleString()
                    : "—"}
                </TableCell>
                <TableCell className="text-center">
                  {contest.registered && (
                    <span className="text-sm font-medium text-success">✓</span>
                  )}
                  {!contest.registered &&
                    contest.startTime.getTime() > Date.now() && (
                      <button className="text-xs font-medium text-accent hover:underline">
                        Register
                      </button>
                    )}
                  {!contest.registered &&
                    contest.startTime.getTime() < Date.now() && (
                      <button className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-accent">
                        <Play size={12} />
                        Virtual
                      </button>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Island>
    </div>
  );
}
