"use client";

import { useState, useRef, useEffect, JSX } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send, BookOpen, ThumbsUp, ThumbsDown } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  isLimitError?: boolean;
  isTyping?: boolean;
}

interface TopicData {
  title: string;
  unitName?: string;
  curriculumTitle?: string;
}

interface QuestionLimit {
  limit: number;
  used: number;
  remaining: number;
  isPremium: boolean;
}

// Helper function to render markdown links and bold text as HTML
const renderMessageWithLinks = (content: string) => {
  // Regex to match markdown links [text](url) OR bold text **text**
  const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = markdownRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    // Check if it's a link [text](url) - groups 1 and 2 will be defined
    if (match[1] && match[2]) {
      parts.push(
        <a
          key={`link-${keyCounter++}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300"
        >
          {match[1]}
        </a>
      );
    }
    // Otherwise it's bold text **text** - group 3 will be defined
    else if (match[3]) {
      parts.push(
        <strong key={`bold-${keyCounter++}`} className="font-bold">
          {match[3]}
        </strong>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? parts : content;
};

function TypingMessage({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent((prev) => prev + content[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 20);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, content]);

  return (
    <p className="text-sm whitespace-pre-wrap leading-relaxed">
      {renderMessageWithLinks(displayedContent)}
      {currentIndex < content.length && (
        <span className="inline-block w-[2px] h-4 bg-purple-400 ml-1 animate-pulse" />
      )}
    </p>
  );
}

export default function AlmanacTutorPage() {
  const user = useUser();
  const userId = user?.id || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentTopicData, setCurrentTopicData] = useState<TopicData | null>(
    null
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionLimit, setQuestionLimit] = useState<QuestionLimit | null>(
    null
  );
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!userId) {
      setInitialLoading(false);
      return;
    }

    const loadActiveSession = async () => {
      try {
        const response = await fetch(`/api/almanac/chat?userId=${userId}`);
        const data = await response.json();

        if (data.questionLimit) {
          setQuestionLimit(data.questionLimit);
        }

        if (data.session && data.messages.length > 0) {
          setSessionId(data.session.id);
          setMessages(
            data.messages.map((msg: any) => ({
              role: msg.role === "model" ? "assistant" : msg.role,
              content: msg.content,
              isTyping: false
            }))
          );
        }
      } catch (error) {
        console.error("Error loading active session:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadActiveSession();
  }, [userId]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !userId) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/almanac/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          message: userMessage
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            isTyping: true
          }
        ]);
        setCurrentTopicData(data.currentTopicData);
        setSessionId(data.sessionId);

        if (questionLimit) {
          setQuestionLimit({
            ...questionLimit,
            used: questionLimit.used + 1,
            remaining: Math.max(0, questionLimit.remaining - 1)
          });
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Something went wrong",
            isLimitError: data.limitReached || false,
            isTyping: false
          }
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Could not connect to the server",
          isTyping: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = async (wasHelpful?: boolean) => {
    try {
      await fetch("/api/almanac/chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, wasHelpful })
      });
      setMessages([]);
      setCurrentTopicData(null);
      setSessionId(null);
      setShowFeedbackModal(false);
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }
  };

  const handleNewChatClick = () => {
    if (messages.length > 0 && sessionId) {
      setShowFeedbackModal(true);
    } else {
      clearConversation();
    }
  };

  const handleFeedback = async (wasHelpful?: boolean) => {
    await clearConversation(wasHelpful);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white p-6 pb-20 pt-[80px]">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-[500px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 pb-20 pt-[80px]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[22px] font-bold">Almanac Tutor</h1>
                {currentTopicData ? (
                  <p className="text-sm text-gray-400">
                    {currentTopicData.curriculumTitle && (
                      <span className="text-blue-400">
                        {currentTopicData.curriculumTitle}
                      </span>
                    )}
                    {currentTopicData.curriculumTitle &&
                      currentTopicData.unitName && (
                        <span className="text-gray-500"> / </span>
                      )}
                    {currentTopicData.unitName && (
                      <span className="text-gray-400">
                        {currentTopicData.unitName}
                      </span>
                    )}
                    {(currentTopicData.curriculumTitle ||
                      currentTopicData.unitName) && (
                      <span className="text-gray-500"> / </span>
                    )}
                    <span className="text-purple-400">
                      {currentTopicData.title}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    Tu tutor de IA basado en tus lecciones de Almanac
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChatClick}
                  disabled={messages.length === 0}
                  className="border-neutral-600 hover:bg-neutral-800"
                >
                  Nuevo Chat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="border-2 border-neutral-600 rounded-2xl bg-neutral-800 overflow-hidden mb-4">
          <div className="h-[500px] overflow-y-auto p-6">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-500 opacity-50" />
                <p className="text-lg font-semibold mb-2 text-white">
                  ¡Bienvenido a Almanac Tutor!
                </p>
                <p className="text-sm mb-6">
                  Comienza una conversación preguntando sobre cualquier lección
                  de tu currículum
                </p>
                <div className="max-w-md mx-auto space-y-3">
                  <button
                    onClick={() =>
                      setInput("¿Sobre qué temas puedes ayudarme a aprender?")
                    }
                    className="block w-full px-4 py-3 text-sm bg-neutral-700 text-white rounded-xl hover:bg-neutral-600 transition-colors border border-neutral-600"
                  >
                    ¿Sobre qué temas puedes ayudarme a aprender?
                  </button>
                  <button
                    onClick={() => setInput("Quiero aprender algo nuevo")}
                    className="block w-full px-4 py-3 text-sm bg-neutral-700 text-white rounded-xl hover:bg-neutral-600 transition-colors border border-neutral-600"
                  >
                    Quiero aprender algo nuevo
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-purple-600 text-white"
                      : message.isLimitError
                        ? "bg-amber-900/50 text-amber-100 border-2 border-amber-600"
                        : "bg-neutral-700 text-gray-100 border border-neutral-600"
                  }`}
                >
                  {message.role === "assistant" && message.isTyping ? (
                    <TypingMessage content={message.content} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.isLimitError &&
                      message.content.includes("Premium") ? (
                        <>
                          {message.content
                            .split("Premium")
                            .map((part, i, arr) => (
                              <span key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                  <Link
                                    href="/store"
                                    className="text-amber-300 underline hover:text-amber-200 font-semibold"
                                  >
                                    Premium
                                  </Link>
                                )}
                              </span>
                            ))}
                        </>
                      ) : (
                        renderMessageWithLinks(message.content)
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-neutral-700 border border-neutral-600 px-4 py-3 rounded-2xl">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={loading}
            className="flex-1 px-5 py-4 bg-neutral-800 border-2 border-neutral-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        {questionLimit && (
          <div className="text-left mt-3">
            <p className="text-xs text-gray-500">
              {questionLimit.isPremium ? "Plan Premium" : "Plan Gratuito"}
            </p>
            <div className="flex gap-1 items-baseline">
              <p
                className={`text-sm font-semibold ${
                  questionLimit.remaining <= 2
                    ? "text-red-400"
                    : questionLimit.remaining <= 5
                      ? "text-yellow-400"
                      : "text-green-400"
                }`}
              >
                {questionLimit.remaining} / {questionLimit.limit}
              </p>
              <p className="text-xs text-gray-500">preguntas máximo</p>
            </div>
          </div>
        )}

        {/* Modal de Feedback */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-2xl p-6 max-w-md w-full border-2 border-neutral-600">
              <h3 className="text-xl font-bold mb-4 text-white">
                ¿Cómo fue tu experiencia?
              </h3>
              <p className="text-gray-400 mb-6 text-sm">
                Tu feedback nos ayuda a mejorar el tutor
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleFeedback(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <ThumbsUp className="w-5 h-5" />
                  Fue útil
                </Button>

                <Button
                  onClick={() => handleFeedback(false)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <ThumbsDown className="w-5 h-5" />
                  No fue útil
                </Button>

                <Button
                  onClick={() => handleFeedback()}
                  variant="outline"
                  className="w-full border-neutral-600 hover:bg-neutral-700 text-gray-300 py-4 rounded-xl transition-colors"
                >
                  Omitir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
