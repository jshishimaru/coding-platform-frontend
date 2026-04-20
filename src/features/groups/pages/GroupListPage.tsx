import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient, buildQueryString } from "@/lib/api-client";
import { Island } from "@/components/ui/Island";
import { Search, Users, UserPlus } from "lucide-react";
import type { Group } from "@/types";

export function GroupListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "mine">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["groups", search, tab],
    queryFn: () =>
      apiClient.get<{ groups: Group[] }>(
        `/groups${buildQueryString({ search, member: tab === "mine" ? "me" : undefined })}`,
      ),
  });

  const groups = data?.groups ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Groups</h1>
          <p className="text-sm text-text-muted">
            Classroom-style groups for assignments and private contests.
          </p>
        </div>
      </div>

      <Island>
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groups..."
              className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "mine"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  tab === t
                    ? "border-accent bg-accent-subtle text-accent"
                    : "border-border bg-bg text-text-muted hover:border-accent hover:text-text"
                }`}
              >
                {t === "all" ? "All groups" : "My groups"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-sm text-text-muted">Loading groups...</p>
        ) : groups.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={28} className="mx-auto mb-2 text-text-muted" />
            <p className="text-sm text-text-muted">
              {tab === "mine" ? "You haven't joined any groups yet." : "No groups found."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                className="cursor-pointer rounded-lg border border-border bg-bg p-4 text-left transition-colors hover:border-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-text line-clamp-1">{g.name}</h3>
                  {g.my_role && (
                    <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-[10px] font-medium uppercase text-accent">
                      {g.my_role}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-text-muted line-clamp-2">
                  {g.description || "No description"}
                </p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} />
                    {g.member_count ?? 0} members
                  </span>
                  {!g.is_member && (
                    <span className="inline-flex items-center gap-1 text-accent">
                      <UserPlus size={12} /> Join
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </Island>
    </div>
  );
}
