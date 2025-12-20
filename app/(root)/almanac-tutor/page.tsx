"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Trash2, BookOpen } from "lucide-react";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [currentTopicData, setCurrentTopicData] = useState<TopicData | null>(
    null
  );
  const [userId] = useState(() => `user_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/almanac/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
        setCurrentTopic(data.currentTopic);
        setCurrentTopicData(data.currentTopicData);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error || "Something went wrong"}`,
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Could not connect to the server",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = async () => {
    try {
      await fetch("/api/almanac/chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      setMessages([]);
      setCurrentTopic(null);
      setCurrentTopicData(null);
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Almanac Tutor
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentTopicData ? (
                    <span className="text-purple-600 font-medium">
                      {currentTopicData.curriculumTitle && (
                        <span className="text-blue-600">
                          {currentTopicData.curriculumTitle} /{" "}
                        </span>
                      )}
                      {currentTopicData.unitName && (
                        <span className="text-gray-500">
                          {currentTopicData.unitName} /{" "}
                        </span>
                      )}
                      {currentTopicData.title}
                    </span>
                  ) : (
                    "Your AI tutor powered by your Almanac lessons"
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversation}
              disabled={messages.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white dark:bg-gray-800 shadow-lg p-6 h-[500px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-300" />
              <p className="text-lg font-medium mb-2">
                Welcome to Almanac Tutor!
              </p>
              <p className="text-sm">
                Start a conversation by asking about any lesson from your
                curriculum
              </p>
              <div className="mt-6 space-y-2">
                <button
                  onClick={() =>
                    setInput("What topics can you help me learn about?")
                  }
                  className="block w-full max-w-md mx-auto px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                >
                  What topics can you help me learn about?
                </button>
                <button
                  onClick={() => setInput("I want to learn something new")}
                  className="block w-full max-w-md mx-auto px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
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
                className={`max-w-[80%] px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg p-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
