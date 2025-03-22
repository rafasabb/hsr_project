import { useStore } from '../store/StoreContext';
import DataTable, { FilterOption } from './DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Relic, Stat } from '../types';
import relicData from '../data/relicData.json';
import { useState } from 'react';
import { calculateRelicScore } from '../utils/relicScoring';

const columnHelper = createColumnHelper<Relic>();

const {relicSets, ornamentSets, allStats} = relicData;

export default function RelicsList() {
  const { store, deleteRelic } = useStore();
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  
  // Get the selected character object
  const selectedCharacter = selectedCharacterId 
    ? store.characters.find(c => c.id === selectedCharacterId) 
    : null;

  // Format relic and ornamnet display
  const formatRelic = (item: string) => {
    // Extract the internal name from the prefixed value (relic_xxx or ornament_xxx)
    const internalName = item.includes('_') ? item.split('_')[1] : item;
    return relicSets.find(x => x.internalName === internalName)?.displayName || 
           ornamentSets.find(x => x.internalName === internalName)?.displayName || 
           item;
  }
  // Get the value of a specific substat by name
  const getSubStatValueByName = (subStats: Stat[], statName: string): number => {
    const stat = subStats.find(s => s.name === statName);
    return stat ? stat.value : 0;
  };
  
  // Format a substat value for display
  const formatSubStatValue = (value: number) => {
    return value === 0 ? '0' : value.toString();
  };

  // Calculate score for a relic based on selected character
  const getRelicScore = (relic: Relic): number | null => {
    if (!selectedCharacter) return null;
    return calculateRelicScore(relic, selectedCharacter, store).score;
  };

  const columns = [
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('set', {
      header: 'Set',
      cell: info => formatRelic(info.getValue()),
    }),
    columnHelper.accessor('mainStat', {
      header: 'Main Stat',
      cell: info => `${info.getValue().name}`,
    }),
    // Create a column for each possible substat
    ...allStats.subStats.map(statName => 
      columnHelper.accessor(row => getSubStatValueByName(row.subStats, statName), {
        id: `substat_${statName.replace(/[%\s]/g, '_')}`,
        header: statName,
        cell: info => formatSubStatValue(info.getValue()),
        enableHiding: true,
      })
    ),
    // Add score column when a character is selected
    ...(selectedCharacter ? [
      columnHelper.accessor(row => getRelicScore(row), {
        id: 'score',
        header: `Score for ${selectedCharacter.name}`,
        cell: info => {
          const score = info.getValue();
          return score !== null ? score.toFixed(2) : '-';
        },
      })
    ] : []),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: props => {
        const relic = props.row.original;
        return (
          <button
            onClick={() => deleteRelic(relic.id)}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        );
      },
    }),
  ];

  // Create filter options for the table
  const typeFilterOptions: FilterOption[] = relicData.relicTypes.map(type => ({
    value: type,
    label: type
  }));

  // Create set filter options by combining relic sets and ornament sets
  const setFilterOptions: FilterOption[] = [
    ...relicSets.map(set => ({
      value: `relic_${set.internalName}`,
      label: set.displayName
    })),
    ...ornamentSets.map(set => ({
      value: `ornament_${set.internalName}`,
      label: set.displayName
    }))
  ];

  // Create main stat filter options
  // We'll flatten the mainStats object to get all possible main stats
  const allMainStats = new Set<string>();
  Object.values(relicData.allStats.mainStats).forEach(stats => {
    stats.forEach(stat => allMainStats.add(stat));
  });
  
  const mainStatFilterOptions: FilterOption[] = Array.from(allMainStats).map(stat => ({
    value: stat,
    label: stat
  }));

  // Define filterable columns
  const filterableColumns = [
    {
      id: 'type',
      options: typeFilterOptions
    },
    {
      id: 'set',
      options: setFilterOptions
    },
    {
      id: 'mainStat',
      options: mainStatFilterOptions
    }
  ];
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Relics</h2>
        
        <div className="flex items-center">
          <label htmlFor="character-select" className="mr-2 font-medium">Score for:</label>
          <select
            id="character-select"
            className="border rounded p-2"
            value={selectedCharacterId || ''}
            onChange={(e) => setSelectedCharacterId(e.target.value || null)}
          >
            <option value="">Select a character</option>
            {store.characters.map(character => (
              <option key={character.id} value={character.id}>{character.name}</option>
            ))}
          </select>
        </div>
      </div>
      {store.relics.length > 0 ? (
        <DataTable 
          data={store.relics} 
          columns={columns} 
          defaultHiddenColumns={[]} // You can specify columns to hide by default here
          filterableColumns={filterableColumns}
        />
      ) : (
        <p className="text-gray-500">No relics found. Add a relic to get started!</p>
      )}
    </div>
  );
}