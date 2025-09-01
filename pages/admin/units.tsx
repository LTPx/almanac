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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Manage Units</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create a New Unit</h2>
          <form onSubmit={handleCreateUnit} className="flex items-center">
            <input
              type="text"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="Enter new unit name"
              className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-r-lg hover:bg-blue-700 transition duration-300"
            >
              Create Unit
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 p-6">Existing Units</h2>
          <ul className="divide-y divide-gray-200">
            {units.map((unit) => (
              <li key={unit.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span className="text-lg text-gray-800">{unit.name}</span>
                {/* Placeholder for future actions like edit/delete */}
                <div></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
