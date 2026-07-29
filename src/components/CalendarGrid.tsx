"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle } from "lucide-react";

interface Log {
  loggedAt: string;
  durationMins: number;
}

export default function CalendarGrid({ logs }: { logs: Log[] }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to get total days in a month
  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  // Helper to get the first day of the month (weekday index 0-6)
  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Create grid cells (padding from previous month + days of current month)
  const gridCells = [];
  
  // Padding cells
  for (let i = 0; i < firstDay; i++) {
    gridCells.push({ day: null, date: null });
  }

  // Active days
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    gridCells.push({ day: d, date: cellDate });
  }

  // Format date to local YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Extract unique dates that have logs
  const loggedDatesMap = new Map<string, number>();
  logs.forEach((log) => {
    try {
      const logDateStr = formatDateString(new Date(log.loggedAt));
      const currentVal = loggedDatesMap.get(logDateStr) || 0;
      loggedDatesMap.set(logDateStr, currentVal + log.durationMins);
    } catch (e) {
      // Ignore parsing errors
    }
  });

  const getDayStatus = (date: Date | null) => {
    if (!date) return "empty";

    const dateStr = formatDateString(date);
    const todayStr = formatDateString(today);

    // Is it in the future?
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (checkDate > compareToday) {
      return "future";
    }

    // Has logs?
    if (loggedDatesMap.has(dateStr)) {
      return "completed";
    }

    // Is it today (without logs)?
    if (dateStr === todayStr) {
      return "today";
    }

    // It is in the past with no logs => Missed
    return "missed";
  };

  const getCellClassName = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/25 border-green-500/40 text-green-300 font-bold shadow-[0_0_8px_rgba(34,197,94,0.15)]";
      case "missed":
        return "bg-red-500/10 border-red-500/15 text-red-400/70 line-through decoration-red-500/30";
      case "today":
        return "border-blue-500/60 bg-blue-500/5 text-blue-300 font-bold shadow-[0_0_8px_rgba(59,130,246,0.1)] border-dashed animate-pulse";
      case "future":
        return "border-gray-800/40 text-gray-600 bg-transparent";
      default:
        return "border-gray-800/40 text-gray-400 bg-gray-900/10";
    }
  };

  const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Calculate statistics
  const currentMonthLogs = logs.filter(log => {
    const d = new Date(log.loggedAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const studiedCount = gridCells.filter(cell => {
    if (!cell.date) return false;
    const status = getDayStatus(cell.date);
    return status === "completed";
  }).length;

  const missedCount = gridCells.filter(cell => {
    if (!cell.date) return false;
    const status = getDayStatus(cell.date);
    return status === "missed";
  }).length;

  return (
    <div className="glass-panel rounded-3xl p-5 shadow-lg space-y-4">
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <CalendarIcon size={16} className="text-blue-500" />
          <span>Study History</span>
        </h2>
        
        {/* Month Navigator */}
        <div className="flex items-center gap-2 bg-gray-900/55 border border-gray-800/80 px-2.5 py-1 rounded-xl text-xs">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white p-0.5 cursor-pointer">
            <ChevronLeft size={14} />
          </button>
          <span className="font-semibold text-gray-200 min-w-[90px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white p-0.5 cursor-pointer">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        {weekdayNames.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {gridCells.map((cell, index) => {
          const status = getDayStatus(cell.date);
          const className = getCellClassName(status);
          const minutes = cell.date ? loggedDatesMap.get(formatDateString(cell.date)) || 0 : 0;

          return (
            <div
              key={index}
              title={minutes > 0 ? `${minutes} minutes studied` : undefined}
              className={`aspect-square flex items-center justify-center text-xs rounded-xl border transition-all duration-300 ${className} ${
                !cell.day ? "opacity-0 pointer-events-none" : ""
              }`}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      {/* Summary indicators */}
      <div className="border-t border-gray-800/80 pt-3 flex justify-around text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/25 border border-green-500/40"></div>
          <span>{studiedCount} Studied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/10 border border-red-500/15"></div>
          <span>{missedCount} Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border border-blue-500/60 bg-blue-500/5"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
