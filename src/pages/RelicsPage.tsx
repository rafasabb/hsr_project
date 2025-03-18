import { useState, useEffect } from 'react';
import { FiInfo, FiTrash } from 'react-icons/fi';
import { useStore } from '../store/StoreContext';
import { Relic, RelicType, Stat } from '../types';
import relicData from '../data/relicData.json';

type SubStatRanges = {
  [key: string]: { min: number; max: number };
};

const { relicTypes, relicSets, allStats, mainStatValues, subStatRanges } = relicData as {
  relicTypes: string[];
  relicSets: Array<{ internalName: string; displayName: string }>;
  allStats: { mainStats: Record<string, string[]>; subStats: string[] };
  mainStatValues: Record<string, number>;
  subStatRanges: SubStatRanges;
};

const initialStatState: Stat = { name: '', value: 0 };

export default function RelicsPage() {
  const { store, addRelic, deleteRelic } = useStore();
  
  const [type, setType] = useState<RelicType>('Hand');
  const [set, setSet] = useState<string>(relicSets[0].internalName);
  const [mainStat, setMainStat] = useState<Stat>(initialStatState);
  const [subStats, setSubStats] = useState<Stat[]>(Array(4).fill({ ...initialStatState }));
  const [invalidSubStats, setInvalidSubStats] = useState<boolean[]>(Array(4).fill(false));
  
  // Get available main stats based on relic type
  const getAvailableMainStats = () => {
    return allStats.mainStats[type] || [];
  };

  // Get available sub stats (excluding main stat and already selected sub stats)
  const getAvailableSubStats = (currentIndex: number) => {
    const usedStats = [mainStat.name];
    
    // Add all other selected sub stats except the current one
    subStats.forEach((stat, index) => {
      if (index !== currentIndex && stat.name) {
        usedStats.push(stat.name);
      }
    });
    
    // Filter out used stats
    return allStats.subStats.filter(stat => !usedStats.includes(stat));
  };
  
  const handleMainStatChange = (field: keyof Stat, value: string) => {
    if (field === 'name') {
      // When main stat changes, reset sub stats that have the same name
      setSubStats(prev => {
        return prev.map(stat => {
          if (stat.name === value) {
            return { ...initialStatState };
          }
          return stat;
        });
      });
      
      // Set the fixed value for the selected main stat
      const fixedValue = mainStatValues[value as keyof typeof mainStatValues] || 0;
      setMainStat(prev => ({
        ...prev,
        name: value,
        value: fixedValue
      }));
    } else {
      // For other fields (which shouldn't happen for value since it's fixed)
      // setMainStat(prev => ({...prev,[field]: field === 'value' ? parseFloat(value) : value as string}));
    }
  };
  
  const handleSubStatChange = (index: number, field: keyof Stat, value: string) => {
    if (field === 'name') {
      // Check if this stat is already used
      const isUsed = mainStat.name === value || 
        subStats.some((stat, i) => i !== index && stat.name === value);
      
      if (isUsed) {
        alert(`The stat "${value}" is already used. Please select a different stat.`);
        return;
      }
      
      // Reset invalid state when changing stat name
      setInvalidSubStats(prev => {
        const newInvalidSubStats = [...prev];
        newInvalidSubStats[index] = false;
        return newInvalidSubStats;
      });
    } else if (field === 'value' && subStats[index].name) {
      // Check if value is within the allowed range, but don't prevent input
      const statName = subStats[index].name;
      const numValue = Number(value);
      const range = subStatRanges[statName];
      
      // Update invalid state based on range check
      if (range) {
        setInvalidSubStats(prev => {
          const newInvalidSubStats = [...prev];
          newInvalidSubStats[index] = numValue < range.min || numValue > range.max;
          return newInvalidSubStats;
        });
      }
    }
    
    setSubStats(prev => {
      const newSubStats = [...prev];
      newSubStats[index] = {
        ...newSubStats[index],
        [field]: field === 'value' ? Number(value) : value
      };
      return newSubStats;
    });
  };
  
  // Set main stat when relic type changes
  useEffect(() => {
    // For Hand and Head, automatically set the main stat name since they only have one option
    if (type === 'Hand') {
      setMainStat({ name: 'ATK', value: mainStatValues['ATK'] });
    } else if (type === 'Head') {
      setMainStat({ name: 'HP', value: mainStatValues['HP'] });
    } else {
      // For other types, reset the main stat
      setMainStat(initialStatState);
    }
  }, [type]);
  
  const handleAddRelic = () => {
    // Validate inputs
    if (!mainStat.name.trim() || mainStat.value <= 0) {
      alert('Please fill in the main stat');
      return;
    }
    
    // Validate sub stats
    const validSubStats = subStats.filter(stat => stat.name.trim() && stat.value > 0);
    if (validSubStats.length < 4) {
      alert('Please fill in all 4 sub stats');
      return;
    }
    
    // Check if any substat has invalid values
    const hasInvalidValues = subStats.some((stat, index) => {
      if (!stat.name.trim() || stat.value <= 0) return false; // Skip empty stats
      const range = subStatRanges[stat.name];
      return range && (stat.value < range.min || stat.value > range.max);
    });
    
    if (hasInvalidValues) {
      alert('One or more substats have invalid values. Please correct them before saving.');
      return;
    }
    
    // Check for duplicate stats
    const allStatNames = [mainStat.name, ...validSubStats.map(stat => stat.name)];
    const uniqueStatNames = new Set(allStatNames);
    
    if (uniqueStatNames.size !== allStatNames.length) {
      alert('A relic cannot have duplicate stats. Please ensure all stats are unique.');
      return;
    }
    
    // Validate main stat is allowed for this relic type
    if (!allStats.mainStats[type].includes(mainStat.name)) {
      alert(`"${mainStat.name}" is not a valid main stat for ${type} relics.`);
      return;
    }
    
    const newRelic: Relic = {
      id: crypto.randomUUID(),
      type,
      set,
      mainStat: mainStat,
      subStats: validSubStats
    };
    
    console.log(newRelic);
    
    addRelic(newRelic);
    
    // Reset form
    setMainStat(initialStatState);
    setSubStats(Array(4).fill({ ...initialStatState }));
    setSet(relicSets[0].internalName);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Relic Management</h1>
      
      {/* Add Relic Form */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Add New Relic</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Relic Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Relic Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RelicType)}
              className="w-full px-3 py-2 border rounded"
            >
              {relicTypes.map(relicType => (
                <option key={relicType} value={relicType}>
                  {relicType}
                </option>
              ))}
            </select>
          </div>
          
          {/* Relic Set */}
          <div>
            <label className="block text-sm font-medium mb-1">Relic Set</label>
            <select
              value={set}
              onChange={(e) => setSet(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              {relicSets.map(relicSet => (
                <option key={relicSet.internalName} value={relicSet.internalName}>
                  {relicSet.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Main Stat */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Main Stat</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Name</label>
              {(type === 'Hand' || type === 'Head') ? (
                <div className="w-full px-3 py-2 border rounded bg-gray-50">
                  {mainStat.name}
                </div>
              ) : (
                <select
                  value={mainStat.name}
                  onChange={(e) => handleMainStatChange('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select Main Stat</option>
                  {getAvailableMainStats().map(statName => (
                    <option key={statName} value={statName}>
                      {statName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium mb-1">Value</label>
              <div className="w-full px-3 py-2 border rounded bg-gray-50">
                {mainStat.value}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sub Stats */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Sub Stats</h3>
          {subStats.map((stat, index) => (
            <div key={index} className="flex gap-4 mb-2">
              <div className="flex-1">
                <select
                  value={stat.name}
                  onChange={(e) => handleSubStatChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  disabled={!mainStat.name} // Disable until main stat is selected
                >
                  <option value="">Select Sub Stat {index + 1}</option>
                  {getAvailableSubStats(index).map(statName => (
                    <option key={statName} value={statName}>
                      {statName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-32 relative">
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={stat.value}
                    onChange={(e) => handleSubStatChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    step="0.1"
                    className={`w-full px-3 py-2 border rounded ${invalidSubStats[index] ? 'border-red-500 text-red-500' : ''}`}
                    disabled={!stat.name} // Disable until stat name is selected
                  />
                  {invalidSubStats[index] && (
                    <div className="absolute right-2 text-red-500 cursor-help" title={`Valid range: ${subStatRanges[stat.name].min} - ${subStatRanges[stat.name].max}`}>
                      <FiInfo size={16} />
                    </div>
                  )}
                </div>
                {stat.name && subStatRanges[stat.name] && (
                  <div className={`text-xs mt-1 ${invalidSubStats[index] ? 'text-red-500' : 'text-gray-500'}`}>
                    Range: {subStatRanges[stat.name].min} - {subStatRanges[stat.name].max}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        

        
        <button
          onClick={handleAddRelic}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Relic
        </button>
      </div>
      
      {/* Relics List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Relics</h2>
        
        {store.relics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {store.relics.map(relic => (
              <div key={relic.id} className="p-4 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{relic.type}</h3>
                    <p className="text-sm text-gray-600">
                      {relicSets.find(s => s.internalName === relic.set)?.displayName || relic.set}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this relic?')) {
                        deleteRelic(relic.id);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                    title="Delete Relic"
                  >
                    <FiTrash size={16} />
                  </button>
                </div>
                
                <div className="mt-2">
                  <p className="font-medium">Main Stat:</p>
                  <p>{relic.mainStat.name}: {mainStatValues[relic.mainStat.name]}</p>
                </div>
                
                <div className="mt-2">
                  <p className="font-medium">Sub Stats:</p>
                  <ul className="list-disc pl-5">
                    {relic.subStats.map((stat, index) => (
                      <li key={index}>{stat.name}: {stat.value}</li>
                    ))}
                  </ul>
                </div>
                

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-lg">No relics found. Add a relic to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}