import { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { MainStatList } from '../types';
import characterUtils from '../utils/characterUtils';
import relicData from '../data/relicData.json';
import { FiTrash2, FiCheck } from 'react-icons/fi';

export default function EditWeights() {
  const { store, updateCharacter } = useStore();
  const { createNewWeightPreset, addWeightPreset, getCurrentWeightPreset, removeWeightPreset, setActivePreset } = characterUtils();
  
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [presetName, setPresetName] = useState<string>('');
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [mainStats, setMainStats] = useState<MainStatList>({});
  const [relicSets, setRelicSets] = useState<string[]>([]);
  const [ornamentSets, setOrnamentSets] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  // Get the selected character
  const selectedCharacter = selectedCharacterId
    ? store.characters.find(c => c.id === selectedCharacterId)
    : null;
    
  // Get all presets for the selected character
  const characterPresets = selectedCharacter 
    ? [selectedCharacter.defaultWeights, ...selectedCharacter.weightPresets]
    : [];

  // Load current weights when character changes
  useEffect(() => {
    if (selectedCharacterId) {
      const currentPreset = getCurrentWeightPreset(selectedCharacterId, store);
      if (currentPreset) {
        setWeights({...currentPreset.weights});
        setMainStats({...currentPreset.mainStats});
        setRelicSets(currentPreset.sets.relic || []);
        setOrnamentSets(currentPreset.sets.ornament || []);
        setPresetName('');
      }
    } else {
      // Reset form when no character is selected
      resetForm();
    }
  }, [selectedCharacterId, store]);

  const resetForm = () => {
    setWeights({});
    setMainStats({});
    setRelicSets([]);
    setOrnamentSets([]);
    setPresetName('');
    setMessage({ text: '', type: '' });
  };

  const handleWeightChange = (statName: string, value: number) => {
    setWeights(prev => ({
      ...prev,
      [statName]: value
    }));
  };

  const handleMainStatChange = (relicType: 'Chest' | 'Feet' | 'Orb' | 'Rope', statName: string, checked: boolean) => {
    setMainStats(prev => {
      const currentStats = prev[relicType] || [];
      const newStats = checked
        ? [...currentStats, statName]
        : currentStats.filter(stat => stat !== statName);
      
      return {
        ...prev,
        [relicType]: newStats
      };
    });
  };

  const handleRelicSetChange = (setName: string, checked: boolean) => {
    setRelicSets(prev => 
      checked 
        ? [...prev, setName]
        : prev.filter(set => set !== setName)
    );
  };

  const handleOrnamentSetChange = (setName: string, checked: boolean) => {
    setOrnamentSets(prev => 
      checked 
        ? [...prev, setName]
        : prev.filter(set => set !== setName)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCharacterId) {
      setMessage({ text: 'Please select a character', type: 'error' });
      return;
    }

    if (!presetName.trim()) {
      setMessage({ text: 'Please enter a preset name', type: 'error' });
      return;
    }

    // Create new weight preset
    const newPreset = createNewWeightPreset(
      presetName,
      weights,
      mainStats,
      { relic: relicSets, ornament: ornamentSets },
      false
    );

    // Add preset to character
    const updatedCharacter = addWeightPreset(selectedCharacterId, newPreset, store);
    
    if (updatedCharacter) {
      updateCharacter(updatedCharacter);
      setMessage({ text: `Preset "${presetName}" created successfully!`, type: 'success' });
      setPresetName('');
    } else {
      setMessage({ text: 'Failed to create preset. Preset name may already exist.', type: 'error' });
    }
  };
  
  const handleSetActivePreset = (presetId: string) => {
    if (!selectedCharacterId) return;
    
    const updatedCharacter = setActivePreset(selectedCharacterId, presetId, store);
    
    if (updatedCharacter) {
      updateCharacter(updatedCharacter);
      setMessage({ text: 'Active preset updated successfully!', type: 'success' });
    } else {
      setMessage({ text: 'Failed to update active preset.', type: 'error' });
    }
  };
  
  const handleDeletePreset = (presetId: string) => {
    if (!selectedCharacterId) return;
    
    const updatedCharacter = removeWeightPreset(selectedCharacterId, presetId, store);
    
    if (updatedCharacter) {
      updateCharacter(updatedCharacter);
      setMessage({ text: 'Preset deleted successfully!', type: 'success' });
    } else {
      setMessage({ text: 'Failed to delete preset.', type: 'error' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Edit Weights</h2>
      <p className="text-gray-600 mb-6">Create, manage, and select custom weight presets for your characters to optimize relic scoring.</p>
      
      {/* Character Selection */}
      <div className="mb-6">
        <label htmlFor="character-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Character
        </label>
        <select
          id="character-select"
          className="w-full p-2 border border-gray-300 rounded"
          value={selectedCharacterId}
          onChange={(e) => setSelectedCharacterId(e.target.value)}
        >
          <option value="">Select a character</option>
          {store.characters.map(character => (
            <option key={character.id} value={character.id}>{character.name}</option>
          ))}
        </select>
      </div>

      {selectedCharacter && (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Manage Presets</h3>
          <div className="bg-gray-50 p-4 rounded mb-6">
            {characterPresets.length > 0 ? (
              <div className="space-y-2">
                {characterPresets.map(preset => (
                  <div key={preset.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                    <div className="flex items-center">
                      <span className={`mr-2 ${preset.id === selectedCharacter.activePresetId ? 'font-semibold text-blue-600' : ''}`}>
                        {preset.name} {preset.isDefault && <span className="text-xs text-gray-500">(Default)</span>}
                      </span>
                      {preset.id === selectedCharacter.activePresetId && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Active</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {preset.id !== selectedCharacter.activePresetId && (
                        <button
                          type="button"
                          onClick={() => handleSetActivePreset(preset.id)}
                          className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                          title="Set as active preset"
                        >
                          <FiCheck size={18} />
                        </button>
                      )}
                      {!preset.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeletePreset(preset.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete preset"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No presets available.</p>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Preset Name */}
          <div className="mb-6">
            <label htmlFor="preset-name" className="block text-sm font-medium text-gray-700 mb-2">
              Preset Name
            </label>
            <input
              id="preset-name"
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name"
            />
          </div>

          {/* Stat Weights */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Stat Weights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relicData.allStats.subStats.map(statName => (
                <div key={statName} className="flex items-center">
                  <label className="flex-grow text-sm">{statName}</label>
                  <input
                    type="number"
                    className="w-20 p-1 border border-gray-300 rounded"
                    value={weights[statName] || 0}
                    onChange={(e) => handleWeightChange(statName, parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Main Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Recommended Main Stats</h3>
            
            {/* Chest */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Chest</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {relicData.allStats.mainStats.Chest.map(statName => (
                  <div key={statName} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`chest-${statName}`}
                      checked={(mainStats.Chest || []).includes(statName)}
                      onChange={(e) => handleMainStatChange('Chest', statName, e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={`chest-${statName}`} className="text-sm">{statName}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Feet */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Feet</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {relicData.allStats.mainStats.Feet.map(statName => (
                  <div key={statName} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`feet-${statName}`}
                      checked={(mainStats.Feet || []).includes(statName)}
                      onChange={(e) => handleMainStatChange('Feet', statName, e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={`feet-${statName}`} className="text-sm">{statName}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Orb */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Orb</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {relicData.allStats.mainStats.Orb.map(statName => (
                  <div key={statName} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`orb-${statName}`}
                      checked={(mainStats.Orb || []).includes(statName)}
                      onChange={(e) => handleMainStatChange('Orb', statName, e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={`orb-${statName}`} className="text-sm">{statName}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rope */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Rope</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {relicData.allStats.mainStats.Rope.map(statName => (
                  <div key={statName} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`rope-${statName}`}
                      checked={(mainStats.Rope || []).includes(statName)}
                      onChange={(e) => handleMainStatChange('Rope', statName, e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={`rope-${statName}`} className="text-sm">{statName}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Relic Sets */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Recommended Relic Sets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {relicData.relicSets.map(set => (
                <div key={set.internalName} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`relic-${set.internalName}`}
                    checked={relicSets.includes(set.internalName)}
                    onChange={(e) => handleRelicSetChange(set.internalName, e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`relic-${set.internalName}`} className="text-sm">{set.displayName}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Ornament Sets */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Recommended Ornament Sets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {relicData.ornamentSets.map(set => (
                <div key={set.internalName} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`ornament-${set.internalName}`}
                    checked={ornamentSets.includes(set.internalName)}
                    onChange={(e) => handleOrnamentSetChange(set.internalName, e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`ornament-${set.internalName}`} className="text-sm">{set.displayName}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Preset
            </button>
          </div>
        </form>
      </div>
      )}

      {!selectedCharacter && (
        <div className="text-center p-6 bg-gray-50 rounded">
          <p className="text-gray-500">Please select a character to create a weight preset.</p>
        </div>
      )}
    </div>
  );
}
