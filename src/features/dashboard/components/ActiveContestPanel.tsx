import { Island } from "@/components/ui/Island";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

/* ─── Mock Data ─── */
const contest = {
  name: "Weekly Contest #128",
  status: "live" as const,
  endsAt: Date.now() + 2 * 60 * 60 * 1000 + 14 * 60 * 1000, // ~2h 14m from now
  currentRank: 58,
};

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(target - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining <= 0) return "00:00:00";

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const statusColors: Record<string, string> = {
  live: "text-success",
  upcoming: "text-warning",
  ended: "text-text-muted",
};

export function ActiveContestPanel() {
  const countdown = useCountdown(contest.endsAt);

  return (
    <Island className="h-full">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Upcoming Contest</h3>
        <span
          className={`text-xs font-medium uppercase tracking-wide ${statusColors[contest.status]}`}
        >
          {contest.status}
        </span>
      </div>

      <p className="mb-0.5 text-sm font-medium text-text">{contest.name}</p>

      <p className="mb-3 font-mono text-xl font-semibold tabular-nums text-text">
        {countdown}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          Rank: <span className="font-medium text-text">#{contest.currentRank}</span>
        </span>
        <Button size="sm">Continue</Button>
      </div>
    </Island>
  );
}
