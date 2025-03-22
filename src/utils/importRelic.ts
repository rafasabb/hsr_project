import { Relic, RelicType, Stat } from '../types';
import characterUtils from './characterUtils';
import relicData from '../data/relicData.json';

/**
 * Maps a slot name from the import format to the application's RelicType format
 * @param slot The slot name from the import file (e.g., "Planar Sphere")
 * @returns The corresponding RelicType value
 */
const mapSlotToRelicType = (slot: string): RelicType => {
  const slotMap: Record<string, RelicType> = {
    'Head': 'Head',
    'Hands': 'Hand',
    'Body': 'Chest',
    'Feet': 'Feet',
    'Planar Sphere': 'Orb',
    'Link Rope': 'Rope'
  };
  
  return slotMap[slot] || 'Head'; // Default to Head if not found
};

/**
 * Maps a set_id to the corresponding set internal name
 * @param setId The set_id from the import file
 * @returns The internal name of the set
 */
const mapSetIdToInternalName = (setId: string): string => {
  // Convert string set_id to number for comparison
  const numericSetId = parseInt(setId, 10);
  
  // Check relic sets
  const relicSet = relicData.relicSets.find(set => set.set_id === numericSetId);
  if (relicSet) return relicSet.internalName;
  
  // Check ornament sets
  const ornamentSet = relicData.ornamentSets.find(set => set.set_id === numericSetId);
  if (ornamentSet) return ornamentSet.internalName;
  
  // Return a default if not found
  return 'relic_unknown';
};

/**
 * Cleans a substat key by removing trailing underscores and normalizing format
 * @param key The substat key from the import file
 * @returns The cleaned substat key
 */
const cleanSubstatKey = (key: string): string => {
  // Remove trailing underscores
  let cleanedKey = key.replace(/_+$/, '');
  
  // Map to the application's format
  const keyMap: Record<string, string> = {
    'HP': 'HP',
    'ATK': 'ATK',
    'DEF': 'DEF',
    'SPD': 'SPD',
    'CRIT Rate': 'Crit Rate%',
    'CRIT DMG': 'Crit DMG%',
    'Effect Hit Rate': 'Effect Hit Rate%',
    'Effect RES': 'Effect RES%',
    'Break Effect': 'Break Effect%'
  };
  
  return keyMap[cleanedKey] || cleanedKey;
};

/**
 * Imports relics from a JSON file in the format of test.json
 * @param jsonData The parsed JSON data from the import file
 * @returns An array of Relic objects ready to be added to the store
 */
export const importRelicsFromJson = (jsonData: any): Relic[] => {
  const { generateRelicId, getRelicMainStatValue } = characterUtils();
  const importedRelics: Relic[] = [];
  
  if (!jsonData || !jsonData.relics || !Array.isArray(jsonData.relics)) {
    console.error('Invalid JSON data format for relics import');
    return [];
  }
  
  for (const relicData of jsonData.relics) {
    try {
      // Map slot to RelicType
      const type = mapSlotToRelicType(relicData.slot);
      
      // Map set_id to internal name
      const set = mapSetIdToInternalName(relicData.set_id);
      
      // Create main stat
      const mainStatName = relicData.mainstat;
      const mainStatValue = getRelicMainStatValue(mainStatName);
      const mainStat: Stat = {
        name: mainStatName,
        value: mainStatValue
      };
      
      // Create substats
      const subStats: Stat[] = relicData.substats.map((substat: any) => ({
        name: cleanSubstatKey(substat.key),
        value: substat.value
      }));
      
      // Generate a unique ID for the relic
      const id = generateRelicId(type, set, mainStat, subStats);
      
      // Create the relic object
      const relic: Relic = {
        id,
        type,
        set,
        mainStat,
        subStats
      };
      
      importedRelics.push(relic);
    } catch (error) {
      console.error('Error importing relic:', error);
      // Continue with the next relic
    }
  }
  
  return importedRelics;
};

export default {
  importRelicsFromJson
};