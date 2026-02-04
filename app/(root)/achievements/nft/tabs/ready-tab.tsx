"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, HelpCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface CompletedUnit {
  unitId: string;
  unitName: string;
  courseName: string;
  completedAt: string;
  hasNFT: boolean;
}

export default function TokenAvailableCard() {
  const { data: session } = useSession();
  const router = useRouter();

  const [availableUnits, setAvailableUnits] = useState<CompletedUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId) {
      fetchAvailableTokens(userId);
    }
  }, [session]);

  const fetchAvailableTokens = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/nfts/reward`);
      const data = await response.json();
      const available = (data.curriculums || []).filter(
        (unit: CompletedUnit) => !unit.hasNFT
      );
      setAvailableUnits(available);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (availableUnits.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="mt-[-200px] flex flex-col items-center gap-4 max-w-sm mx-auto text-center">
          <div className="w-20 h-20 rounded-full border-2 border-gray-600 flex items-center justify-center">
            <Zap className="w-10 h-10 text-gray-500" strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              No hay tokens disponibles
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Completa más unidades para obtener tokens de minteo
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-6 rounded-md font-medium transition-colors"
          >
            Explorar cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-6 px-4">
      {availableUnits.map((unit) => (
        <div
          key={unit.unitId}
          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:border-primary/50 transition-colors"
        >
          <div className="hidden sm:flex items-center justify-between gap-6 mb-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Token
              </p>
            </div>
            <div className="w-32 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Cost
              </p>
            </div>
            <div className="w-20 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Certificate
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex-1">
              <h3 className="text-foreground font-semibold text-base sm:text-lg mb-1">
                {unit.unitName}
              </h3>
              <p className="text-muted-foreground text-sm">{unit.courseName}</p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
              <div className="flex flex-col sm:w-32 sm:items-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1.5 sm:hidden">
                  Costo
                </p>
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-md px-3 py-2 sm:px-4 sm:py-2.5">
                  <Zap className="text-primary" size={18} fill="currentColor" />
                  <span className="text-primary font-semibold text-base sm:text-lg">
                    500
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center sm:w-20">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1.5 sm:hidden">
                  Certificado
                </p>
                <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-muted/30 border border-border rounded-md">
                  <HelpCircle
                    className="text-muted-foreground"
                    size={28}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/achievements/new")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 sm:py-3.5 px-6 rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Zap size={18} fill="currentColor" />
            Mintear ahora
          </button>
        </div>
      ))}
    </div>
  );
}
