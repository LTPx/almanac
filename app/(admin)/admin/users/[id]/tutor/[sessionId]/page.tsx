"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  ThumbsUp,
  ThumbsDown,
  User,
  Bot
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

interface SessionDetails {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  lesson: {
    id: number;
    name: string;
    unitName: string;
    curriculumTitle: string;
  };
  messages: Message[];
  messageCount: number;
  userMessages: number;
  tutorMessages: number;
  startedAt: string;
  lastActive: string;
  endedAt: string | null;
  wasHelpful: boolean | null;
  isActive: boolean;
}

export default function SessionDetailsPage() {
  const params = useParams();
  const userId = params.id as string;
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/almanac/sessions/${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        setSession(data);
      } else {
        setError(data.error || "Error loading session");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = Math.floor((endDate.getTime() - startDate.getTime()) / 60000);
    return `${diff} minutes`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error || "Session not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/admin/users/${userId}/tutor`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sessions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Session Details</h1>
            <p className="text-gray-500">Session ID: {sessionId}</p>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">User Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium">{session.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{session.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">User ID:</span>
              <span className="font-mono text-xs">{session.user.id}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Lesson Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Lesson:</span>
              <span className="font-medium">{session.lesson.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Unit:</span>
              <span className="font-medium">{session.lesson.unitName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Curriculum:</span>
              <span className="font-medium">
                {session.lesson.curriculumTitle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="font-semibold mb-4">Session Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Messages</p>
            <p className="text-2xl font-bold">{session.messageCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">User Messages</p>
            <p className="text-2xl font-bold text-blue-600">
              {session.userMessages}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tutor Messages</p>
            <p className="text-2xl font-bold text-purple-600">
              {session.tutorMessages}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-2xl font-bold">
              {formatDuration(session.startedAt, session.endedAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Feedback</p>
            <div className="mt-1">
              {session.wasHelpful === true && (
                <Badge className="bg-green-100 text-green-800">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Helpful
                </Badge>
              )}
              {session.wasHelpful === false && (
                <Badge className="bg-red-100 text-red-800">
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  Not Helpful
                </Badge>
              )}
              {session.wasHelpful === null && (
                <Badge variant="outline">No feedback</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="font-semibold mb-4">Timeline</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Started:</span>
            <span className="font-medium">{formatDate(session.startedAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Last Active:</span>
            <span className="font-medium">
              {formatDate(session.lastActive)}
            </span>
          </div>
          {session.endedAt && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Ended:</span>
              <span className="font-medium">{formatDate(session.endedAt)}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Status:</span>
            {session.isActive ? (
              <Badge className="bg-blue-100 text-blue-800">Active</Badge>
            ) : (
              <Badge variant="outline">Ended</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="border rounded-lg bg-white shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Conversation History
          </h3>
        </div>
        <div className="p-6 max-h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {session.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${message.role === "user" ? "order-2" : "order-1"}`}
                >
                  <div className="flex items-center mb-1 space-x-2">
                    {message.role === "user" ? (
                      <>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-600">
                          User
                        </span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-600">
                          Tutor
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </>
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-purple-50 border border-purple-200"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
