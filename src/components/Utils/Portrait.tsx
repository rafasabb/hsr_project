import React from 'react';
import relicData from '../../data/relicData.json';

const { relicSets, ornamentSets } = relicData;

interface PortraitProps {
  portraitID: string;
  type: "Set" | "Piece" | "Character";
  className?: string;
  alt?: string;
  piece?: string;
}

const affixMap = {
  Head: 0,
  Hand: 1,
  Chest: 2,
  Feet: 3,
  Orb: 0,
  Rope: 1
};

const mapInternalNameToSetId = (internalName: string): number => {
  // Check relic sets
  const relicSet = relicData.relicSets.find(set => set.internalName === internalName);
  if (relicSet) return relicSet.set_id;

  // Check ornament sets
  const ornamentSet = relicData.ornamentSets.find(set => set.internalName === internalName);
  if (ornamentSet) return ornamentSet.set_id;

  // Return a default if not found
  return 0; 
}

function FindImage (id: string, type: string, piece?: string) : string {
  const sxId = mapInternalNameToSetId(id);
  
  const relicId = relicSets.find(set => set.set_id === sxId)?.set_id;
  const ornamentId = ornamentSets.find(set => set.set_id === sxId)?.set_id;
  const setId = relicId || ornamentId || -1;

  switch (type) {
    case 'Set':
      return `/src/assets/relic/${setId}.png`;

    case 'Piece':
      const affix = piece ? affixMap[piece as keyof typeof affixMap] || 0 : 0;
      return `/src/assets/relic/${setId}_${affix}.png`;
            
    case 'Character':
      return `/src/assets/character/${id}.png`;
    
    default:
      return "";
  } 
}

function formatRelic (id: string, type: string, piece?: string) : string {
  const setId = mapInternalNameToSetId(id);
  const relicSetName = relicSets.find(set => set.set_id === setId)?.displayName || ""
  const ornamentSetName = ornamentSets.find(set => set.set_id === setId)?.displayName || ""

  switch (type) {
    case 'Set':
      return relicSetName || ornamentSetName || "";

    case 'Piece':
      return `${piece}`;

    case 'Character':
      return "";

    default:
      return "";
  } 
}

const Portait: React.FC<PortraitProps> = ({ portraitID, type, className = '', alt = '', piece = '' }: PortraitProps) => {

  const imagePath = FindImage(portraitID, type, piece);
  const displayName = formatRelic(portraitID, type, piece);
  
  return (
    <div className={`flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <img src={imagePath} alt={alt || displayName} className="h-full w-full object-cover" />
    </div>
  );
};

export default Portait;