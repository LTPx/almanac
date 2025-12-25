"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, ArrowLeft, Send } from "lucide-react";

interface TutorialChatDemoProps {
  onClose: () => void;
  onBack: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

interface DemoMessage extends ChatMessage {
  delay: number;
}

const TYPING_SPEED = 30;

const DEMO_MESSAGES: DemoMessage[] = [
  {
    role: "assistant",
    content:
      "¡Hola! Soy tu tutor personal de Almanac. Estoy aquí para ayudarte con cualquier duda sobre tus lecciones.",
    delay: 500
  },
  {
    role: "user",
    content: "¿Puedes explicarme más sobre el tema que estoy estudiando?",
    delay: 2000
  },
  {
    role: "assistant",
    content:
      "¡Por supuesto! Puedo explicarte cualquier concepto de tus lecciones, resolver dudas específicas, y ayudarte a prepararte para tus pruebas. ¿Qué te gustaría aprender hoy?",
    delay: 3500
  },
  {
    role: "user",
    content: "¿Cómo funciona el sistema de evaluación?",
    delay: 5500
  },
  {
    role: "assistant",
    content:
      "El sistema de evaluación incluye diferentes tipos de preguntas: opción múltiple, completar espacios y ordenar palabras. Cada prueba te ayuda a reforzar lo aprendido. ¡Siempre estaré aquí para guiarte!",
    delay: 7000
  }
];

export function TutorialChatDemo({ onClose, onBack }: TutorialChatDemoProps) {
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages, typingText]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentMessageIndex >= DEMO_MESSAGES.length) return;

    const currentMessage = DEMO_MESSAGES[currentMessageIndex];

    const timer = setTimeout(() => {
      if (currentMessage.role === "user") {
        setDisplayedMessages((prev) => [
          ...prev,
          {
            role: currentMessage.role,
            content: currentMessage.content
          }
        ]);
        setCurrentMessageIndex((prev) => prev + 1);
      } else {
        setIsTyping(true);
        setTypingText("");

        let currentIndex = 0;

        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }

        typingIntervalRef.current = setInterval(() => {
          if (currentIndex < currentMessage.content.length) {
            setTypingText(currentMessage.content.slice(0, currentIndex + 1));
            currentIndex++;
          } else {
            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current);
            }
            setIsTyping(false);

            setDisplayedMessages((prev) => [
              ...prev,
              {
                role: currentMessage.role,
                content: currentMessage.content
              }
            ]);
            setTypingText("");
            setCurrentMessageIndex((prev) => prev + 1);
          }
        }, TYPING_SPEED);
      }
    }, currentMessage.delay);

    return () => {
      clearTimeout(timer);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [currentMessageIndex]);

  return (
    <div className="w-full max-w-[650px] bg-neutral-900 flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[650px] p-6"
      >
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Almanac Tutor</h1>
              <p className="text-sm text-gray-400">
                Tu tutor de IA personal - Siempre dispuesto a ayudarte
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-600/20 border-2 border-purple-500/50 rounded-2xl p-4 mb-4"
          >
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              ¿Cómo funciona?
            </h3>
            <p className="text-sm text-gray-300">
              El tutor siempre está disponible para responder tus preguntas,
              explicar conceptos difíciles y guiarte en tu aprendizaje. Solo
              escribe tu pregunta y recibe ayuda personalizada.
            </p>
          </motion.div>
        </div>

        <div className="border-2 border-neutral-600 rounded-2xl bg-neutral-800 overflow-hidden mb-4">
          <div className="h-[400px] overflow-y-auto scrollbar-hide p-6">
            <AnimatePresence mode="popLayout">
              {displayedMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`mb-4 flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-neutral-700 text-gray-100 border border-neutral-600"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && typingText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex justify-start"
              >
                <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-neutral-700 text-gray-100 border border-neutral-600">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {typingText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity
                      }}
                      className="inline-block ml-1"
                    >
                      ▊
                    </motion.span>
                  </p>
                </div>
              </motion.div>
            )}

            {!isTyping && currentMessageIndex < DEMO_MESSAGES.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-4"
              >
                <div className="bg-neutral-700 border border-neutral-600 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0
                      }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.2
                      }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.4
                      }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            disabled
            className="flex-1 px-5 py-3 bg-neutral-800 border-2 border-neutral-600 rounded-xl text-white placeholder-gray-500 opacity-50 cursor-not-allowed"
          />
          <Button
            disabled
            className="px-6 py-3 bg-purple-600 rounded-xl cursor-not-allowed opacity-50 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-neutral-600 hover:bg-neutral-800 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>
          <Button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Continuar Tutorial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
