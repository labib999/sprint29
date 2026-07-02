"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import { getMissions } from "@/features/missions/services/missionService";
import { MissionCard } from "./MissionCard";
import { CreateMissionForm } from "./CreateMissionForm";
import { useCallback, useEffect, useState } from "react";
import type { Mission } from "@/types";

export function MissionList() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    getMissions()
      .then(setMissions)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user, refreshKey]);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-[#111111]" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {missions.length === 0 ? (
        <div className="rounded-lg bg-[#111111] p-8 text-center">
          <p className="text-sm text-[#555]">
            No missions yet.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Create Mission
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} onMutate={refresh} />
          ))}
          <button
            onClick={() => setShowCreate(true)}
            className="w-full rounded-lg border border-dashed border-[#333] py-3 text-sm text-[#555] hover:border-brand-500 hover:text-brand-500 transition-colors"
          >
            + New Mission
          </button>
        </div>
      )}

      {showCreate && (
        <CreateMissionForm onClose={() => { setShowCreate(false); refresh(); }} />
      )}
    </div>
  );
}
