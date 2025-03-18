import { createColumnHelper } from '@tanstack/react-table';
import { useStore } from '../store/StoreContext';
import { Character, Relic, RelicType } from '../types';
import DataTable from '../components/DataTable';
import relicData from '../data/relicData.json';

type CharacterWithRelicScores = {
  id: string;
  name: string;
  Hand?: number;
  Head?: number;
  Chest?: number;
  Feet?: number;
  Orb?: number;
  Rope?: number;
  totalScore: number;
};

const { relicTypes } = relicData;

export default function DashboardPage() {
  const { store } = useStore();
  
  // Transform data for the table
  const tableData: CharacterWithRelicScores[] = store.characters.map(character => {
    const relicScores: Record<RelicType, number | undefined> = {} as Record<RelicType, number | undefined>;
    let totalScore = 0;
    
    // Calculate scores for each relic type
    relicTypes.forEach(relicType => {
      const relicId = character.equippedRelics[relicType as RelicType];
      if (relicId) {
        const relic = store.relics.find(r => r.id === relicId);
        if (relic) {
          //TODO
        }
      } else {
        relicScores[relicType as RelicType] = undefined;
      }
    });
    
    return {
      id: character.id,
      name: character.name,
      ...relicScores,
      totalScore
    };
  });
  
  // Column definitions
  const columnHelper = createColumnHelper<CharacterWithRelicScores>();
  
  const columns = [
    columnHelper.accessor('name', {
      header: 'Character',
      cell: info => info.getValue(),
    }),
    ...relicTypes.map(relicType => 
      columnHelper.accessor(relicType as RelicType, {
        header: relicType,
        cell: info => {
          const equipped = info.getValue();
          return equipped ? '✓' : '-';
        },
      })
    ),
    columnHelper.accessor('totalScore', {
      header: 'Total Equipped',
      cell: info => info.getValue(),
    }),
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Character Relic Dashboard</h1>
      
      {tableData.length > 0 ? (
        <DataTable columns={columns} data={tableData} />
      ) : (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-lg">No characters found. Add characters and relics to get started!</p>
        </div>
      )}
    </div>
  );
}