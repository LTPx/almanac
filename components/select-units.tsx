"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Unit } from "@/lib/types";

interface SelectUnitsProps {
  units: Unit[];
  selectedUnitId: string;
  onChange: (unitId: string) => void;
}

export function SelectUnits({
  units,
  selectedUnitId,
  onChange
}: SelectUnitsProps) {
  return (
    <div className="mb-6 max-w-md">
      <Select value={selectedUnitId} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona una unidad..." />
        </SelectTrigger>
        <SelectContent>
          {units.map((unit) => (
            <SelectItem key={unit.id} value={unit.id.toString()}>
              <div className="flex items-center justify-between w-full">
                <span>{unit.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {unit._count.lessons} lecciones
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
