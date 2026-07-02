"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import { getMissions } from "@/features/missions/services/missionService";
import { MissionCard } from "./MissionCard";
import { CreateMissionForm } from "./CreateMissionForm";
import { Button } from "@/shared/components/Button";
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
      <div className="py-12 text-center text-sm text-gray-500">
        Loading missions...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Missions ({missions.length})
        </h2>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          + New Mission
        </Button>
      </div>

      {missions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">
            No missions yet. Create your first mission to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} onMutate={refresh} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateMissionForm onClose={() => { setShowCreate(false); refresh(); }} />
      )}
    </div>
  );
}
