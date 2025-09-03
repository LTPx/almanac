"use client"

import { useState, useEffect } from "react"
import { TestSystem } from "./TestSystem"

// Mock data - en producción esto vendría de tu API
const mockLessons = [
  {
    id: 1,
    name: "Suma",
    description: "Aprende a sumar números enteros",
    experiencePoints: 25,
  },
  {
    id: 2,
    name: "Resta",
    description: "Domina la resta de números enteros",
    experiencePoints: 25,
  },
  {
    id: 3,
    name: "Multiplicación",
    description: "Multiplica números de forma eficiente",
    experiencePoints: 30,
  },
]

export default function TestPage() {
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    // Obtener userId de tu sistema de autenticación
    // Por ahora usamos un mock
    setUserId("user-123")
  }, [])

  if (!userId) {
    return (
      <div className="bg-gray-900 min-h-screen p-6 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return <TestSystem userId={userId} initialLessons={mockLessons} />
}
