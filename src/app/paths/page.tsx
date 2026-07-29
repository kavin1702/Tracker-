"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, X, Trash, Compass, FolderOpen, AlertCircle, ArrowRight } from "lucide-react";

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
  createdAt: string;
  topics: Topic[];
}

export default function PathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [topicsList, setTopicsList] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPaths = async () => {
    try {
      const res = await fetch("/api/paths");
      if (res.ok) {
        const data = await res.json();
        setPaths(data);
      }
    } catch (error) {
      console.error("Error fetching paths:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    setTopicsList([...topicsList, newTopic.trim()]);
    setNewTopic("");
  };

  const handleRemoveTopic = (index: number) => {
    setTopicsList(topicsList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Path title is required");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          topics: topicsList,
        }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setTopicsList([]);
        setShowAddForm(false);
        fetchPaths();
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.error || "Failed to create learning path");
      }
    } catch (error) {
      console.error("Error creating path:", error);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "COMPLETED":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "PAUSED":
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3"></div>
        <div className="h-40 bg-gray-800 rounded-3xl"></div>
        <div className="h-40 bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-5 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center animate-fade-in">
        <div>
          <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
            Aura Learn
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Learning Paths
          </h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            showAddForm
              ? "bg-red-500/10 text-red-500 border-red-500/20"
              : "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
          }`}
        >
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </header>

      {/* Add Path Form Panel */}
      {showAddForm && (
        <section className="animate-slide-up">
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl p-5 shadow-lg space-y-4 border border-blue-500/10"
          >
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Create New Learning Path
            </h2>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Path Title
                </label>
                <input
                  type="text"
                  placeholder="E.g., Mastering React Server Components"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of your learning goal..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="border-t border-gray-800/80 pt-3">
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Add Milestones / Topics
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g., Read RFC Doc"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTopic())}
                    className="flex-1 bg-[#111827] border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Initial Milestones List */}
                {topicsList.length > 0 && (
                  <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                    {topicsList.map((topic, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-900/40 border border-gray-800 px-3 py-1.5 rounded-lg text-xs"
                      >
                        <span className="text-gray-300 truncate pr-2">
                          {index + 1}. {topic}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(index)}
                          className="text-red-400 hover:text-red-300 p-0.5"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-lg cursor-pointer"
            >
              {saving ? "Creating..." : "Save Learning Path"}
            </button>
          </form>
        </section>
      )}

      {/* Paths List */}
      <section className="animate-slide-up [animation-delay:100ms] space-y-4">
        {paths.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center text-gray-400 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gray-900/60 rounded-full border border-gray-800">
              <Compass size={40} className="text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-white">No learning paths yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                Create a path to start organizing your study goals and milestones.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {paths.map((path) => {
              const completedCount = path.topics.filter((t) => t.isCompleted).length;
              const totalCount = path.topics.length;
              const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div
                  key={path.id}
                  className="glass-card rounded-2xl p-4 border border-gray-800/40 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${getStatusColor(
                        path.status
                      )}`}
                    >
                      {path.status}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Created{" "}
                      {new Date(path.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {path.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {path.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                      <span>
                        {completedCount} of {totalCount} Milestones ({progress}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-800/50 flex justify-end">
                    <Link
                      href={`/paths/${path.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      <span>Track Progress</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
