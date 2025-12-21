"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface TutorialState {
  isActive: boolean;
  currentStep: number;
  hasCompleted: boolean;
}

interface TutorialContextValue extends TutorialState {
  startTutorial: () => void;
  completeTutorial: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "tutorial_completed";

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TutorialState>(() => ({
    isActive: false,
    currentStep: 0,
    hasCompleted:
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY) === "true"
        : false
  }));

  const startTutorial = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: true,
      currentStep: 0
    }));
  }, []);

  const completeTutorial = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setState((prev) => ({
      ...prev,
      isActive: false,
      currentStep: 0,
      hasCompleted: true
    }));
  }, []);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: step
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  }, []);

  const resetTutorial = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isActive: true,
      currentStep: 0,
      hasCompleted: false
    });
  }, []);

  const value: TutorialContextValue = {
    ...state,
    startTutorial,
    completeTutorial,
    setStep,
    nextStep,
    prevStep,
    resetTutorial
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within TutorialProvider");
  }
  return context;
}
