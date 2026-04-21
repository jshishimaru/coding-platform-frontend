import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Island } from "@/components/ui/Island";
import { Button } from "@/components/ui/Button";
import { apiClient, buildQueryString } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/store";
import { SubmissionStatusBadge } from "@/features/submissions/components/SubmissionStatusBadge";
import type { Group, GroupJoinRequest, MySubmissionSummary } from "@/types";
import {
  ArrowRight,
  Clock3,
  ClipboardCheck,
  FileText,
  Loader2,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

interface Contest {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_rated: boolean;
  status: "upcoming" | "live" | "ended";
  participants: number;
  problem_count: number;
  group_id?: number | null;
  group_name?: string;
}

interface SubmissionListResponse {
  data: MySubmissionSummary[];
  total: number;
  page: number;
  pages: number;
}

function formatTimeUntil(target: string): string {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return "now";
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSubmissionScore(submission: MySubmissionSummary): string {
  if (submission.manual_score != null) return `${submission.manual_score}`;
  if (submission.total_count > 0) return `${submission.passed_count}/${submission.total_count}`;
  return "—";
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const contestsQuery = useQuery({
    queryKey: ["dashboard", "contests"],
    queryFn: () => apiClient.get<{ contests: Contest[] }>("/contests"),
  });

  const questionsQuery = useQuery({
    queryKey: ["dashboard", "questions"],
    queryFn: () => apiClient.get<{ questions: { id: number }[] }>("/questions"),
  });

  const submissionsQuery = useQuery({
    queryKey: ["dashboard", "recent-submissions"],
    queryFn: async () => {
      const pages = await Promise.all(
        [1, 2, 3, 4].map((page) =>
          apiClient
            .get<SubmissionListResponse>(`/submissions/mine${buildQueryString({ page })}`)
            .catch(() => ({ data: [], total: 0, page, pages: 0 })),
        ),
      );

      const seen = new Set<number>();
      const merged = pages
        .flatMap((page) => page.data)
        .filter((submission) => {
          if (seen.has(submission.id)) return false;
          seen.add(submission.id);
          return true;
        });

      return {
        data: merged,
        total: pages[0]?.total ?? merged.length,
        page: 1,
        pages: pages[0]?.pages ?? 1,
      };
    },
  });

  const groupsQuery = useQuery({
    queryKey: ["dashboard", "groups"],
    queryFn: () =>
      apiClient.get<{ groups: Group[] }>(
        `/groups${buildQueryString({ member: "me" })}`,
      ),
  });

  const joinRequestsQuery = useQuery({
    queryKey: ["dashboard", "group-requests"],
    queryFn: () => apiClient.get<{ requests: GroupJoinRequest[] }>("/groups/my-requests"),
  });

  const isInitialLoading =
    contestsQuery.isLoading &&
    questionsQuery.isLoading &&
    submissionsQuery.isLoading &&
    groupsQuery.isLoading;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  const contests = contestsQuery.data?.contests ?? [];
  const questions = questionsQuery.data?.questions ?? [];
  const submissions = submissionsQuery.data?.data ?? [];
  const groups = groupsQuery.data?.groups ?? [];
  const joinRequests = joinRequestsQuery.data?.requests ?? [];

  const liveContests = contests.filter((contest) => contest.status === "live");
  const upcomingContests = contests
    .filter((contest) => contest.status === "upcoming")
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const nextContest = upcomingContests[0] ?? null;
  const pendingReviewCount = submissions.filter((submission) => submission.status === "pending_review").length;
  const activeJoinRequests = joinRequests.filter((request) => request.status === "pending").length;
  const latestSubmission = submissions[0] ?? null;

  const focusDescription = liveContests[0]
    ? `There ${liveContests.length === 1 ? "is" : "are"} ${liveContests.length} live contest${liveContests.length === 1 ? "" : "s"} right now.`
    : nextContest
    ? `Your next visible contest starts in ${formatTimeUntil(nextContest.start_time)}.`
    : latestSubmission
    ? `Your latest submission was on ${latestSubmission.problem_title}.`
    : "Check contests, submissions, and groups from one place.";

  return (
    <div className="grid grid-cols-12 gap-4 lg:h-[calc(100vh-124px)] lg:grid-rows-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:overflow-hidden">
      <div className="col-span-12 lg:col-span-8 lg:row-start-1">
          <Island className="h-full overflow-hidden p-0">
            <div className="flex h-full flex-col bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_22%,transparent)_0%,transparent_58%)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-subtle px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                    <Sparkles size={12} />
                    Dashboard
                  </div>
                  <h1 className="text-2xl font-bold leading-tight text-text xl:text-[1.75rem]">
                    {user ? `Welcome, ${user.username}` : "Welcome"}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-5 text-text-muted">
                    {focusDescription}
                  </p>
                </div>

                <div className="grid min-w-[220px] grid-cols-2 gap-2">
                  <MetricCard
                    label="Rating"
                    value={user?.rating != null ? `${user.rating}` : "—"}
                    icon={<Zap size={15} />}
                  />
                  <MetricCard
                    label="My groups"
                    value={`${groups.length}`}
                    icon={<Users size={15} />}
                  />
                  <MetricCard
                    label="Live contests"
                    value={`${liveContests.length}`}
                    icon={<Trophy size={15} />}
                  />
                  <MetricCard
                    label="Problems"
                    value={`${questions.length}`}
                    icon={<FileText size={15} />}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-1 flex-wrap content-end gap-2">
                {liveContests[0] ? (
                  <Button
                    onClick={() => navigate(`/contests/${liveContests[0].id}`)}
                    size="sm"
                    className="gap-2"
                  >
                    Open live contest <ArrowRight size={14} />
                  </Button>
                ) : nextContest ? (
                  <Button
                    onClick={() => navigate(`/contests/${nextContest.id}`)}
                    size="sm"
                    className="gap-2"
                  >
                    View next contest <ArrowRight size={14} />
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/questions")} size="sm" className="gap-2">
                    Browse problems <ArrowRight size={14} />
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => navigate("/submissions")} className="gap-2">
                  <ClipboardCheck size={14} /> My submissions
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/groups")} className="gap-2">
                  <Users size={14} /> My groups
                </Button>
              </div>
            </div>
          </Island>
      </div>

      <div className="col-span-12 lg:col-span-4 lg:row-start-1">
          <Island className="flex h-full flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Right now</h2>
              <span className="text-xs text-text-muted">Useful signals</span>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <ActionRow
                label="Live contests"
                value={
                  liveContests[0]
                    ? `${liveContests.length} active`
                    : "None active"
                }
                hint={
                  liveContests[0]
                    ? `${formatTimeUntil(liveContests[0].end_time)} left in ${liveContests[0].title}`
                    : "Nothing to join right now"
                }
                onClick={() => navigate(liveContests[0] ? `/contests/${liveContests[0].id}` : "/contests")}
              />
              <ActionRow
                label="Next contest"
                value={nextContest ? formatTimeUntil(nextContest.start_time) : "No upcoming contest"}
                hint={
                  nextContest
                    ? `${nextContest.title} · ${formatDateTime(nextContest.start_time)}`
                    : "Check back later"
                }
                onClick={() => navigate(nextContest ? `/contests/${nextContest.id}` : "/contests")}
              />
              <ActionRow
                label="Recent review queue"
                value={pendingReviewCount > 0 ? `${pendingReviewCount} awaiting review` : "All caught up"}
                hint={
                  latestSubmission
                    ? `${latestSubmission.problem_title} · ${formatDateTime(latestSubmission.submitted_at)}`
                    : "No recent submissions yet"
                }
                onClick={() => navigate("/submissions")}
              />
              <ActionRow
                label="Group activity"
                value={
                  activeJoinRequests > 0
                    ? `${activeJoinRequests} request${activeJoinRequests === 1 ? "" : "s"} pending`
                    : `${groups.length} joined`
                }
                hint={
                  groups[0]
                    ? `Latest group: ${groups[0].name}`
                    : "Join a group for private contests"
                }
                onClick={() => navigate("/groups")}
              />
            </div>
          </Island>
      </div>

      <div className="col-span-12 lg:col-span-8 lg:row-start-2 lg:min-h-0">
          <Island className="flex h-full min-h-0 flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text">Recent submissions</h2>
                <p className="text-xs text-text-muted">What you worked on most recently</p>
              </div>
              <button
                onClick={() => navigate("/submissions")}
                className="text-xs font-medium text-accent hover:underline"
              >
                View all
              </button>
            </div>

            {submissions.length === 0 ? (
              <EmptyState
                title="No submissions yet"
                description="Your recent work will show up here once you start solving problems."
                actionLabel="Solve a problem"
                onAction={() => navigate("/questions")}
              />
            ) : (
              <div className="grid flex-1 auto-rows-fr gap-2 overflow-hidden">
                {submissions.slice(0, 4).map((submission) => (
                  <button
                    key={submission.id}
                    onClick={() => navigate(`/submissions/${submission.id}`)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-2.5 text-left transition-colors hover:border-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-text">
                          {submission.problem_title}
                        </span>
                        {submission.problem_type === "subjective" && (
                          <span className="rounded-full border border-accent/30 bg-accent-subtle px-2 py-0.5 text-[10px] font-medium text-accent">
                            Subjective
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                        <span>{submission.problem_slug}</span>
                        {submission.contest_title && (
                          <>
                            <span>·</span>
                            <span className="truncate">{submission.contest_title}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{formatDateTime(submission.submitted_at)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs font-medium text-text">
                        {formatSubmissionScore(submission)}
                      </span>
                      <SubmissionStatusBadge status={submission.status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Island>
      </div>

      <div className="col-span-12 lg:col-span-4 lg:row-start-2 lg:min-h-0">
          <Island className="flex h-full min-h-0 flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text">Groups</h2>
                <p className="text-xs text-text-muted">Your classrooms and private contest spaces</p>
              </div>
              <button
                onClick={() => navigate("/groups")}
                className="text-xs font-medium text-accent hover:underline"
              >
                Browse
              </button>
            </div>

            {groups.length === 0 ? (
              <EmptyState
                title="No groups joined"
                description={
                  activeJoinRequests > 0
                    ? `${activeJoinRequests} join request${activeJoinRequests === 1 ? "" : "s"} pending review.`
                    : "Join a group to access class contests, assignments, and private leaderboards."
                }
                actionLabel="Explore groups"
                onAction={() => navigate("/groups")}
              />
            ) : (
              <div className="grid flex-1 auto-rows-fr gap-2 overflow-hidden">
                {groups.slice(0, 3).map((group) => (
                  <button
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-2.5 text-left transition-colors hover:border-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-text">{group.name}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-text-muted">
                        {group.description || "No description"}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {group.my_role && (
                        <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">
                          {group.my_role}
                        </span>
                      )}
                      <div className="mt-2 text-[11px] text-text-muted">
                        {group.member_count ?? 0} members
                      </div>
                    </div>
                  </button>
                ))}
                {activeJoinRequests > 0 && (
                  <div className="rounded-xl border border-warning/25 bg-warning/10 px-4 py-3 text-xs text-warning">
                    {activeJoinRequests} join request{activeJoinRequests === 1 ? "" : "s"} still pending.
                  </div>
                )}
              </div>
            )}
          </Island>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg/80 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 text-[10px] uppercase tracking-wide leading-4 text-text-muted">
          {label}
        </span>
        <span className="shrink-0 text-accent">{icon}</span>
      </div>
      <div className="mt-1 text-lg font-bold tabular-nums text-text">{value}</div>
    </div>
  );
}

function ActionRow({
  label,
  value,
  hint,
  onClick,
}: {
  label: string;
  value: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-2.5 text-left transition-colors hover:border-accent"
    >
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wide text-text-muted">{label}</div>
        <div className="mt-1 text-sm font-medium text-text">{value}</div>
        <div className="mt-1 truncate text-xs text-text-muted">{hint}</div>
      </div>
      <ArrowRight size={14} className="shrink-0 text-text-muted" />
    </button>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-bg px-4 py-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-subtle text-accent">
        <Clock3 size={16} />
      </div>
      <h3 className="mt-2.5 text-sm font-semibold text-text">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">{description}</p>
      <Button onClick={onAction} variant="secondary" size="sm" className="mt-3">
        {actionLabel}
      </Button>
    </div>
  );
}
