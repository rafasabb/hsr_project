import { FiX } from 'react-icons/fi';
import { Relic, Character, Score } from '../../types';
import { useStore } from '../../store/StoreContext';
import Portait from '../Utils/Portrait';
import RelicScoreDisplay from './RelicScoreDisplay';
import characterUtils from '../../utils/characterUtils';
import { calculateRelicScore } from '../../utils/relicScoring';

interface RelicModalProps {
  isOpen: boolean;
  onClose: () => void;
  relic: Relic | null;
  selectedCharacter: Character | null | undefined;
}

export default function RelicModal({
  isOpen,
  onClose,
  relic,
  selectedCharacter,
}: RelicModalProps) {
  const { store } = useStore();
  const { getCurrentWeightFromCharacter } = characterUtils();

  if (!isOpen || !relic) return null;

  const getEquippedCharacter = (relicId: string): Character | null => {
    const character = store.characters.find(char => {
      return Object.values(char.equippedRelics).includes(relicId);
    });
    return character || null;
  };

  const getRelicScore = (relic: Relic): Score | null => {
    if (!selectedCharacter) return null;
    const relicType = relic.type;

    const weights = getCurrentWeightFromCharacter(selectedCharacter);
    if (!weights || !weights.perfectRelics) return null;

    const perfectOfType = weights.perfectRelics[relicType];
    if (!perfectOfType) return null;

    return calculateRelicScore(relic, perfectOfType, selectedCharacter);
  };

  const equippedCharacter = getEquippedCharacter(relic.id);
  const scoreResult = selectedCharacter ? getRelicScore(relic) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Relic Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Relic Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Relic Info */}
            <div className="w-full md:w-1/3">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-full overflow-hidden mr-4">
                  <Portait portraitID={relic.set} type="Set" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{relic.type}</h3>
                  <p className="text-gray-600">{relic.set}</p>
                </div>
              </div>

              {equippedCharacter && (
                <div className="mb-4 p-3 border rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Equipped By</h4>
                  <div className="flex items-center">
                    <Portait portraitID={equippedCharacter.id} type="Character" />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {equippedCharacter.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {scoreResult && (
                <div className="mb-4 p-3 border rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Score</h4>
                  <RelicScoreDisplay scoreResult={scoreResult} />
                </div>
              )}
            </div>

            {/* Right Column - Stats */}
            <div className="w-full md:w-2/3">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Main Stat</h4>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{relic.mainStat.name}</span>
                    <span className="text-gray-700">{relic.mainStat.value}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Sub Stats</h4>
                <div className="space-y-2">
                  {relic.subStats.map((stat, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{stat.name}</span>
                        <span className="text-gray-700">{stat.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}