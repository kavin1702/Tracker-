"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash, Plus, CheckCircle, Circle, Clock, Tag, ChevronDown, Edit, Save, X } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

interface Log {
  id: string;
  durationMins: number;
  notes: string | null;
  loggedAt: string;
  topic?: {
    title: string;
  } | null;
}

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  status: string;
  topics: Topic[];
  logs: Log[];
}

export default function PathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: pathId } = use(params);
  const router = useRouter();

  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [savingPath, setSavingPath] = useState(false);

  // Add Topic state
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [addingTopic, setAddingTopic] = useState(false);

  const fetchPathDetails = async () => {
    try {
      const res = await fetch(`/api/paths/${pathId}`);
      if (res.ok) {
        const data = await res.json();
        setPath(data);
        setEditTitle(data.title);
        setEditDesc(data.description || "");
        setEditStatus(data.status);
      } else {
        router.push("/paths");
      }
    } catch (error) {
      console.error("Error fetching path details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPathDetails();
  }, [pathId]);

  const handleToggleTopic = async (topicId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });

      if (res.ok) {
        // Optimistically update state
        if (path) {
          const updatedTopics = path.topics.map((t) =>
            t.id === topicId ? { ...t, isCompleted: !currentStatus } : t
          );
          setPath({ ...path, topics: updatedTopics });
        }
      }
    } catch (error) {
      console.error("Error toggling topic:", error);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    setAddingTopic(true);
    try {
      const res = await fetch(`/api/paths/${pathId}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTopicTitle.trim() }),
      });

      if (res.ok) {
        setNewTopicTitle("");
        await fetchPathDetails();
      }
    } catch (error) {
      console.error("Error adding topic:", error);
    } finally {
      setAddingTopic(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;

    try {
      const res = await fetch(`/api/topics/${topicId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchPathDetails();
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  const handleUpdatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPath(true);

    try {
      const res = await fetch(`/api/paths/${pathId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim() || null,
          status: editStatus,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        await fetchPathDetails();
      }
    } catch (error) {
      console.error("Error updating path:", error);
    } finally {
      setSavingPath(false);
    }
  };

  const handleDeletePath = async () => {
    if (!confirm("Are you sure you want to delete this entire learning path and all its logs? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/paths/${pathId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/paths");
      }
    } catch (error) {
      console.error("Error deleting path:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/4"></div>
        <div className="h-24 bg-gray-800 rounded-2xl"></div>
        <div className="h-64 bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Learning path not found.</p>
        <Link href="/paths" className="text-blue-500 text-sm mt-2 block">
          &larr; Back to Paths
        </Link>
      </div>
    );
  }

  const completedCount = path.topics.filter((t) => t.isCompleted).length;
  const totalCount = path.topics.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <main className="flex-1 p-5 space-y-6">
      {/* Navigation Header */}
      <header className="flex justify-between items-center animate-fade-in">
        <Link
          href="/paths"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Paths</span>
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-gray-900/60 text-gray-300 hover:text-white border border-gray-800 rounded-xl cursor-pointer"
          >
            {isEditing ? <X size={16} /> : <Edit size={16} />}
          </button>
          <button
            onClick={handleDeletePath}
            className="p-2 bg-red-950/20 text-red-400 hover:text-red-300 border border-red-900/20 rounded-xl cursor-pointer"
          >
            <Trash size={16} />
          </button>
        </div>
      </header>

      {/* Edit Mode Panel */}
      {isEditing ? (
        <section className="animate-slide-up">
          <form onSubmit={handleUpdatePath} className="glass-panel rounded-3xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Edit Learning Path
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPath}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 rounded-xl cursor-pointer"
            >
              <Save size={16} />
              <span>{savingPath ? "Saving..." : "Save Changes"}</span>
            </button>
          </form>
        </section>
      ) : (
        /* Path Info Card */
        <section className="animate-slide-up space-y-4">
          <div className="glass-panel rounded-3xl p-5 shadow-lg border border-gray-800/40 relative overflow-hidden">
            {/* Glowing background hint */}
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-blue-500/10 blur-xl"></div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold border border-blue-500/20 bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full">
                {path.status}
              </span>
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight leading-snug">
              {path.title}
            </h1>

            {path.description && (
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                {path.description}
              </p>
            )}

            {/* Progress indicators */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span>Overall Completion</span>
                <span className="text-blue-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-500 font-semibold">
                {completedCount} of {totalCount} topics finished
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Milestones / Checklist */}
      <section className="animate-slide-up [animation-delay:100ms] space-y-3">
        <h2 className="text-base font-bold text-white px-1">Milestones</h2>

        {/* Milestones Checklist Container */}
        <div className="glass-panel rounded-3xl p-4 shadow-lg space-y-3">
          {path.topics.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              No milestones added to this path yet. Add one below!
            </p>
          ) : (
            <div className="divide-y divide-gray-800/60 space-y-3">
              {path.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between pt-3 first:pt-0"
                >
                  <button
                    onClick={() => handleToggleTopic(topic.id, topic.isCompleted)}
                    className="flex items-center gap-3 text-left flex-1 cursor-pointer group"
                  >
                    <div className="text-blue-500 transition-transform group-hover:scale-110">
                      {topic.isCompleted ? (
                        <CheckCircle size={20} className="fill-blue-500/10" />
                      ) : (
                        <Circle size={20} className="text-gray-600 hover:text-blue-400" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        topic.isCompleted ? "text-gray-500 line-through" : "text-gray-200"
                      }`}
                    >
                      {topic.title}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="text-gray-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Milestone Inline Form */}
          <form onSubmit={handleAddTopic} className="flex gap-2 pt-3 border-t border-gray-800/80">
            <input
              type="text"
              placeholder="New milestone..."
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="flex-1 bg-[#111827] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={addingTopic}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            >
              <Plus size={14} />
            </button>
          </form>
        </div>
      </section>

      {/* Path Specific Logs */}
      <section className="animate-slide-up [animation-delay:200ms] space-y-3">
        <h2 className="text-base font-bold text-white px-1">Study Logs</h2>

        {path.logs.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-gray-500 text-xs">
            No study sessions logged for this path yet.
          </div>
        ) : (
          <div className="space-y-3">
            {path.logs.map((log) => (
              <div key={log.id} className="glass-card rounded-2xl p-3.5 border border-gray-800/40">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-blue-500" />
                    <span className="font-semibold text-gray-200">
                      {log.durationMins} mins studied
                    </span>
                  </div>
                  <span>
                    {new Date(log.loggedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {log.notes && (
                  <p className="text-xs text-gray-400 bg-gray-900/20 border border-gray-800/40 p-2 rounded-xl mt-1">
                    {log.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
