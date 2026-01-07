"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface Session {
  id: string;
  lesson: {
    id: number;
    name: string;
    unitName: string;
    curriculumTitle: string;
  };
  messageCount: number;
  userMessages: number;
  tutorMessages: number;
  startedAt: string;
  lastActive: string;
  endedAt: string | null;
  wasHelpful: boolean | null;
  isActive: boolean;
}

export default function UserTutorStatsPage() {
  const params = useParams();
  const userId = params.id as string;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTutorData();
  }, [userId]);

  const fetchTutorData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch stats
      const statsResponse = await fetch(
        `/api/almanac/sessions?userId=${userId}&stats=true`
      );

      // Fetch sessions
      const sessionsResponse = await fetch(
        `/api/almanac/sessions?userId=${userId}`
      );
      const sessionsData = await sessionsResponse.json();

      if (statsResponse.ok && sessionsResponse.ok) {
        setSessions(sessionsData.sessions);
      } else {
        setError("Error loading tutor data");
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

  const formatDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = Math.floor((endDate.getTime() - startDate.getTime()) / 60000);
    return `${diff} min`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading tutor statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Almanac Tutor Statistics</h1>
            <p className="text-gray-500">User ID: {userId}</p>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <Card className="p-4">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Sessions</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lesson</TableHead>
              <TableHead>Unit / Curriculum</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No tutor sessions found
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {session.lesson.name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    <div>{session.lesson.unitName}</div>
                    <div className="text-xs text-gray-400">
                      {session.lesson.curriculumTitle}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span>{session.messageCount}</span>
                      <span className="text-xs text-gray-400">
                        ({session.userMessages}↑ {session.tutorMessages}↓)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDuration(session.startedAt, session.endedAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(session.startedAt)}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {session.isActive ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Ended</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${userId}/tutor/${session.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
