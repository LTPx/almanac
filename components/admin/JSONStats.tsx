"use client";

import React from "react";

interface JSONStatsProps {
  units: number;
  lessons: number;
  questions: number;
}

export default function JSONStats({ units, lessons, questions }: JSONStatsProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-2">
        Resumen del contenido
      </h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">{units}</div>
          <div className="text-sm text-blue-700">Unidades</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600">{lessons}</div>
          <div className="text-sm text-blue-700">Lecciones</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600">{questions}</div>
          <div className="text-sm text-blue-700">Preguntas</div>
        </div>
      </div>
    </div>
  );
}
