import { AppStore, BaseStats, Character, CharacterDataEntry, GameCharacterEntry, MainStatList, RelicType, Stat, WeightPreset } from '../types';

import gameData from '../data/gameData.json';
import characterData from '../data/characterData.json';
import aliasData from '../data/aliasData.json';
import relicData from '../data/relicData.json';
import { generatePerfectRelicsforWeightPreset } from './relicScoring';

/**
 * Calculates the score for a character based on the provided relics.
 * @param character - The character for whom the score is calculated.
 * @param relics - Array of relics to consider for scoring.

/**
 * Adds a new character to the store based on the provided character ID.
 * @param characterID - The unique identifier of the character to add.
 * @returns The newly created Character object.
 * @throws Error if the character ID is invalid or not found in the data.
 */
const createCharacter = (characterID: string): Character => {
  const characterDataEntry = characterData.characters[characterID as keyof typeof characterData.characters] as CharacterDataEntry;
  const characterGameDataEntry = gameData.characters[characterID as keyof typeof gameData.characters] as GameCharacterEntry;

  if (!characterDataEntry || !characterGameDataEntry) {
    throw new Error('Invalid character ID');
  }

  const BaseStats: BaseStats = {
    HP: characterGameDataEntry.stats.HP,
    ATK: characterGameDataEntry.stats.ATK,
    DEF: characterGameDataEntry.stats.DEF,
    SPD: characterGameDataEntry.stats.SPD,
    CRITRate: characterGameDataEntry.stats['CRIT Rate'],
    CRITDMG: characterGameDataEntry.stats['CRIT DMG'],
  }

  const defaultWeights = createNewWeightPreset('Default', characterDataEntry.weights, characterDataEntry.mainStats as MainStatList, characterDataEntry.sets, true);

  const newCharacter: Character =  {
    id: characterDataEntry.id,
    name: characterDataEntry.name,
    alias: getCharacterAlias(characterID),
    rarity: characterGameDataEntry.rarity,
    path: characterGameDataEntry.path,
    element: characterGameDataEntry.element,
    baseStats: BaseStats,
    defaultWeights: generatePerfectRelicsforWeightPreset(defaultWeights),
    weightPresets: [],
    activePresetId: defaultWeights.id,
    equippedRelics: {}
  };
  console.log(newCharacter);
  
  return newCharacter;
};


/**
 * Retrieves the alias for a character from the alias data if they have it.
 * @param characterID - The unique identifier of the character.
 * @returns The character's alias if found, undefined otherwise.
 */
const getCharacterAlias = (characterID: string): string | undefined => {
  const aliasDataEntry = aliasData.characters[characterID as keyof typeof aliasData.characters];
  if (aliasDataEntry) {
    return aliasDataEntry.alias;
  }
  return undefined;
};

/**
 * Creates a new weight preset with the specified properties.
 * @param name - The name of the weight preset.
 * @param weights - Record of stat weights for scoring calculations.
 * @param mainStats - List of recommended main stats for each relic type.
 * @param sets - Record of recommended relic and ornament sets.
 * @param isDefault - Whether this preset is the default one.
 * @returns A new WeightPreset object with a unique ID.
 */
const createNewWeightPreset = (name: string, weights: Record<string, number>, mainStats: MainStatList, sets: Record<string, string[]>, isDefault: boolean): WeightPreset => {
  return {
    id: crypto.randomUUID(),
    name,
    isDefault,
    weights,
    mainStats,
    sets
  };
};

/**
 * Finds a character in the store by their ID.
 * @param characterID - The unique identifier of the character to find.
 * @returns The Character object if found, undefined otherwise.
 */
const getCharacterByID = (characterID: string, store: AppStore): Character | undefined => {
  return store.characters.find((character) => character.id === characterID);
};

/**
 * Adds a new weight preset to a character if it doesn't already exist.
 * @param characterID - The unique identifier of the character.
 * @param weightPreset - The WeightPreset object to add.
 */
const addWeightPreset = (characterID: string, weightPreset: WeightPreset, store: AppStore): Character | undefined => {
  const character = getCharacterByID(characterID, store);
  if (!character || weightPreset.isDefault === true) return undefined;
  
  const presetExists = character.weightPresets.find((preset) => preset.name === weightPreset.name);
  if (presetExists) return character;
  
  // Generate perfect relics for the new weight preset
  const presetWithPerfectRelics = generatePerfectRelicsforWeightPreset(weightPreset);
  
  character.weightPresets.push(presetWithPerfectRelics);
  return character
};

/**
 * Removes a weight preset from a character and updates the active preset if necessary.
 * @param characterID - The unique identifier of the character.
 * @param weightPresetID - The unique identifier of the weight preset to remove.
 */
const removeWeightPreset = (characterID: string, weightPresetID: string, store: AppStore): Character | undefined => {
  const character = getCharacterByID(characterID, store);
  if (!character) return undefined; 

  const updatedPresets = character.weightPresets.filter((preset) => preset.id !== weightPresetID);
  if (updatedPresets === character.weightPresets) return undefined;

  if (character.activePresetId === weightPresetID) {
    character.activePresetId = character.defaultWeights.id; 
  }

  character.weightPresets = updatedPresets;
  return character;
};

/**
 * Sets the active weight preset for a character.
 * @param characterID - The unique identifier of the character.
 * @param weightPresetID - The unique identifier of the weight preset to set as active.
 */
const setActivePreset = (characterID: string, weightPresetID: string, store: AppStore): Character | undefined => {
  const character = getCharacterByID(characterID, store);
  if (!character) return undefined;

  const IsDefaultPreset = weightPresetID === character.defaultWeights.id;
  const presetExists = character.weightPresets.find((preset) => preset.id === weightPresetID);
  if (!presetExists && !IsDefaultPreset) return undefined;

  character.activePresetId = IsDefaultPreset? character.defaultWeights.id : weightPresetID;
  
  return character; 
}

/**
 * Updates an existing weight preset for a character.
 * @param characterID - The unique identifier of the character.
 * @param weightPreset - The WeightPreset object with updated properties.
 */
const updateWeightPreset = (characterID: string, weightPreset: WeightPreset, store: AppStore): Character | undefined => {

  const character = getCharacterByID(characterID, store);
  if (!character) return;

  const presetIndex = character.weightPresets.findIndex((preset) => preset.id === weightPreset.id); 
  if (presetIndex === -1) return;

  // Generate perfect relics for the updated weight preset
  const presetWithPerfectRelics = generatePerfectRelicsforWeightPreset(weightPreset);
  
  character.weightPresets[presetIndex] = presetWithPerfectRelics;
  return character; 
}

const getCurrentWeightPreset = (characterID: string, store: AppStore): WeightPreset | undefined => {
  const character = getCharacterByID(characterID, store);
  if (!character || !character.defaultWeights) return undefined; 
  
  const isDefaultPreset = character.activePresetId === character.defaultWeights.id;
  if (isDefaultPreset) return character.defaultWeights;

  const activePreset = character.weightPresets.find((preset) => preset.id === character.activePresetId);
  if (!activePreset) return undefined;

  return activePreset;
}
const getCurrentWeightFromCharacter = (character: Character): WeightPreset | undefined => {
  
  const isDefaultPreset = character.activePresetId === character.defaultWeights.id;
  if (isDefaultPreset) return character.defaultWeights;

  const activePreset = character.weightPresets.find((preset) => preset.id === character.activePresetId);
  if (!activePreset) return undefined;

  return activePreset;
}

/**
 * Generates a unique identifier for a relic based on its properties.
 * @param type - The type of relic (Hand, Head, etc.).
 * @param set - The set name the relic belongs to.
 * @param mainStat - The main stat of the relic.
 * @param subStats - Array of sub stats for the relic.
 * @returns A string identifier representing the relic's properties.
 */
const generateRelicId = (
  type: RelicType,
  set: string,
  mainStat: Stat,
  subStats: Stat[]
): string => {
  // Sort substats by name to ensure consistent ordering
  const sortedSubStats = [...subStats].sort((a, b) => a.name.localeCompare(b.name));
  
  // Create a string representation of the relic properties
  const relicString = `${type}-${set}-${mainStat.name}:${mainStat.value}-${
    sortedSubStats
      .map(stat => `${stat.name}:${stat.value}`)
      .join('-')
  }`;
  
  return relicString;
};

const getRelicMainStatValue = (relicMainStat: string): number => {
  return relicData.mainStatValues[relicMainStat as keyof typeof relicData.mainStatValues] || 0;
}

export default function characterUtils() {
  return {
    createCharacter,
    getCharacterByID,
    createNewWeightPreset,
    addWeightPreset,
    removeWeightPreset,
    updateWeightPreset,
    getCurrentWeightPreset,
    getCurrentWeightFromCharacter,
    setActivePreset,
    getRelicMainStatValue,
    generateRelicId
  };
}