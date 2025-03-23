import React from 'react';
import { Score } from '../../types';

interface RelicScoreDisplayProps {
  scoreResult: Score | null;
}

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

const RelicScoreDisplay: React.FC<RelicScoreDisplayProps> = ({ scoreResult }) => {
  if (!scoreResult) return null;
  
  return (
    <div className="flex flex-col">
      <span className={`font-bold ${getGradeClass(scoreResult.grade)}`}>
        {scoreResult.grade}
      </span>
      <span className="text-xs text-gray-500">{scoreResult.score.toFixed(2)}</span>
    </div>
  );
};

export default RelicScoreDisplay;