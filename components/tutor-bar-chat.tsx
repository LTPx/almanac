"use client";

import React, { useState, useRef, useMemo } from "react";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface ChatTutorBarProps {
  curriculumTitle?: string;
}

export default function ChatTutorBar({ curriculumTitle }: ChatTutorBarProps) {
  const router = useRouter();
  const user = useUser();
  const userId = user?.id || "";
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultQuestions = [
    "¿Qué temas puedo aprender aquí?",
    "Ayúdame a repasar lo que he aprendido",
    "Explícame un concepto que no entiendo",
    "¿Puedes darme ejemplos prácticos?"
  ];

  const suggestedQuestions = useMemo(() => {
    if (!curriculumTitle) return defaultQuestions;

    return [
      `¿Qué voy a aprender en ${curriculumTitle}?`,
      `Dame un resumen de ${curriculumTitle}`,
      `¿Cuáles son los conceptos clave de ${curriculumTitle}?`,
      `Ayúdame a entender mejor ${curriculumTitle}`
    ];
  }, [curriculumTitle]);

  const clearSessionAndNavigate = async (question?: string) => {
    try {
      if (userId) {
        await fetch("/api/almanac/chat", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId })
        });
      }

      if (question?.trim()) {
        router.push(`/almanac-tutor?q=${encodeURIComponent(question.trim())}`);
      } else {
        router.push("/almanac-tutor");
      }
    } catch (error) {
      console.error("Error clearing session:", error);
      if (question?.trim()) {
        router.push(`/almanac-tutor?q=${encodeURIComponent(question.trim())}`);
      } else {
        router.push("/almanac-tutor");
      }
    }
  };

  const handleSearchClick = () => {
    clearSessionAndNavigate(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleSuggestionClick = (question: string) => {
    clearSessionAndNavigate(question);
  };

  const handleClear = () => {
    setInputValue("");
    inputRef.current?.focus();
  };

  return (
    <section className="pt-[10px] sticky bg-[#171717] top-[70px] z-10 px-4">
      <div className="relative">
        <div
          className={`flex items-center gap-3 w-full px-4 py-3 bg-zinc-900 border rounded-full transition-all duration-200 ${
            isFocused
              ? "border-purple-500 shadow-lg shadow-purple-500/20"
              : "border-zinc-800"
          }`}
          data-tutorial-chat="true"
        >
          <img
            alt="logo-search-bg"
            className="w-5 h-5"
            src={"/logo-search-bg.png"}
          />

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="What would you like to learn today?"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />

          {inputValue && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <img
            onClick={handleSearchClick}
            alt="icon-search-bar"
            className="w-10 h-7 cursor-pointer"
            src={"/icon-search-bar.png"}
          />
        </div>

        {isFocused && !inputValue && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-400">
                {curriculumTitle
                  ? "Suggested for this topic"
                  : "Suggested questions"}
              </span>
            </div>
            <div className="space-y-1">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(question)}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:bg-zinc-800 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="group-hover:text-white transition-colors">
                      {question}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
