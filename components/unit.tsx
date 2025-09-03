"use client";

import { LessonButton } from "./lesson-button";


export default function Unit() {
  const lessons = [
    { id: 1, completed: true },
    { id: 2, completed: true },
    { id: 3, completed: false },
    { id: 4, completed: false },
    { id: 5, completed: false, locked: true },
  ];

  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      {lessons.map((lesson, index) => (
        <LessonButton
          key={lesson.id}
          id={lesson.id}
          index={index}
          totalCount={lessons.length - 1}
          locked={lesson.locked}
          current={!lesson.completed && !lesson.locked}
          completed={lesson.completed}
        />
      ))}
    </div>
  );
}
