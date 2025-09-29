"use client";
import { Clock, Award } from "lucide-react";

function Leaderboard() {
  const leaderboardData = [
    { id: 1, name: "Andrés", initial: "A", xp: 7250, color: "bg-red-400" },
    { id: 2, name: "María", initial: "M", xp: 3250, color: "bg-purple-500" },
    { id: 3, name: "Pedro", initial: "P", xp: 750, color: "bg-green-400" },
    { id: 4, name: "Luis", initial: "L", xp: 450, color: "bg-blue-500" },
    { id: 5, name: "Julia", initial: "J", xp: 250, color: "bg-yellow-600" },
    { id: 6, name: "Ernesto", initial: "E", xp: 50, color: "bg-cyan-400" }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[22px] font-bold">División Papel</h1>
        <div className="flex items-center gap-2 text-yellow-400">
          <Clock className="w-6 h-6" />
          <span className="text-xl font-semibold">3 Días</span>
        </div>
      </div>
      <div className="flex justify-center gap-8 mb-12">
        <div className="flex flex-col items-center">
          <Award
            className="w-20 h-20 text-amber-500 fill-amber-600"
            strokeWidth={1.5}
          />
        </div>
        <div className="flex flex-col items-center">
          <Award
            className="w-20 h-20 text-slate-300 fill-slate-400"
            strokeWidth={1.5}
          />
        </div>
        <div className="flex flex-col items-center">
          <Award
            className="w-20 h-20 text-green-500 fill-green-600"
            strokeWidth={1.5}
          />
        </div>
        <div className="flex flex-col items-center">
          <Award
            className="w-20 h-20 text-red-600 fill-red-700"
            strokeWidth={1.5}
          />
        </div>
      </div>
      <div className="border-t border-neutral-700 mb-6" />
      <div className="space-y-4">
        {leaderboardData.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center gap-4 bg-neutral-800 rounded-lg p-4 hover:bg-neutral-750 transition-colors"
          >
            <span className="text-yellow-500 font-bold text-xl w-6">
              {index + 1}
            </span>
            <div
              className={`w-12 h-12 ${player.color} rounded-full flex items-center justify-center font-bold text-xl`}
            >
              {player.initial}
            </div>
            <span className="flex-1 text-lg font-medium">{player.name}</span>
            <span className="text-lg font-semibold text-neutral-300">
              {player.xp.toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
