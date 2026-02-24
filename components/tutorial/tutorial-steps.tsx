import { ReactNode } from "react";
import {
  BookOpen,
  List,
  GraduationCap,
  Target,
  Award,
  Bot
} from "lucide-react";
import { Translations } from "@/locales/es";

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
  hideTooltip?: boolean;
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
  courseHeaderRef: React.RefObject<any>,
  t: <S extends keyof Translations>(
    section: S,
    key: keyof Translations[S]
  ) => string
): TutorialStep[] {
  return [
    {
      id: TUTORIAL_STEP_IDS.WELCOME,
      target: ".course-header-select",
      title: t("tutorialSteps", "welcomeTitle"),
      description: t("tutorialSteps", "welcomeDesc"),
      icon: <BookOpen className="w-8 h-8" />,
      position: "bottom"
    },
    {
      id: TUTORIAL_STEP_IDS.REVIEW_UNITS,
      target: "[data-radix-select-content]",
      title: t("tutorialSteps", "reviewUnitsTitle"),
      description: t("tutorialSteps", "reviewUnitsDesc"),
      icon: <List className="w-8 h-8" />,
      position: "bottom",
      action: () => {
        courseHeaderRef.current?.openSelect();
      }
    },
    {
      id: TUTORIAL_STEP_IDS.UNIT_EXPLANATIONS,
      target: "[data-tutorial-book='true']",
      title: t("tutorialSteps", "unitExplanationsTitle"),
      hideTooltip: true,
      description: t("tutorialSteps", "unitExplanationsDesc"),
      icon: <GraduationCap className="w-8 h-8" />,
      position: "top",
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
      title: t("tutorialSteps", "startTestTitle"),
      description: t("tutorialSteps", "startTestDesc"),
      icon: <Target className="w-8 h-8" />,
      position: "top"
    },
    {
      id: TUTORIAL_STEP_IDS.COMPLETED_UNIT,
      target: "[data-highest-position='true']",
      title: t("tutorialSteps", "completedUnitTitle"),
      description: t("tutorialSteps", "completedUnitDesc"),
      icon: <Award className="w-8 h-8" />,
      position: "top",
      action: () => {
        courseHeaderRef.current?.closeSelect();
      }
    },
    {
      id: TUTORIAL_STEP_IDS.OPTIONAL_UNIT,
      target: "[data-optional-node='true']",
      title: t("tutorialSteps", "optionalUnitTitle"),
      description: t("tutorialSteps", "optionalUnitDesc"),
      icon: <Target className="w-8 h-8" />,
      position: "top",
      action: () => {
        courseHeaderRef.current?.closeSelect();
      }
    },
    {
      id: TUTORIAL_STEP_IDS.TUTOR_CHAT,
      target: "[data-tutorial-chat='true']",
      title: t("tutorialSteps", "tutorChatTitle"),
      description: t("tutorialSteps", "tutorChatDesc"),
      icon: <Bot className="w-8 h-8" />,
      position: "bottom",
      action: () => {
        courseHeaderRef.current?.closeSelect();
      }
    },
    {
      id: TUTORIAL_STEP_IDS.FINAL_UNIT,
      target: "[data-first-mandatory='true']",
      title: t("tutorialSteps", "finalUnitTitle"),
      description: t("tutorialSteps", "finalUnitDesc"),
      icon: <Award className="w-8 h-8" />,
      position: "top",
      action: () => {
        courseHeaderRef.current?.closeSelect();
      }
    }
  ];
}
