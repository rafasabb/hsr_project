// Define types for our application

// Character types
export type Character = {
  id: string;
  name: string;
  alias?: string;
  rarity: number;
  path: string;
  element: string;
  baseStats: BaseStats;
  defaultWeights: WeightPreset; // Kept for backward compatibility
  weightPresets: WeightPreset[];
  activePresetId: string; // ID of the currently active preset
  equippedRelics: {
    [key in RelicType]?: string; // Relic ID
  };
};

// Relic types
export type RelicType = 'Hand' | 'Head' | 'Chest' | 'Feet' | 'Orb' | 'Rope';

export type Relic = {
  id: string;
  type: RelicType;
  set: string;
  mainStat: Stat;
  subStats: Stat[];
};

export type Score = {
  score: number;
  grade: string;
}

// Stat types
export type FlatStatKey = 'HP' | 'ATK' | 'DEF';
export type PercentStatKey = 'HP%' | 'ATK%' | 'DEF%';
export type ElementDMGKey = 'Physical DMG' | 'Fire DMG' | 'Ice DMG' | 'Wind DMG' | 'Lightning DMG' | 'Quantum DMG' | 'Imaginary DMG';
export type OtherStatKey = 'Crit Rate%' | 'Crit DMG%' | 'Effect Hit Rate%' | 'Effect RES%' | 'Break Effect%' | 'Energy Regen Rate%' | 'Outgoing Healing Boost%' | 'Speed';
export type NormalizationFactorKey = PercentStatKey | ElementDMGKey | OtherStatKey;
export type GameCharacterStatKey = 'HP' | 'ATK' | 'DEF' | 'SPD' | 'CRIT Rate' | 'CRIT DMG';

export type Stat = {
  name: string;
  value: number;
};

export type BaseStats = {
  HP: number;
  ATK: number;
  DEF: number;
  SPD: number;
  CRITRate: number;
  CRITDMG: number;
};

export type SubStatRanges = {
  [key: string]: { min: number; max: number };
};

// Weight preset type
export type WeightPreset = {
  id: string;
  name: string;
  weights: Record<string, number>;
  isDefault: boolean;
  mainStats: MainStatList;
  sets: {
    relic?: string[];
    ornament?: string[];
  };
};

export type MainStatList = {
  [key in 'Chest' | 'Feet' | 'Orb' | 'Rope']?: string[];
};

// Store types
export type AppStore = {
  characters: Character[];
  relics: Relic[];
}


// Character Data JSON types
export type CharacterDataEntry = {
  id: string;
  name: string;
  weights: Record<string, number>;
  mainStats: {
    [key in 'Chest' | 'Feet' | 'Orb' | 'Rope']?: string[];
  };
  sets: {
    relic: string[];
    ornament: string[];
  };
};

// Game Data JSON types
export type TraceNode = {
  id: string;
  stat: string;
  value: number;
  pre: string | null;
  children: TraceNode[];
};

export type GameCharacterEntry = {
  id: string;
  name: string;
  rarity: number;
  path: string;
  element: string;
  traces: {
    [key: string]: number;
  };
  traceTree: TraceNode[];
  stats: {
    [key in GameCharacterStatKey]: number;
  };
};
