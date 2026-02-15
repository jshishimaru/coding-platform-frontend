import { Island } from "@/components/ui/Island";
import { User } from "lucide-react";

/* ─── Mock Data ─── */
const user = {
  username: "madhav_d",
  rankTier: "Expert",
  rating: 1847,
  avatarUrl: null as string | null,
};

export function UserInfoPanel() {
  return (
    <Island className="flex flex-col">
      {/* ── Hero block ── */}
      <div className="h-40 w-full flex-shrink-0 overflow-hidden rounded-lg border border-border bg-bg">
        <div className="flex h-full w-full items-center justify-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <User size={48} strokeWidth={1.5} className="text-text-muted" />
          )}
        </div>
      </div>

      {/* ── Info strip — compact, secondary ── */}
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold leading-tight text-text">{user.username}</p>
          <p className="text-[11px] text-text-muted">{user.rankTier}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold leading-tight tabular-nums text-text">
            {user.rating.toLocaleString()}
          </p>
          <p className="text-[10px] text-text-muted">rating</p>
        </div>
      </div>
    </Island>
  );
}
