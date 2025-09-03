import LearningPath from "@/components/units-learning";

const mathUnit = {
  id: 2,
  name: "Matemáticas Básicas",
  description:
    "Fundamentos de matemáticas: suma, resta, multiplicación, división y conceptos avanzados",
  order: 1,
  isActive: true,
  _count: { lessons: 14 },
  lessons: [
    {
      id: 3,
      name: "Suma",
      description: "Aprende a sumar números enteros",
      unitId: 2,
      position: 2
    },
    {
      id: 4,
      name: "Resta",
      description: "Aprende a restar números enteros",
      unitId: 2,
      position: 6
    },
    {
      id: 5,
      name: "Multiplicación",
      description: "Aprende las tablas de multiplicar",
      unitId: 2,
      position: 7
    },
    {
      id: 6,
      name: "División",
      description: "Aprende a dividir números enteros",
      unitId: 2,
      position: 11
    },
    {
      id: 7,
      name: "Fracciones",
      description: "Conceptos básicos de fracciones",
      unitId: 2,
      position: 16
    },
    {
      id: 8,
      name: "Decimales",
      description: "Aprende sobre números decimales",
      unitId: 2,
      position: 17
    },
    {
      id: 9,
      name: "Potencias",
      description: "Introducción a las potencias",
      unitId: 2,
      position: 18
    },
    {
      id: 10,
      name: "Raíces cuadradas",
      description: "Aprende a calcular raíces cuadradas",
      unitId: 2,
      position: 21
    },
    {
      id: 11,
      name: "Porcentajes",
      description: "Aprende a calcular porcentajes",
      unitId: 2,
      position: 22
    },
    {
      id: 12,
      name: "Promedios",
      description: "Aprende a calcular promedios",
      unitId: 2,
      position: 23
    },
    {
      id: 13,
      name: "Problemas combinados",
      description: "Ejercicios mezclando conceptos",
      unitId: 2,
      position: 27
    },
    {
      id: 14,
      name: "Ecuaciones básicas",
      description: "Introducción a las ecuaciones simples",
      unitId: 2,
      position: 28
    },
    {
      id: 15,
      name: "Estadística básica",
      description: "Conceptos básicos de estadística",
      unitId: 2,
      position: 29
    },
    {
      id: 16,
      name: "Examen final",
      description: "Prueba de todos los conocimientos",
      unitId: 2,
      position: 33
    }
  ]
};

async function HomePage() {
  return (
    <div className="HomePage">
      <div>pending..</div>
      <div className="h-full">
        <LearningPath unit={mathUnit} />
      </div>
    </div>
  );
}

export default HomePage;
