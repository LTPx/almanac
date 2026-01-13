"use client";

import { useState, useEffect, JSX } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  // ThumbsUp,
  // ThumbsDown,
  User,
  Bot
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // const formatDuration = (start: string, end: string | null) => {
  //   const startDate = new Date(start);
  //   const endDate = end ? new Date(end) : new Date();
  //   const diff = Math.floor((endDate.getTime() - startDate.getTime()) / 60000);
  //   return `${diff} minutes`;
  // };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">{error || "Session not found"}</p>
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
            <p className="text-muted-foreground">Session ID: {sessionId}</p>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">User Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{session.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{session.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-xs">{session.user.id}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Lesson Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lesson:</span>
              <span className="font-medium">
                {session.lesson ? session.lesson.name : "No lesson"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit:</span>
              <span className="font-medium">
                {session.lesson ? session.lesson.unitName : "No unit"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Curriculum:</span>
              <span className="font-medium">
                {session.lesson
                  ? session.lesson.curriculumTitle
                  : "No curriculum"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Session Stats */}
      {/* <Card className="p-4">
        <h3 className="font-semibold mb-4">Session Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Messages</p>
            <p className="text-2xl font-bold">{session.messageCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">User Messages</p>
            <p className="text-2xl font-bold text-blue-600">
              {session.userMessages}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tutor Messages</p>
            <p className="text-2xl font-bold text-purple-600">
              {session.tutorMessages}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold">
              {formatDuration(session.startedAt, session.endedAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Feedback</p>
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
      </Card> */}

      {/* Timeline */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Timeline</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Started:</span>
            <span className="font-medium">{formatDate(session.startedAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last Active:</span>
            <span className="font-medium">
              {formatDate(session.lastActive)}
            </span>
          </div>
          {session.endedAt && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Ended:</span>
              <span className="font-medium">{formatDate(session.endedAt)}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Status:</span>
            {session.isActive ? (
              <Badge className="bg-blue-100 text-blue-800">Active</Badge>
            ) : (
              <Badge variant="outline">Ended</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Conversation */}
      <Card>
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
                        <span className="text-xs text-muted-foreground">
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
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </>
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-100 border border-blue-200 text-black"
                        : "bg-neutral-700 border border-neutral-600 text-gray-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {renderMessageWithLinks(message.content)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
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
