import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Island } from "@/components/ui/Island";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { apiClient, buildQueryString } from "@/lib/api-client";
import { SubmissionStatusBadge } from "../components/SubmissionStatusBadge";
import type { MySubmissionSummary, SubmissionStatus } from "@/types";

interface ListResponse {
  data: MySubmissionSummary[];
  total: number;
  page: number;
  pages: number;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "accepted", label: "Accepted" },
  { value: "wrong_answer", label: "Wrong answer" },
  { value: "time_limit_exceeded", label: "Time limit" },
  { value: "memory_limit_exceeded", label: "Memory limit" },
  { value: "runtime_error", label: "Runtime error" },
  { value: "compilation_error", label: "Compile error" },
  { value: "partial", label: "Partial" },
  { value: "pending_review", label: "Pending review" },
];

function formatDate(s: string): string {
  return new Date(s).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MySubmissionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));
  const [status, setStatus] = useState<SubmissionStatus | "">(
    (searchParams.get("status") as SubmissionStatus) ?? "",
  );
  const [problemSlug, setProblemSlug] = useState(searchParams.get("problem_slug") ?? "");
  const contestId = searchParams.get("contest_id") ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["my-submissions", page, status, problemSlug, contestId],
    queryFn: () =>
      apiClient.get<ListResponse>(
        `/submissions/mine${buildQueryString({
          page,
          status,
          problem_slug: problemSlug,
          contest_id: contestId,
        })}`,
      ),
  });

  const submissions = data?.data ?? [];

  const updateFilters = (next: {
    page?: number;
    status?: string;
    problem_slug?: string;
  }) => {
    const merged = {
      page: String(next.page ?? 1),
      status: next.status ?? status,
      problem_slug: next.problem_slug ?? problemSlug,
      contest_id: contestId,
    };
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(merged)) if (v) clean[k] = v;
    setSearchParams(clean);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">My submissions</h1>
        <p className="text-sm text-text-muted">
          Every solution you've submitted, in or out of a contest.
        </p>
      </div>

      <Island>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={problemSlug}
              onChange={(e) => setProblemSlug(e.target.value)}
              onBlur={() => {
                setPage(1);
                updateFilters({ page: 1, problem_slug: problemSlug });
              }}
              placeholder="Filter by problem slug..."
              className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder-text-muted outline-none focus:border-accent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as SubmissionStatus | "");
              setPage(1);
              updateFilters({ page: 1, status: e.target.value });
            }}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">#</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead className="w-40">Contest</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-24">Score</TableHead>
              <TableHead className="w-48">Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <Loader2 size={20} className="inline animate-spin text-accent" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && submissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-text-muted">
                  No submissions yet.
                </TableCell>
              </TableRow>
            )}
            {submissions.map((s) => {
              const score =
                s.manual_score != null
                  ? `${s.manual_score}`
                  : s.total_count > 0
                  ? `${s.passed_count}/${s.total_count}`
                  : "—";
              return (
                <TableRow
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/submissions/${s.id}`)}
                >
                  <TableCell className="font-mono text-xs text-text-muted">#{s.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text">{s.problem_title}</span>
                      {s.problem_type === "subjective" && (
                        <span className="rounded-full border border-accent/30 bg-accent-subtle px-2 py-0.5 text-[10px] font-medium text-accent">
                          Subjective
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-muted">{s.problem_slug}</span>
                  </TableCell>
                  <TableCell className="text-xs text-text-muted">
                    {s.contest_title || (s.contest_id ? `Contest #${s.contest_id}` : "—")}
                  </TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-xs text-text">{score}</TableCell>
                  <TableCell className="text-xs text-text-muted">
                    {formatDate(s.submitted_at)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {data && data.pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
            <span>
              Page {data.page} of {data.pages} · {data.total} total
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const p = Math.max(1, page - 1);
                  setPage(p);
                  updateFilters({ page: p });
                }}
                disabled={data.page <= 1}
                className="flex items-center gap-1 rounded-md border border-border bg-bg px-2 py-1 transition-colors hover:border-accent disabled:opacity-40"
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <button
                onClick={() => {
                  const p = Math.min(data.pages, page + 1);
                  setPage(p);
                  updateFilters({ page: p });
                }}
                disabled={data.page >= data.pages}
                className="flex items-center gap-1 rounded-md border border-border bg-bg px-2 py-1 transition-colors hover:border-accent disabled:opacity-40"
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </Island>
    </div>
  );
}
