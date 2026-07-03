import { useState, useEffect, useRef } from "react";

type TimerStatus = "idle" | "running" | "paused" | "done";

const STORAGE_KEY_STATUS = "timer_status";
const STORAGE_KEY_REMAINING = "timer_remaining";
const STORAGE_KEY_DEADLINE = "timer_deadline";

function loadState(): { status: TimerStatus; remaining: number } {
  const status = localStorage.getItem(STORAGE_KEY_STATUS) as TimerStatus | null;
  if (!status || status === "idle") return { status: "idle", remaining: 0 };

  const remaining = Number(localStorage.getItem(STORAGE_KEY_REMAINING) ?? 0);
  const deadline = Number(localStorage.getItem(STORAGE_KEY_DEADLINE) ?? 0);

  if (status === "running") {
    // Recalculate remaining based on real elapsed time
    const recalculated = Math.max(0, Math.round((deadline - Date.now()) / 1000));
    if (recalculated <= 0) return { status: "done", remaining: 0 };
    return { status: "running", remaining: recalculated };
  }

  return { status, remaining };
}

function saveState(status: TimerStatus, remaining: number, deadline: number) {
  if (status === "idle") {
    localStorage.removeItem(STORAGE_KEY_STATUS);
    localStorage.removeItem(STORAGE_KEY_REMAINING);
    localStorage.removeItem(STORAGE_KEY_DEADLINE);
    return;
  }
  localStorage.setItem(STORAGE_KEY_STATUS, status);
  localStorage.setItem(STORAGE_KEY_REMAINING, String(remaining));
  localStorage.setItem(STORAGE_KEY_DEADLINE, String(deadline));
}

export default function Timer() {
  const [minutes, setMinutes] = useState<number>(5);
  const [remaining, setRemaining] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Deadline stored in a ref so the interval can always read the latest value
  const deadlineRef = useRef<number>(0);

  // Request notification permission and restore state on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const saved = loadState();
    if (saved.status !== "idle") {
      setStatus(saved.status);
      setRemaining(saved.remaining);
      if (saved.status === "running") {
        deadlineRef.current = Date.now() + saved.remaining * 1000;
      }
    }
  }, []);

  // Countdown tick
  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        const left = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
        if (left <= 0) {
          clearInterval(intervalRef.current!);
          setStatus("done");
          setRemaining(0);
          saveState("done", 0, 0);
          sendNotification();
        } else {
          setRemaining(left);
        }
      }, 500); // 500ms poll for better accuracy
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  function sendNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("时间到！", { body: "你设定的计时已完成" });
    }
  }

  function handleStart() {
    if (minutes <= 0) return;
    const secs = minutes * 60;
    const deadline = Date.now() + secs * 1000;
    deadlineRef.current = deadline;
    setRemaining(secs);
    setStatus("running");
    saveState("running", secs, deadline);
  }

  function handlePause() {
    setStatus("paused");
    saveState("paused", remaining, deadlineRef.current);
  }

  function handleResume() {
    const deadline = Date.now() + remaining * 1000;
    deadlineRef.current = deadline;
    setStatus("running");
    saveState("running", remaining, deadline);
  }

  function handleReset() {
    setStatus("idle");
    setRemaining(0);
    saveState("idle", 0, 0);
  }

  // Format seconds to MM:SS
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  const isIdle = status === "idle";

  return (
    <div className="timer">
      <h2 className="timer-title">⏱ Timer</h2>

      {/* Fixed-height body — both rows always rendered, toggled via visibility */}
      <div className="timer-body">

        {/* Input row */}
        <div className={`timer-input-row${isIdle ? "" : " timer-hidden"}`}>
          <input
            className="timer-input"
            type="number"
            min={1}
            max={999}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            tabIndex={isIdle ? 0 : -1}
          />
          <span className="timer-input-label">分钟</span>
          <button
            className="timer-btn-primary"
            onClick={handleStart}
            tabIndex={isIdle ? 0 : -1}
          >
            开始
          </button>
        </div>

        {/* Countdown display */}
        <div className={`timer-display${isIdle ? " timer-hidden" : ""}`}>
          <span className={`timer-countdown${status === "done" ? " done" : ""}`}>
            {status === "done" ? "完成！" : formatTime(remaining)}
          </span>
          <div className="timer-controls">
            {/* Pause / Resume — same slot, swap visibility */}
            <button
              className={`timer-btn-secondary${status !== "running" ? " timer-hidden" : ""}`}
              onClick={handlePause}
              tabIndex={status === "running" ? 0 : -1}
            >
              暂停
            </button>
            <button
              className={`timer-btn-primary${status !== "paused" ? " timer-hidden" : ""}`}
              onClick={handleResume}
              tabIndex={status === "paused" ? 0 : -1}
            >
              继续
            </button>
            <button className="timer-btn-ghost" onClick={handleReset}>
              重置
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
