import { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Character, RelicType } from '../types';
import relicData from '../data/relicData.json';

export default function CharactersPage() {
  const { store, addCharacter, updateCharacter, equipRelic, unequipRelic } = useStore();
  const [name, setName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  const { relicTypes } = relicData;
  
  const handleAddCharacter = () => {
    if (!name.trim()) return;
    
    const newCharacter: Character = {
      id: crypto.randomUUID(),
      name: name.trim(),
      equippedRelics: {}
    };
    
    addCharacter(newCharacter);
    setName('');
  };
  
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };
  
  const handleEquipRelic = (relicType: RelicType, relicId: string) => {
    if (!selectedCharacter) return;
    
    equipRelic(selectedCharacter.id, relicId, relicType);
    
    // Update the selected character
    const updatedCharacter = store.characters.find(c => c.id === selectedCharacter.id);
    if (updatedCharacter) {
      setSelectedCharacter(updatedCharacter);
    }
  };
  
  const handleUnequipRelic = (relicType: RelicType) => {
    if (!selectedCharacter) return;
    
    unequipRelic(selectedCharacter.id, relicType);
    
    // Update the selected character
    const updatedCharacter = store.characters.find(c => c.id === selectedCharacter.id);
    if (updatedCharacter) {
      setSelectedCharacter(updatedCharacter);
    }
  };
  
  // Get available relics (not equipped by other characters)
  const getAvailableRelics = (relicType: RelicType) => {
    const equippedRelicIds = store.characters
      .filter(c => c.id !== selectedCharacter?.id) // Exclude current character
      .map(c => c.equippedRelics[relicType])
      .filter(Boolean) as string[];
    
    return store.relics.filter(relic => 
      relic.type === relicType && !equippedRelicIds.includes(relic.id)
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Character Management</h1>
      
      {/* Add Character Form */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Add New Character</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Character Name"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button 
            onClick={handleAddCharacter}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Character
          </button>
        </div>
      </div>
      
      {/* Character List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {store.characters.map(character => (
          <div 
            key={character.id} 
            className={`p-4 border rounded cursor-pointer ${selectedCharacter?.id === character.id ? 'border-blue-500 bg-blue-50' : ''}`}
            onClick={() => handleSelectCharacter(character)}
          >
            <h3 className="font-semibold">{character.name}</h3>
            <p className="text-sm text-gray-600">
              Equipped Relics: {Object.keys(character.equippedRelics).length}/6
            </p>
          </div>
        ))}
      </div>
      
      {/* Equip Relics Section */}
      {selectedCharacter && (
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Equip Relics for {selectedCharacter.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relicTypes.map(relicType => {
              const equippedRelicId = selectedCharacter.equippedRelics[relicType as RelicType];
              const equippedRelic = equippedRelicId 
                ? store.relics.find(r => r.id === equippedRelicId)
                : null;
              const availableRelics = getAvailableRelics(relicType as RelicType);
              
              return (
                <div key={relicType} className="p-3 border rounded">
                  <h3 className="font-semibold">{relicType}</h3>
                  
                  {equippedRelic ? (
                    <div className="mt-2 p-2 bg-green-50 rounded">
                      <p><span className="font-medium">Equipped</span></p>
                      <button
                        onClick={() => handleUnequipRelic(relicType as RelicType)}
                        className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Unequip
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-gray-500 mb-2">No relic equipped</p>
                      
                      {availableRelics.length > 0 ? (
                        <select 
                          className="w-full p-2 border rounded"
                          onChange={(e) => handleEquipRelic(relicType as RelicType, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Select a relic</option>
                          {availableRelics.map(relic => (
                            <option key={relic.id} value={relic.id}>
                              {relic.type} - {relic.set}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-orange-500">No available relics of this type</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {store.characters.length === 0 && (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-lg">No characters found. Add a character to get started!</p>
        </div>
      )}
    </div>
  );
}