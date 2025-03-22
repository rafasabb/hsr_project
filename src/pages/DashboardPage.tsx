import { createColumnHelper } from '@tanstack/react-table';
import { useStore } from '../store/StoreContext';
import { RelicType } from '../types';
import DataTable from '../components/DataTable';
import relicData from '../data/relicData.json';
import { calculateRelicScore } from '../utils/relicScoring';

type CharacterWithRelicScores = {
  id: string;
  name: string;
  Hand?: { score: number; grade: string };
  Head?: { score: number; grade: string };
  Chest?: { score: number; grade: string };
  Feet?: { score: number; grade: string };
  Orb?: { score: number; grade: string };
  Rope?: { score: number; grade: string };
  totalScore: number;
};

const { relicTypes } = relicData;

export default function DashboardPage() {
  const { store } = useStore();
  
  // Transform data for the table
  const tableData: CharacterWithRelicScores[] = store.characters.map(character => {
    const relicScores: Record<RelicType, { score: number; grade: string } | undefined> = {} as Record<RelicType, { score: number; grade: string } | undefined>;
    let totalScore = 0;
    
    // Calculate scores for each relic type
    relicTypes.forEach(relicType => {
      const relicId = character.equippedRelics[relicType as RelicType];
      if (relicId) {
        const relic = store.relics.find(r => r.id === relicId);
        if (relic) {
          const scoreResult = calculateRelicScore(relic, character, store);
          relicScores[relicType as RelicType] = {
            score: parseFloat(scoreResult.score.toFixed(2)),
            grade: scoreResult.grade
          };
          totalScore += scoreResult.score;
        }
      } else {
        relicScores[relicType as RelicType] = undefined;
      }
    });
    
    return {
      id: character.id,
      name: character.name,
      ...relicScores,
      totalScore: parseFloat((totalScore / 6).toFixed(2))
    };
  });
  
  // Column definitions
  const columnHelper = createColumnHelper<CharacterWithRelicScores>();
  
  // Function to get CSS class based on grade
  const getGradeClass = (grade: string): string => {
    switch (grade) {
      case 'WTF': return 'font-bold text-purple-600';
      case 'SSS': return 'font-bold text-red-600';
      case 'SS': return 'font-bold text-orange-600';
      case 'S': return 'font-bold text-yellow-600';
      case 'A': return 'font-bold text-green-600';
      case 'B': return 'font-semibold text-blue-600';
      case 'C': return 'font-semibold text-indigo-600';
      case 'D': return 'text-gray-600';
      case 'E': return 'text-gray-500';
      case 'F': return 'text-gray-400';
      default: return '';
    }
  };
  
  const columns = [
    columnHelper.accessor('name', {
      header: 'Character',
      cell: info => info.getValue(),
    }),
    ...relicTypes.map(relicType => 
      columnHelper.accessor(relicType as RelicType, {
        header: relicType,
        cell: info => {
          const relicData = info.getValue();
          if (!relicData) return '-';
          
          return (
            <div className="flex flex-col">
              <span className={getGradeClass(relicData.grade)}>{relicData.grade}</span>
              <span className="text-xs text-gray-500">{relicData.score}</span>
            </div>
          );
        },
      })
    ),
    columnHelper.accessor('totalScore', {
      header: 'Total Score',
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