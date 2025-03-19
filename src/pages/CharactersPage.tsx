import { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { Character, RelicType } from '../types';
import relicData from '../data/relicData.json';
import gameData from '../data/gameData.json';
import CharacterSelectionModal from '../components/CharacterSelectionModal';
import WeightsEditorModal from '../components/WeightsEditorModal';
import { FiTrash2, FiInfo } from 'react-icons/fi';

export default function CharactersPage() {
  const { store, addCharacter, updateCharacter, deleteCharacter, equipRelic, unequipRelic } = useStore();
  // No longer need selectedCharacterName state as characters are added directly from modal
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  
  const { relicTypes } = relicData;
  
  // Character addition is now handled directly in the modal
  
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };
  
  const handleDeleteCharacter = (characterId: string) => {
    // Set the character to delete for confirmation
    setCharacterToDelete(characterId);
  };

  const handleEditWeights = (character: Character) => {
    setEditingCharacter(character);
    setIsWeightsModalOpen(true);
  };

  const handleSaveWeights = (weights: Record<string, number>) => {
    if (editingCharacter) {
      const updatedCharacter = {
        ...editingCharacter,
        weights
      };
      updateCharacter(updatedCharacter);
    }
  };

  const areAllWeightsZero = (weights?: Record<string, number>) => {
    if (!weights) return false;
    return Object.values(weights).every(value => value === 0);
  };
  
  const confirmDeleteCharacter = () => {
    if (characterToDelete) {
      // Delete the character
      deleteCharacter(characterToDelete);
      
      // If the deleted character was selected, clear the selection
      if (selectedCharacter && selectedCharacter.id === characterToDelete) {
        setSelectedCharacter(null);
      }
      
      // Clear the confirmation state
      setCharacterToDelete(null);
    }
  };
  
  const cancelDeleteCharacter = () => {
    // Clear the confirmation state
    setCharacterToDelete(null);
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
      
      {/* Add Character Button */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Add New Character</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Select a character to add
        </button>
      </div>
      
      {/* Character Selection Modal */}
      <CharacterSelectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectCharacter={(name) => {}} // Keep for backward compatibility
        addCharacter={addCharacter}
        existingCharacters={store.characters}
      />
      
      {/* Character List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {store.characters.map(character => (
          <div 
            key={character.id} 
            className={`p-4 border rounded ${selectedCharacter?.id === character.id ? 'border-blue-500 bg-blue-50' : ''} ${areAllWeightsZero(character.weights) ? 'border-red-500' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div 
                className="cursor-pointer flex-grow"
                onClick={() => handleSelectCharacter(character)}
              >
                <h3 className="font-semibold">{character.name}</h3>
                <p className="text-sm text-gray-600">
                  Equipped Relics: {Object.keys(character.equippedRelics).length}/6
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditWeights(character);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                  title="Edit weights"
                >
                  <FiInfo size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCharacter(character.id);
                  }}
                  className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                  title="Delete character"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Delete Confirmation Dialog */}
      {characterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this character? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteCharacter}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCharacter}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Weights Editor Modal */}
      <WeightsEditorModal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
        character={editingCharacter!}
        onSave={handleSaveWeights}
      />

      {store.characters.length === 0 && (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-lg">No characters found. Add a character to get started!</p>
        </div>
      )}
    </div>
  );
}