import type { SubmissionStatus } from "@/types";

const STATUS_STYLES: Record<SubmissionStatus, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "border-zinc-400/30 bg-zinc-400/10 text-zinc-400" },
  pending_review: { label: "Awaiting review", classes: "border-accent/40 bg-accent-subtle text-accent" },
  judging: { label: "Judging", classes: "border-blue-400/30 bg-blue-400/10 text-blue-400" },
  accepted: { label: "Accepted", classes: "border-green-400/40 bg-green-400/10 text-green-400" },
  rejected: { label: "Rejected", classes: "border-red-400/40 bg-red-400/10 text-red-400" },
  wrong_answer: { label: "WA", classes: "border-red-400/40 bg-red-400/10 text-red-400" },
  time_limit_exceeded: { label: "TLE", classes: "border-yellow-400/40 bg-yellow-400/10 text-yellow-400" },
  memory_limit_exceeded: { label: "MLE", classes: "border-yellow-400/40 bg-yellow-400/10 text-yellow-400" },
  runtime_error: { label: "RE", classes: "border-orange-400/40 bg-orange-400/10 text-orange-400" },
  compilation_error: { label: "CE", classes: "border-orange-400/40 bg-orange-400/10 text-orange-400" },
  partial: { label: "Partial", classes: "border-amber-400/40 bg-amber-400/10 text-amber-400" },
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const cfg = STATUS_STYLES[status] ?? {
    label: status,
    classes: "border-border bg-bg-secondary text-text-muted",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}
