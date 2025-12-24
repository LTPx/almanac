import { ReactNode } from "react";
import {
  BookOpen,
  List,
  GraduationCap,
  Target,
  Award,
  Bot
} from "lucide-react";

export interface TutorialStep {
  id: string;
  target?: string;
  title: string;
  description: string;
  icon?: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  action?: () => void;
  customContent?: ReactNode;
  isFullScreen?: boolean;
  beforeStepChange?: () => void;
}

export const TUTORIAL_STEP_IDS = {
  WELCOME: "welcome",
  REVIEW_UNITS: "review-units",
  UNIT_EXPLANATIONS: "unit-explanations",
  START_TEST: "start-test",
  NFT_MINTING: "nft-minting",
  COMPLETED_UNIT: "completed-unit",
  OPTIONAL_UNIT: "optional-unit",
  TUTOR_CHAT: "tutor-chat",
  FINAL_UNIT: "final-unit"
} as const;

export function createTutorialSteps(
  courseHeaderRef: React.RefObject<any>
): TutorialStep[] {
  return [
    {
      id: TUTORIAL_STEP_IDS.WELCOME,
      target: ".course-header-select",
      title: "¡Bienvenido a Almanac! 🎉",
      description:
        "Aquí puedes elegir el curriculum que quieres estudiar. Cada curriculum tiene diferentes unidades de aprendizaje.",
      icon: <BookOpen className="w-8 h-8" />,
      position: "bottom"
    },
    {
      id: TUTORIAL_STEP_IDS.REVIEW_UNITS,
      target: "[data-radix-select-content]",
      title: "Revisa las unidades 📚",
      description:
        "Explora todas las unidades disponibles. Cada una contiene diferentes lecciones que te ayudarán a aprender paso a paso.",
      icon: <List className="w-8 h-8" />,
      position: "bottom",
      action: () => {
        courseHeaderRef.current?.openSelect();
      }
    },
    {
      id: TUTORIAL_STEP_IDS.UNIT_EXPLANATIONS,
      target: "[data-tutorial-book='true']",
      title: "Aprende con explicaciones",
      description:
        "Cada unidad tiene explicaciones detalladas que puedes revisar antes de hacer las pruebas. ¡Tómate tu tiempo para aprender!",
      icon: <GraduationCap className="w-8 h-8" />,
      position: "bottom",
      beforeStepChange: () => {
        courseHeaderRef.current?.closeSelect();
      },
      action: () => {
        courseHeaderRef.current?.closeSelect();
      }
    },
    {
      id: TUTORIAL_STEP_IDS.START_TEST,
      target: "[data-tutorial-start-button='true']",
      title: "¡Hora de practicar!",
      description:
        "Cuando estés listo, empieza una prueba. Ahora te mostraremos un ejemplo con los tipos de preguntas que encontrarás.",
      icon: <Target className="w-8 h-8" />,
      position: "bottom"
    },
    {
      id: TUTORIAL_STEP_IDS.COMPLETED_UNIT,
      target: "[data-highest-position='true']",
      title: "¡Unidad Completada! 🎉",
      description:
        "Si apruebas la unidad, puedes continuar a la siguiente. ¡Sigue aprendiendo para completar todo el curriculum!",
      icon: <Award className="w-8 h-8" />,
      position: "top",
      action: () => {
        courseHeaderRef.current?.closeSelect();
      }
    },
    {
      id: TUTORIAL_STEP_IDS.OPTIONAL_UNIT,
      target: "[data-optional-node='true']",
      title: "Unidades Opcionales 🌟",
      description:
        "Algunas unidades son obligatorias y otras son opcionales. Las opcionales te permiten practicar más y mejorar tus habilidades, pero no son necesarias para avanzar.",
      icon: <Target className="w-8 h-8" />,
      position: "top",
      action: () => {
        courseHeaderRef.current?.closeSelect();
      }
    },
    {
      id: TUTORIAL_STEP_IDS.TUTOR_CHAT,
      target: "[data-tutorial-chat='true']",
      title: "Tu Tutor Personal 🤖",
      description:
        "Si tienes preguntas o necesitas ayuda, puedes conversar con tu tutor personal. Escribe y envía tu mensaje para obtener asistencia.",
      icon: <Bot className="w-8 h-8" />,
      position: "bottom",
      action: () => {
        courseHeaderRef.current?.closeSelect();
      }
    },
    {
      id: TUTORIAL_STEP_IDS.FINAL_UNIT,
      target: "[data-first-mandatory='true']",
      title: "¡Unidad Final! 🏆",
      description:
        "Cuando superes la unidad final, recibirás un token que te permitirá crear tu certificado digital único.",
      icon: <Award className="w-8 h-8" />,
      position: "top",
      action: () => {
        courseHeaderRef.current?.closeSelect();
      }
    }
  ];
}
