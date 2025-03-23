import { useState, useMemo } from 'react';
import relicData from '../../data/relicData.json';
import { AppStore, Character, Relic, RelicType } from '../../types';
import { FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';
import characterUtils from '../../utils/characterUtils';
import { calculateRelicScore } from '../../utils/relicScoring';
import React from 'react';
import Portait from '../Utils/Portrait';
import RelicScoreDisplay from './RelicScoreDisplay';

interface RelicsTableProps {
  store: AppStore;
  onRelicClick?: (relic: Relic) => void;
  onCharacterSelect?: (characterId: string | null) => void;
  selectedCharacterId?: string | null;
}

export default function RelicsTable({
  store, 
  onRelicClick,
  onCharacterSelect,
  selectedCharacterId: propSelectedCharacterId
}: RelicsTableProps) {
  const { getCurrentWeightFromCharacter } = characterUtils();

  const [selectedTypes, setSelectedTypes] = useState<Set<RelicType>>(new Set(relicData.relicTypes as RelicType[]));
  const [localSelectedCharacterId, setLocalSelectedCharacterId] = useState<string | null>(null);
  
  // Use either the prop value (if provided) or the local state
  const selectedCharacterId = propSelectedCharacterId !== undefined ? propSelectedCharacterId : localSelectedCharacterId;
  
  // Update both local state and parent component if prop is provided
  const handleCharacterSelect = (characterId: string | null) => {
    setLocalSelectedCharacterId(characterId);
    if (onCharacterSelect) {
      onCharacterSelect(characterId);
    }
  };
  const [selectedRelicId, setSelectedRelicId] = useState<string | null>(null);
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set(
    [...relicData.relicSets, ...relicData.ornamentSets].map(set => set.internalName)
  ));

  const [isSetDropdownOpen, setIsSetDropdownOpen] = useState<boolean>(false);

  const selectedCharacter = useMemo(() => {
    return selectedCharacterId
      ? store.characters.find(c => c.id === selectedCharacterId)
      : null;
  }, [selectedCharacterId, store.characters]);

  const filteredRelics = useMemo(() => {
    return store.relics.filter(relic => 
      selectedTypes.has(relic.type) && 
      selectedSets.has(relic.set)
    );
  }, [store.relics, selectedTypes, selectedSets]);

  const toggleAllSets = (value: boolean) => {
    if (value) {
      // Select all sets
      setSelectedSets(new Set(
        [...relicData.relicSets, ...relicData.ornamentSets].map(set => set.internalName)
      ));
    } else {
      // Deselect all sets
      setSelectedSets(new Set());
    }
  };

  const toggleSetFilter = (setId: string) => {
    setSelectedSets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(setId)) {
        newSet.delete(setId);
      } else {
        newSet.add(setId);
      }
      return newSet;
    });
  };

  const toggleTypeFilter = (type: RelicType) => {
      setSelectedTypes(prev => {
        const newSet = new Set(prev);
          if (newSet.has(type)) {
            newSet.delete(type);
          } else {
            newSet.add(type);
          }
        return newSet;
      });
  };

  const toggleRelicSelection = (relicId: string) => {
    setSelectedRelicId(prevId => prevId === relicId ? null : relicId);
  };

  const getEquippedCharacter = (relicId: string): Character | null => {
    const character = store.characters.find(char => {
      return Object.values(char.equippedRelics).includes(relicId);
    });
    return character || null;
  };

  const getRelicScore = (relic: Relic) => {
    if (!selectedCharacter) return null;
    const relicType = relic.type;

    const weights = getCurrentWeightFromCharacter(selectedCharacter);
    if (!weights || !weights.perfectRelics) return null;

    const perfectOfType = weights.perfectRelics[relicType];
    if (!perfectOfType) return null;

    return calculateRelicScore(relic, perfectOfType, selectedCharacter);
  };

  return (
      <div className="flex-grow">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Relics</h2>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-medium mr-2">Filter by type:</span>
                {relicData.relicTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type as RelicType)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedTypes.has(type as RelicType) 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsSetDropdownOpen(!isSetDropdownOpen)}
                  className="flex items-center px-3 py-2 border rounded-md bg-white hover:bg-gray-50"
                >
                  <span className="mr-2">Filter by set</span>
                  {isSetDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                
                {isSetDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-64 bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
                    <div className="p-2 border-b sticky top-0 bg-white z-20">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Relic Sets</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleAllSets(true)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Select All
                          </button>
                          <button 
                            onClick={() => toggleAllSets(false)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2 border-b">
                      <div className="font-medium mb-1">Relic Sets</div>
                      {relicData.relicSets.map((set) => (
                        <div key={set.internalName} className="flex items-center py-1">
                          <button
                            onClick={() => toggleSetFilter(set.internalName)}
                            className="flex items-center w-full hover:bg-gray-50 px-2 py-1 rounded"
                          >
                            <div className="w-5 h-5 flex items-center justify-center border rounded mr-2 bg-white">
                              {selectedSets.has(set.internalName) && <FiCheck className="text-blue-500" />}
                            </div>
                            <span className="text-sm">{set.displayName}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-2">
                      <div className="font-medium mb-1">Ornament Sets</div>
                      {relicData.ornamentSets.map((set) => (
                        <div key={set.internalName} className="flex items-center py-1">
                          <button
                            onClick={() => toggleSetFilter(set.internalName)}
                            className="flex items-center w-full hover:bg-gray-50 px-2 py-1 rounded"
                          >
                            <div className="w-5 h-5 flex items-center justify-center border rounded mr-2 bg-white">
                              {selectedSets.has(set.internalName) && <FiCheck className="text-blue-500" />}
                            </div>
                            <span className="text-sm">{set.displayName}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <label htmlFor="character-select" className="mr-2 font-medium">Score for:</label>
                <select
                  id="character-select"
                  className="border rounded p-2"
                  value={selectedCharacterId || ''}
                  onChange={(e) => handleCharacterSelect(e.target.value || null)}
                >
                  <option value="">Select a character</option>
                  {store.characters.map(character => (
                    <option key={character.id} value={character.id}>{character.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredRelics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Set
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Equipped
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRelics.map((relic) => {
                    const equippedCharacter = getEquippedCharacter(relic.id);
                    const scoreResult = selectedCharacter ? getRelicScore(relic) : null;
                    
                    return (
                      <React.Fragment key={relic.id}>
                        <tr 
                          className={`${selectedRelicId === relic.id ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer`}
                          onClick={() => {
                            toggleRelicSelection(relic.id);
                            if (onRelicClick) {
                              onRelicClick(relic);
                            }
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full">{
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full overflow-hidden">
                                <Portait portraitID={relic.set} type="Set"
                                  />
                              </div>
                              }</div>    
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Portait portraitID={relic.set} type="Piece" piece={relic.type} />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {equippedCharacter && (
                              <div className="flex items-center">
                                <Portait portraitID={equippedCharacter.id} type="Character" />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {equippedCharacter.name}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <RelicScoreDisplay scoreResult={scoreResult} />
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No relics found. Add a relic to get started!</p>
          )}
        </div>
      </div>
  );
}