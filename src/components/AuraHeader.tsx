"use client";

import { useAuraPoints } from "@/hooks/useAuraPoints";
import { Sparkles, Zap } from "lucide-react";

export default function AuraHeader({ title }: { title: string }) {
  const { points, level, progress } = useAuraPoints();

  // Dynamic glow border color based on level
  const getGlowColor = () => {
    if (level < 3) return "shadow-[0_0_12px_rgba(59,130,246,0.2)] border-blue-500/20"; // Blue aura
    if (level < 6) return "shadow-[0_0_12px_rgba(139,92,246,0.3)] border-purple-500/20"; // Purple aura
    return "shadow-[0_0_16px_rgba(245,158,11,0.4)] border-amber-500/30"; // Golden aura
  };

  const getBadgeColor = () => {
    if (level < 3) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (level < 6) return "bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse";
    return "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]";
  };

  return (
    <div className={`glass-panel rounded-2xl p-4 border ${getGlowColor()} flex flex-col gap-2.5 animate-fade-in`}>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Aura Learn
          </span>
          <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h1>
        </div>

        {/* Level & Points Badges */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-[11px] font-bold border px-2.5 py-1 rounded-xl ${getBadgeColor()}`}>
            <Sparkles size={12} />
            <span>LVL {level}</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-900/60 border border-gray-800 text-[11px] font-bold text-gray-200 px-2.5 py-1 rounded-xl">
            <Zap size={12} className="text-yellow-500 fill-yellow-500/15" />
            <span>{points} AP</span>
          </div>
        </div>
      </div>

      {/* Level progress bar */}
      <div className="space-y-1">
        <div className="w-full bg-gray-900/80 h-1.5 rounded-full overflow-hidden border border-gray-800/40">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              level < 3 ? "bg-blue-500" : level < 6 ? "bg-purple-500" : "bg-gradient-to-r from-amber-500 to-yellow-400"
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[8px] text-gray-500 font-bold uppercase tracking-wider">
          <span>Current level</span>
          <span>{500 - (points % 500)} AP to level up</span>
        </div>
      </div>
    </div>
  );
}
