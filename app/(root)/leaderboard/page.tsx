// app/leaderboard/page.tsx
"use client";

import { Clock, Award } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  totalExperiencePoints: number;
  totalCurriculumsCompleted: number;
  zapTokens: number;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardUser[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leaderboard?limit=10");

      if (!response.ok) {
        throw new Error("Error al cargar el leaderboard");
      }

      const result: LeaderboardResponse = await response.json();

      if (result.success) {
        setLeaderboardData(result.data);
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitial = (name: string | null, email: string): string => {
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  const getColorForRank = (rank: number): string => {
    const colors = [
      "bg-red-400",
      "bg-purple-500",
      "bg-green-400",
      "bg-blue-500",
      "bg-yellow-600",
      "bg-cyan-400",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
      "bg-teal-500"
    ];
    return colors[(rank - 1) % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white p-6 flex items-center justify-center">
        <div className="text-xl">Cargando leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white p-6 flex items-center justify-center">
        <div className="text-xl text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[22px] font-bold">División Papel</h1>
        <div className="flex items-center gap-2 text-yellow-400">
          <Clock className="w-6 h-6" />
          <span className="text-xl font-semibold">3 Días</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 lg:gap-8 mb-12">
        <div className="flex flex-col items-center">
          <Award
            className="w-14 h-14 lg:w-20 lg:h-20 text-amber-500 fill-amber-600"
            strokeWidth={1.5}
          />
        </div>
        <div className="flex flex-col items-center">
          <Award
            className="w-14 h-14 lg:w-20 lg:h-20 text-slate-300 fill-slate-400"
            strokeWidth={1.5}
          />
        </div>
        <div className="flex flex-col items-center">
          <Award
            className="w-14 h-14 lg:w-20 lg:h-20 text-green-500 fill-green-600"
            strokeWidth={1.5}
          />
        </div>
        <div className="flex flex-col items-center">
          <Award
            className="w-14 h-14 lg:w-20 lg:h-20 text-red-600 fill-red-700"
            strokeWidth={1.5}
          />
        </div>
      </div>

      <div className="border-t border-neutral-700 mb-6" />

      <div className="space-y-4">
        {leaderboardData.length === 0 ? (
          <div className="text-center text-neutral-400 py-8">
            No hay datos disponibles
          </div>
        ) : (
          leaderboardData.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-4 bg-neutral-800 rounded-lg p-4 hover:bg-neutral-750 transition-colors"
            >
              <span className="text-yellow-500 font-bold text-xl w-6">
                {player.rank}
              </span>

              {player.image ? (
                <img
                  src={player.image}
                  alt={player.name || player.email}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-12 h-12 ${getColorForRank(player.rank)} rounded-full flex items-center justify-center font-bold text-xl`}
                >
                  {getInitial(player.name, player.email)}
                </div>
              )}

              <span className="flex-1 text-lg font-medium">
                {player.name || player.email.split("@")[0]}
              </span>

              <span className="text-lg font-semibold text-neutral-300">
                {player.totalExperiencePoints.toLocaleString()} XP
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
