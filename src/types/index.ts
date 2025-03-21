// Define types for our application

// Relic types
export type RelicType = 'Hand' | 'Head' | 'Chest' | 'Feet' | 'Orb' | 'Rope';

export interface Stat {
  name: string;
  value: number;
}

export interface MainStat {
  name: string; // Making value optional as it can be derived from mainStatValues
}

export interface Relic {
  id: string;
  type: RelicType;
  set: string; // Internal name of the relic set
  mainStat: MainStat;
  subStats: Stat[];
}

export type SubStatRanges = {
    [key: string]: { min: number; max: number };
  };

// Character types
export interface Character {
  id: string;
  name: string;
  weights: Record<string, number>;
  equippedRelics: {
    [key in RelicType]?: string; // Relic ID
  };
}

// Store types
export interface AppStore {
  characters: Character[];
  relics: Relic[];
}