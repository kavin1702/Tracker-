"use client";

import { useState, useEffect } from "react";

const AURA_STORAGE_KEY = "aura_points_total";

export function useAuraPoints() {
  const [points, setPoints] = useState<number>(0);

  // Load points on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(AURA_STORAGE_KEY);
      if (stored) {
        setPoints(parseInt(stored, 10));
      } else {
        localStorage.setItem(AURA_STORAGE_KEY, "0");
        setPoints(0);
      }
    }

    const handleAuraChange = () => {
      const stored = localStorage.getItem(AURA_STORAGE_KEY);
      if (stored) {
        setPoints(parseInt(stored, 10));
      }
    };

    window.addEventListener("aura-points-changed", handleAuraChange);
    window.addEventListener("storage", handleAuraChange);

    return () => {
      window.removeEventListener("aura-points-changed", handleAuraChange);
      window.removeEventListener("storage", handleAuraChange);
    };
  }, []);

  const addPoints = (amount: number) => {
    if (typeof window !== "undefined") {
      const current = parseInt(localStorage.getItem(AURA_STORAGE_KEY) || "0", 10);
      const nextPoints = Math.max(0, current + amount);
      localStorage.setItem(AURA_STORAGE_KEY, nextPoints.toString());
      
      // Dispatch custom event to notify other components instantly
      window.dispatchEvent(new Event("aura-points-changed"));
    }
  };

  const getLevel = () => {
    // 500 points per level
    return Math.floor(points / 500) + 1;
  };

  const getProgressToNextLevel = () => {
    const pointsInCurrentLevel = points % 500;
    return (pointsInCurrentLevel / 500) * 100;
  };

  return {
    points,
    level: getLevel(),
    progress: getProgressToNextLevel(),
    addPoints,
  };
}
