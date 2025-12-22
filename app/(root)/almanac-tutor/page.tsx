"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Send,
  Trash2,
  BookOpen,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useUser } from "@/context/UserContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TopicData {
  title: string;
  unitName?: string;
  curriculumTitle?: string;
}

export default function AlmanacTutorPage() {
  const user = useUser();
  const userId = user?.id || "";
  console.log(userId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [currentTopicData, setCurrentTopicData] = useState<TopicData | null>(
    null
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Guardar sesión cuando el usuario salga de la página
  useEffect(() => {
    return () => {
      // Cleanup: Finalizar sesión cuando el componente se desmonte
      if (sessionId && userId) {
        fetch("/api/almanac/chat", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId })
        }).catch((error) => {
          console.error("Error saving session on unmount:", error);
        });
      }
    };
  }, [sessionId, userId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
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
          { role: "assistant", content: data.response }
        ]);
        // setCurrentTopic(data.currentTopic);
        setCurrentTopicData(data.currentTopicData);
        setSessionId(data.sessionId);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error || "Something went wrong"}`
          }
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Could not connect to the server"
        }
      ]);
    } finally {
      setLoading(false);
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
      // setCurrentTopic(null);
      setCurrentTopicData(null);
      setSessionId(null);
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }
  };

  const endWithFeedback = async (helpful: boolean) => {
    await clearConversation(helpful);
  };

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
                    Your AI tutor powered by your Almanac lessons
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {messages.length > 0 && sessionId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => endWithFeedback(true)}
                    title="This was helpful"
                    className="border-neutral-600 hover:bg-neutral-800 hover:text-green-400"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => endWithFeedback(false)}
                    title="This wasn't helpful"
                    className="border-neutral-600 hover:bg-neutral-800 hover:text-red-400"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearConversation()}
                disabled={messages.length === 0}
                className="border-neutral-600 hover:bg-neutral-800"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
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
                  Welcome to Almanac Tutor!
                </p>
                <p className="text-sm mb-6">
                  Start a conversation by asking about any lesson from your
                  curriculum
                </p>
                <div className="max-w-md mx-auto space-y-3">
                  <button
                    onClick={() =>
                      setInput("What topics can you help me learn about?")
                    }
                    className="block w-full px-4 py-3 text-sm bg-neutral-700 text-white rounded-xl hover:bg-neutral-600 transition-colors border border-neutral-600"
                  >
                    What topics can you help me learn about?
                  </button>
                  <button
                    onClick={() => setInput("I want to learn something new")}
                    className="block w-full px-4 py-3 text-sm bg-neutral-700 text-white rounded-xl hover:bg-neutral-600 transition-colors border border-neutral-600"
                  >
                    I want to learn something new
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
                      : "bg-neutral-700 text-gray-100 border border-neutral-600"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
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
        <form onSubmit={sendMessage}>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 px-5 py-4 bg-neutral-800 border-2 border-neutral-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
            />
            <Button
              type="submit"
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
        </form>
      </div>
    </div>
  );
}
