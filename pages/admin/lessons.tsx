import { useState, useEffect } from 'react';

export default function LessonsAdmin() {
  const [lessons, setLessons] = useState([]);
  const [newLessonName, setNewLessonName] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetch('/api/units')
      .then((res) => res.json())
      .then((data) => setUnits(data));

    fetch('/api/lessons')
      .then((res) => res.json())
      .then((data) => setLessons(data));
  }, []);

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newLessonName, unitId: selectedUnit }),
    });
    if (res.ok) {
      const newLesson = await res.json();
      setLessons([...lessons, newLesson]);
      setNewLessonName('');
    }
  };

  return (
    <div>
      <h1>Lessons</h1>
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id}>{lesson.name}</li>
        ))}
      </ul>
      <form onSubmit={handleCreateLesson}>
        <input
          type="text"
          value={newLessonName}
          onChange={(e) => setNewLessonName(e.target.value)}
          placeholder="New lesson name"
        />
        <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
          <option value="">Select a unit</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
