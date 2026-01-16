"use client";

import React, { useState, useRef, useMemo } from "react";
import { Search, ArrowRight, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatTutorBarProps {
  curriculumTitle?: string;
}

export default function ChatTutorBar({ curriculumTitle }: ChatTutorBarProps) {
  const router = useRouter();
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

  const handleSearchClick = () => {
    if (inputValue.trim()) {
      router.push(`/almanac-tutor?q=${encodeURIComponent(inputValue.trim())}`);
    } else {
      router.push("/almanac-tutor");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleSuggestionClick = (question: string) => {
    router.push(`/almanac-tutor?q=${encodeURIComponent(question)}`);
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
          <Search
            className={`h-5 w-5 transition-colors flex-shrink-0 ${
              isFocused ? "text-purple-400" : "text-muted-foreground"
            }`}
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

          <button
            onClick={handleSearchClick}
            className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ${
              inputValue
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-muted-foreground"
            }`}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
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
