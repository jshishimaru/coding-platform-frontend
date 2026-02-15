import { Island } from "@/components/ui/Island";
import { Code2, Zap, Target, Trophy } from "lucide-react";

export function WelcomePanel() {
  return (
    <Island className="h-full flex flex-col justify-between">
      {/* ── Top: icon + welcome text ── */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-subtle">
          <Code2 size={30} className="text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold leading-snug text-text">
            Welcome to ByteCode
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Solve problems, compete in contests, and level up your skills.
          </p>
        </div>
      </div>

      {/* ── Bottom: stat chips ── */}
      <div className="flex gap-3">
        <Chip icon={<Zap size={13} />} label="12 day streak" />
        <Chip icon={<Target size={13} />} label="3 solved today" />
        <Chip icon={<Trophy size={13} />} label="Contest #128 live" />
      </div>
    </Island>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-bg px-2.5 py-1.5 text-[11px] font-medium text-text-muted">
      <span className="text-accent">{icon}</span>
      {label}
    </div>
  );
}
