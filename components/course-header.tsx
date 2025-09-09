"use client";

import React from "react";
import { Star, Zap, Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Unit } from "@/lib/types";

interface CourseHeaderProps {
  units: Unit[];
  selectedUnitId: string;
  onUnitChange: (unitId: string) => void;
  streakDays?: number;
  zaps?: number;
  lives?: number;
  className?: string;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  units,
  selectedUnitId,
  onUnitChange,
  streakDays = 5,
  zaps = 120,
  lives = 4,
  className = ""
}) => {
  const selectedUnit = units.find((u) => u.id.toString() === selectedUnitId);

  return (
    <div
      className={`w-full max-w-[650px] sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mx-auto">
        <div className="w-64">
          <Select value={selectedUnitId} onValueChange={onUnitChange}>
            <SelectTrigger className="w-full text-black">
              <SelectValue placeholder="Selecciona una unidad...">
                {selectedUnit ? selectedUnit.name : "Selecciona una unidad..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{unit.name}</span>
                    {/* <Badge variant="secondary" className="ml-2">
                      {unit._count.lessons} lecciones
                    </Badge> */}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 ml-4">
          {/* <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-yellow-50">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-yellow-600">
              {streakDays} días
            </span>
          </div> */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-purple-50">
            <Zap className="w-5 h-5 text-purple-500 fill-current" />
            <span className="text-sm font-medium text-purple-600">{zaps}</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-red-50">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <span className="text-sm font-medium text-red-600">{lives}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
