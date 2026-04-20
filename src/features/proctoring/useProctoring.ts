import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";

/**
 * useProctoring — client-side monitoring for proctored contests.
 *
 * This is a monitoring (not enforcement) implementation:
 *  - We request fullscreen on user gesture and listen for exits.
 *  - We listen for visibility change, blur, context menu, and devtools heuristics.
 *  - Every event is POSTed to /contests/:id/proctor-events for later admin review.
 *
 * The caller is expected to gate `enabled` on `contest.proctored && status === "live"`.
 */

export type ProctorEventType =
  | "fs_enter"
  | "fs_exit"
  | "tab_visibility"
  | "window_blur"
  | "window_focus"
  | "right_click"
  | "devtools"
  | "paste"
  | "copy"
  | "unload"
  | "session_start";

interface UseProctoringOptions {
  contestId: number | string | undefined;
  enabled: boolean;
}

interface UseProctoringResult {
  isFullscreen: boolean;
  lastEvent: { type: ProctorEventType; at: string } | null;
  eventCount: number;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
}

export function useProctoring({ contestId, enabled }: UseProctoringOptions): UseProctoringResult {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );
  const [lastEvent, setLastEvent] = useState<{ type: ProctorEventType; at: string } | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const sessionStartedRef = useRef(false);

  const sendEvent = useCallback(
    async (type: ProctorEventType, details?: Record<string, unknown>) => {
      if (!enabled || !contestId) return;
      setLastEvent({ type, at: new Date().toISOString() });
      setEventCount((c) => c + 1);
      try {
        await apiClient.post(`/contests/${contestId}/proctor-events`, {
          event_type: type,
          details: details ?? {},
        });
      } catch {
        // Swallow — this is best-effort monitoring.
      }
    },
    [contestId, enabled],
  );

  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // ignore
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!enabled || !contestId) return;

    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true;
      void sendEvent("session_start", { user_agent: navigator.userAgent });
    }

    const onFullscreenChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);
      void sendEvent(inFs ? "fs_enter" : "fs_exit");
    };

    const onVisibility = () => {
      void sendEvent("tab_visibility", { state: document.visibilityState });
    };

    const onBlur = () => {
      void sendEvent("window_blur");
    };

    const onFocus = () => {
      void sendEvent("window_focus");
    };

    const onContext = (e: MouseEvent) => {
      void sendEvent("right_click", { x: e.clientX, y: e.clientY });
    };

    const onBeforeUnload = () => {
      void sendEvent("unload");
    };

    // DevTools heuristic: detect suspicious window size delta between inner and outer.
    let devtoolsFlagged = false;
    const checkDevtools = () => {
      const thresholdW = window.outerWidth - window.innerWidth > 160;
      const thresholdH = window.outerHeight - window.innerHeight > 160;
      const open = thresholdW || thresholdH;
      if (open && !devtoolsFlagged) {
        devtoolsFlagged = true;
        void sendEvent("devtools", {
          inner_w: window.innerWidth,
          inner_h: window.innerHeight,
          outer_w: window.outerWidth,
          outer_h: window.outerHeight,
        });
      } else if (!open && devtoolsFlagged) {
        devtoolsFlagged = false;
      }
    };
    const devtoolsTimer = window.setInterval(checkDevtools, 2000);

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("contextmenu", onContext);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("contextmenu", onContext);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.clearInterval(devtoolsTimer);
    };
  }, [contestId, enabled, sendEvent]);

  return { isFullscreen, lastEvent, eventCount, requestFullscreen, exitFullscreen };
}
