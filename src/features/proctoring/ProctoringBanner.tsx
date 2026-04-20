import { Eye, Maximize2, Minimize2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ProctorEventType } from "./useProctoring";

interface Props {
  isFullscreen: boolean;
  eventCount: number;
  lastEvent: { type: ProctorEventType; at: string } | null;
  onEnterFullscreen: () => void;
  onExitFullscreen: () => void;
}

const EVENT_LABELS: Record<ProctorEventType, string> = {
  session_start: "session started",
  fs_enter: "entered fullscreen",
  fs_exit: "exited fullscreen",
  tab_visibility: "tab switch",
  window_blur: "window lost focus",
  window_focus: "window refocused",
  right_click: "right-click",
  devtools: "devtools opened",
  paste: "paste",
  copy: "copy",
  unload: "page unload",
};

export function ProctoringBanner({
  isFullscreen,
  eventCount,
  lastEvent,
  onEnterFullscreen,
  onExitFullscreen,
}: Props) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-xs ${
        isFullscreen
          ? "border-warning/30 bg-warning/5 text-warning"
          : "border-danger/40 bg-danger/10 text-danger"
      }`}
    >
      <div className="flex items-center gap-2">
        {isFullscreen ? <Eye size={14} /> : <AlertTriangle size={14} />}
        <span className="font-semibold">Proctored contest</span>
        <span className="text-text-muted">·</span>
        {isFullscreen ? (
          <span className="text-text-muted">
            Your session is being monitored. Stay in fullscreen and avoid switching tabs.
          </span>
        ) : (
          <span>You are not in fullscreen. Return to fullscreen to avoid flags.</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {lastEvent && (
          <span className="text-text-muted">
            Last: <span className="font-medium text-text">{EVENT_LABELS[lastEvent.type]}</span>{" "}
            · {eventCount} logged
          </span>
        )}
        {isFullscreen ? (
          <Button
            variant="ghost"
            onClick={onExitFullscreen}
            className="flex items-center gap-1.5 text-xs"
          >
            <Minimize2 size={12} /> Exit
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onEnterFullscreen}
            className="flex items-center gap-1.5 text-xs"
          >
            <Maximize2 size={12} /> Enter fullscreen
          </Button>
        )}
      </div>
    </div>
  );
}
