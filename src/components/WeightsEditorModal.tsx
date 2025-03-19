import { useState, useEffect } from 'react';
import { Character } from '../types';

interface WeightsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onSave: (weights: Record<string, number>) => void;
}

export default function WeightsEditorModal({ isOpen, onClose, character, onSave }: WeightsEditorModalProps) {
  // Define default weights outside to avoid recreating on each render
  const defaultWeights = {
    "ATK%": 0,
    "DEF%": 0,
    "SPD": 0,
    "Crit Rate%": 0,
    "Crit DMG%": 0,
    "Effect Hit Rate%": 0,
    "Effect RES%": 0,
    "Break Effect%": 0,
    "Energy Regen Rate%": 0,
    "Outgoing Healing Boost%": 0,
    "Physical DMG": 0,
    "Fire DMG": 0,
    "Ice DMG": 0,
    "Wind DMG": 0,
    "Lightning DMG": 0,
    "Quantum DMG": 0,
    "Imaginary DMG": 0
  };
  
  // Initialize with character weights or empty object if character is null
  const [weights, setWeights] = useState<Record<string, number>>({});
  
  // Update weights whenever character changes
  useEffect(() => {
    if (!character) return;
    // Always use character weights if they exist, only fall back to defaults if necessary
    setWeights(character.weights || defaultWeights);
  }, [character]);

  const handleWeightChange = (stat: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setWeights(prev => ({
      ...prev,
      [stat]: numValue
    }));
  };

  const handleSubmit = () => {
    console.log(character);
    onSave(weights);
    onClose();
  };

  if (!isOpen || !character) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Edit Weights for {character.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(weights).map(([stat, value]) => (
            <div key={stat} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">{stat}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleWeightChange(stat, e.target.value)}
                className="border rounded p-2"
                step="0.1"
                min="0"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}