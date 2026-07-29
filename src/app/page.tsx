"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Plus, Clock, FileText, CheckCircle, ChevronRight, Zap, Award } from "lucide-react";
import AuraHeader from "@/components/AuraHeader";
import CalendarGrid from "@/components/CalendarGrid";

interface Topic {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  status: string;
  topics: Topic[];
}

interface Log {
  id: string;
  durationMins: number;
  notes: string | null;
  loggedAt: string;
  learningPath: {
    title: string;
  };
  topic?: {
    title: string;
  } | null;
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastLoggedAt: string | null;
}

export default function Dashboard() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Log form states
  const [selectedPathId, setSelectedPathId] = useState("");
  const [duration, setDuration] = useState("30");
  const [notes, setNotes] = useState("");
  const [submittingLog, setSubmittingLog] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    try {
      const [streakRes, pathsRes, logsRes] = await Promise.all([
        fetch("/api/streak"),
        fetch("/api/paths"),
        fetch("/api/logs"),
      ]);

      const streakData = await streakRes.json();
      const pathsData = await pathsRes.json();
      const logsData = await logsRes.json();

      setStreak(streakData);
      setPaths(pathsData);
      setLogs(logsData); // FULL logs data for calendar

      // Default selected path
      if (pathsData.length > 0) {
        setSelectedPathId(pathsData[0].id);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPathId || !duration) return;

    setSubmittingLog(true);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningPathId: selectedPathId,
          durationMins: parseInt(duration),
          notes,
        }),
      });

      if (res.ok) {
        setNotes("");
        setSuccessMsg("Session logged successfully! Streak updated.");
        setTimeout(() => setSuccessMsg(""), 3000);
        await fetchData(); // Refresh data
      }
    } catch (error) {
      console.error("Error submitting log:", error);
    } finally {
      setSubmittingLog(false);
    }
  };

  const calculateProgress = (path: LearningPath) => {
    if (path.topics.length === 0) return 0;
    const completed = path.topics.filter((t) => t.isCompleted).length;
    return Math.round((completed / path.topics.length) * 100);
  };

  const hasStudiedToday = () => {
    if (!streak?.lastLoggedAt) return false;
    const lastLogged = new Date(streak.lastLoggedAt);
    const today = new Date();
    return (
      lastLogged.getFullYear() === today.getFullYear() &&
      lastLogged.getMonth() === today.getMonth() &&
      lastLogged.getDate() === today.getDate()
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3"></div>
        <div className="h-40 bg-gray-800 rounded-3xl"></div>
        <div className="h-48 bg-gray-800 rounded-3xl"></div>
        <div className="h-40 bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-5 space-y-6">
      <AuraHeader title="Dashboard" />

      {/* Streak Dashboard Card */}
      <section className="animate-slide-up">
        <div className="relative overflow-hidden rounded-3xl p-6 border border-orange-500/10 shadow-[0_8px_32px_rgba(249,115,22,0.15)] gradient-streak">
          {/* Decorative background shapes */}
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute left-1/3 top-0 -translate-y-1/2 w-20 h-20 rounded-full bg-orange-600/30 blur-lg"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1 text-white">
              <span className="text-xs font-medium text-orange-200 tracking-wider uppercase">
                Daily Study Streak
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter">
                  {streak?.currentStreak || 0}
                </span>
                <span className="text-lg font-bold text-orange-200">days</span>
              </div>
              <p className="text-xs text-orange-100 pt-1">
                {hasStudiedToday()
                  ? "Daily target completed! Keep it up tomorrow."
                  : "Log a study session today to keep your streak alive!"}
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 animate-pulse-glow">
              <Flame
                size={40}
                className="text-white fill-white/10"
                strokeWidth={2}
              />
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex justify-between text-xs text-orange-100 font-medium">
            <div className="flex items-center gap-1.5">
              <Award size={14} />
              <span>Personal Best: {streak?.longestStreak || 0} Days</span>
            </div>
            <span>
              Last logged:{" "}
              {streak?.lastLoggedAt
                ? new Date(streak.lastLoggedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "Never"}
            </span>
          </div>
        </div>
      </section>

      {/* Quick Log Form */}
      <section className="animate-slide-up [animation-delay:100ms]">
        <div className="glass-panel rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-blue-500" />
              <span>Log Study Session</span>
            </h2>
            {successMsg && (
              <span className="text-xs font-medium text-green-400 animate-fade-in">
                {successMsg}
              </span>
            )}
          </div>

          {paths.length === 0 ? (
            <div className="p-4 text-center rounded-2xl bg-gray-900/40 border border-gray-800/80">
              <p className="text-sm text-gray-400 mb-3">
                Create a learning path before you can log your study session.
              </p>
              <Link
                href="/paths"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors"
              >
                <Plus size={14} />
                <span>Create Learning Path</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleLogSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Learning Path
                </label>
                <select
                  value={selectedPathId}
                  onChange={(e) => setSelectedPathId(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {paths.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Mins
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-[#111827] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    What did you learn?
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Read about server components"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingLog}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                {submittingLog ? "Saving..." : "Log Session"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Study History Calendar Grid */}
      <section className="animate-slide-up [animation-delay:150ms]">
        <CalendarGrid logs={logs} />
      </section>

      {/* Learning Paths Progress */}
      <section className="animate-slide-up [animation-delay:200ms] space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-base font-bold text-white">Active Paths</h2>
          <Link
            href="/paths"
            className="text-xs font-semibold text-blue-500 flex items-center"
          >
            <span>Manage</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {paths.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-gray-400">
            <p className="text-sm">No learning paths found.</p>
            <p className="text-xs text-gray-500 mt-1">
              Add your first goal to start tracking progress.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paths.slice(0, 3).map((path) => {
              const progress = calculateProgress(path);
              return (
                <Link
                  key={path.id}
                  href={`/paths/${path.id}`}
                  className="block glass-card rounded-2xl p-4 border border-gray-800/40 hover:border-gray-700/60 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-white leading-tight">
                        {path.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {path.description || "No description provided"}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/10">
                      {progress}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center mt-3 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    <span>
                      {path.topics.filter((t) => t.isCompleted).length} of{" "}
                      {path.topics.length} Milestones
                    </span>
                    <span className="text-blue-500">View path &rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent logs */}
      <section className="animate-slide-up [animation-delay:300ms] space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-base font-bold text-white">Recent Activity</h2>
          <Link
            href="/logs"
            className="text-xs font-semibold text-blue-500 flex items-center"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {logs.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-gray-400">
            <p className="text-sm">No activity logged yet.</p>
            <p className="text-xs text-gray-500 mt-1">
              Your logged sessions will appear here as a timeline.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-800/80 ml-3 pl-4 space-y-4">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="relative">
                {/* Timeline circle */}
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>

                <div className="glass-card rounded-xl p-3 text-xs border border-gray-800/20">
                  <div className="flex justify-between items-start text-gray-400 mb-1">
                    <span className="font-semibold text-gray-200">
                      {log.learningPath.title}
                    </span>
                    <span>
                      {new Date(log.loggedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-300">
                    <Clock size={12} className="text-blue-500" />
                    <span>Studied for {log.durationMins} mins</span>
                  </div>
                  {log.notes && (
                    <div className="mt-1.5 p-1.5 rounded bg-gray-900/30 border border-gray-800/40 text-gray-400">
                      {log.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
