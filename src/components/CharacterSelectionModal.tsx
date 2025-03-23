import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import gameData from '../data/gameData.json';
import { AppStore, Character, GameCharacterEntry } from '../types';
import { useStore } from '../store/StoreContext';
import characterUtils from '../utils/characterUtils';

interface CharacterSelectionModalProps {
  store: AppStore;
  isOpen: boolean;
  onClose: () => void;
  existingCharacters: Character[];
}

export default function CharacterSelectionModal({
  isOpen,
  onClose,
  existingCharacters,
}: CharacterSelectionModalProps) {
  const { addCharacter } = useStore();
  const { createCharacter } = characterUtils();

  const [characters, setCharacters] = useState<GameCharacterEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Convert characters object from gameData to an array
    const characterArray : GameCharacterEntry[] = Object.values(gameData.characters);
    setCharacters(characterArray);
  }, []);

  // Filter characters based on search term
  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle character selection
  const handleSelectCharacter = (character: GameCharacterEntry) => {
    // Check if character already exists
    const characterExists = existingCharacters.some(
      existingChar => existingChar.name.toLowerCase() === character.name.toLowerCase()
    );
    
    if (characterExists) {
      alert(`Character ${character.name} already exists!`);
      return;
    }

    const newCharacter = createCharacter(character.id);
    addCharacter(newCharacter);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Select a Character</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search characters..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Character Grid */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {filteredCharacters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCharacters.map((character) => (
                <div
                  key={character.id}
                  className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => handleSelectCharacter(character)}
                >
                  {/* Character Element Badge */}
                  <div
                    className={`w-full h-40 mb-2 rounded-lg flex items-center justify-center ${
                      getElementColor(character.element)
                    }`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {character.element}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {/* Rarity Stars */}
                    <div className="flex">
                      {Array.from({ length: character.rarity }).map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                  <span className="font-medium text-center mt-1">{character.name}</span>
                  <span className="text-xs text-gray-500">{character.path}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No characters found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get background color based on element
function getElementColor(element: string): string {
  const elementColors: Record<string, string> = {
    Fire: 'bg-red-500',
    Ice: 'bg-blue-400',
    Wind: 'bg-green-400',
    Lightning: 'bg-purple-500',
    Physical: 'bg-gray-500',
    Quantum: 'bg-indigo-600',
    Imaginary: 'bg-yellow-500',
  };

  return elementColors[element] || 'bg-gray-300';
}