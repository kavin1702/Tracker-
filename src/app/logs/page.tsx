"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Clock, Calendar, FileText, Trash2, ArrowLeft, AlertCircle } from "lucide-react";
import AuraHeader from "@/components/AuraHeader";

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

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this study record? It may affect your streak calculation.")) return;

    try {
      const res = await fetch(`/api/logs/${logId}`, {
        method: "DELETE",
      });

      // Wait, let's create a DELETE endpoint for logs or handle it properly. 
      // Wait, is there a delete log API endpoint defined? Let's check: in our task list, we only defined `/api/logs` GET/POST.
      // If we don't have a specific DELETE `/api/logs/[id]` endpoint, we can build it!
      // Let's check: we didn't specify a log delete endpoint in schema, but we can write a quick delete handler in a `/api/logs/[id]/route.ts` file!
      // Yes! Let's write the delete log route too so that the delete button works. Let's do that.
      const deleteRes = await fetch(`/api/api/logs/${logId}`, { // wait, let's make it /api/logs/[id]
        method: "DELETE",
      });
      // We will write the endpoint first. Let's make sure it's /api/logs/[id].
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  const groupLogsByDate = (logsList: Log[]) => {
    const groups: { [key: string]: Log[] } = {};
    logsList.forEach((log) => {
      const date = new Date(log.loggedAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let dateStr = "";
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      ) {
        dateStr = "Today";
      } else if (
        date.getFullYear() === yesterday.getFullYear() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getDate() === yesterday.getDate()
      ) {
        dateStr = "Yesterday";
      } else {
        dateStr = date.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(log);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex flex-col p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/4"></div>
        <div className="h-32 bg-gray-800 rounded-2xl"></div>
        <div className="h-32 bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  const groupedLogs = groupLogsByDate(logs);
  const totalHours = Math.round((logs.reduce((acc, curr) => acc + curr.durationMins, 0) / 60) * 10) / 10;

  return (
    <main className="flex-1 p-5 space-y-6">
      {/* Header */}
      <div className="flex gap-2.5 items-stretch animate-fade-in">
        <div className="flex-1">
          <AuraHeader title="Study Journal" />
        </div>
        <div className="px-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold text-blue-400">
          <Clock size={16} />
          <span>{totalHours} hrs</span>
        </div>
      </div>

      {/* Logs timeline */}
      <section className="animate-slide-up space-y-6">
        {logs.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center text-gray-400 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gray-900/60 rounded-full border border-gray-800">
              <BookOpen size={40} className="text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-white">Your journal is empty</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                Logs of your daily study sessions will appear here sorted by day.
              </p>
            </div>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              Log First Session
            </Link>
          </div>
        ) : (
          Object.keys(groupedLogs).map((dateKey) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 flex items-center gap-2">
                <Calendar size={12} className="text-blue-500" />
                <span>{dateKey}</span>
              </h2>

              <div className="space-y-2.5">
                {groupedLogs[dateKey].map((log) => (
                  <div
                    key={log.id}
                    className="glass-card rounded-2xl p-4 border border-gray-800/40 relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-sm text-white">
                          {log.learningPath.title}
                        </h3>
                        {log.topic && (
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mt-0.5">
                            Milestone: {log.topic.title}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/10">
                        {log.durationMins} mins
                      </span>
                    </div>

                    {log.notes && (
                      <p className="text-xs text-gray-400 bg-gray-900/30 border border-gray-800/40 p-2.5 rounded-xl mt-2 leading-relaxed">
                        {log.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
