import { useState, useEffect } from 'react';

export default function UnitsAdmin() {
  const [units, setUnits] = useState([]);
  const [newUnitName, setNewUnitName] = useState('');

  useEffect(() => {
    fetch('/api/units')
      .then((res) => res.json())
      .then((data) => setUnits(data));
  }, []);

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newUnitName }),
    });
    if (res.ok) {
      const newUnit = await res.json();
      setUnits([...units, newUnit]);
      setNewUnitName('');
    }
  };

  return (
    <div>
      <h1>Units</h1>
      <ul>
        {units.map((unit) => (
          <li key={unit.id}>{unit.name}</li>
        ))}
      </ul>
      <form onSubmit={handleCreateUnit}>
        <input
          type="text"
          value={newUnitName}
          onChange={(e) => setNewUnitName(e.target.value)}
          placeholder="New unit name"
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
