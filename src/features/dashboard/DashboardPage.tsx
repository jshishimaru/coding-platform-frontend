import { WelcomePanel } from "./components/UserSummaryPanel";
import { ActiveContestPanel } from "./components/ActiveContestPanel";
import { RecommendedProblemsPanel } from "./components/RecommendedProblemsPanel";
import { UserInfoPanel } from "./components/QuickStatsPanel";

/**
 * Dashboard — compressed floating island grid.
 * 12-col, 20px gap, asymmetric 2-row layout.
 */
export function DashboardPage() {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "24px",
      }}
    >
      {/* Row 1 — Welcome + Upcoming Contest */}
      <div className="col-span-7">
        <WelcomePanel />
      </div>
      <div className="col-span-5">
        <ActiveContestPanel />
      </div>

      {/* Row 2 — Recommended Problems + User Info */}
      <div className="col-span-8">
        <RecommendedProblemsPanel />
      </div>
      <div className="col-span-4">
        <UserInfoPanel />
      </div>
    </div>
  );
}
