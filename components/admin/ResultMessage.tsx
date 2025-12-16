"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface ResultMessageProps {
  success: boolean;
  message: string;
  stats?: {
    units: number;
    lessons: number;
    questions: number;
  };
  details?: any[];
}

export default function ResultMessage({
  success,
  message,
  stats,
  details
}: ResultMessageProps) {
  return (
    <div
      className={`border rounded-lg p-4 mb-6 ${
        success
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-start gap-2">
        {success ? (
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
        )}
        <div className="flex-1">
          <h3
            className={`font-semibold mb-1 ${
              success ? "text-green-900" : "text-red-900"
            }`}
          >
            {success ? "¡Éxito!" : "Error"}
          </h3>
          <p
            className={`text-sm ${
              success ? "text-green-700" : "text-red-700"
            }`}
          >
            {message}
          </p>
          {stats && (
            <div className="mt-2 text-sm text-green-700">
              Creados: {stats.units} unidades, {stats.lessons} lecciones,{" "}
              {stats.questions} preguntas
            </div>
          )}
          {details && Array.isArray(details) && (
            <div className="mt-2">
              <ul className="text-sm text-red-700 space-y-1">
                {details.slice(0, 5).map((detail: any, idx: number) => (
                  <li key={idx}>
                    • {detail.path}: {detail.message}
                  </li>
                ))}
                {details.length > 5 && (
                  <li className="text-red-600">
                    ... y {details.length - 5} errores más
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
