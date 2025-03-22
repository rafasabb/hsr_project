import { Character, Relic, RelicType, FlatStatKey, PercentStatKey, NormalizationFactorKey, Stat, Score, AppStore } from '../types';

import characterUtils from './characterUtils';

import relicData from '../data/relicData.json';
import statConstants from '../data/statConstants.json';

const { mainStatValues, subStatRanges, allStats, subStatRolls } = relicData;

const { NORMALIZATION_FACTORS, PERCENT_STAT_LOW_ROLLS, FLAT_STAT_HIGH_ROLLS, FLAT_STAT_LOW_ROLLS } = statConstants;

/**
 * Calculate the weight for a flat stat based on the character's base stats and the weight of the percentage stat
 * @param statName The name of the flat stat (HP, ATK, DEF)
 * @param character The character to calculate the weight for
 * @returns The calculated weight for the flat stat
 */
function calculateFlatStatWeight(statName: FlatStatKey, character: Character, store: AppStore): number {
  const { getCurrentWeightPreset } = characterUtils();
  const baseStat = getCharacterBaseStat(character, statName);

  const currentWeight = getCurrentWeightPreset(character.id, store);
  if (!currentWeight) return 0;

  const percentStatName = `${statName}%` as PercentStatKey;
  const percentWeight = currentWeight.weights[percentStatName] || 0;
  
  const flatStatLowRoll = FLAT_STAT_LOW_ROLLS[statName];
  const percentStatLowRoll = PERCENT_STAT_LOW_ROLLS[percentStatName];
  
  if (!flatStatLowRoll || !percentStatLowRoll) return 0;
  
  return percentWeight * flatStatLowRoll / (baseStat * 2 * percentStatLowRoll);
}

/**
 * Get the base stat value for a character
 * @param character The character to get the base stat for
 * @param statName The name of the stat (HP, ATK, DEF)
 * @returns The base stat value or undefined if not found
 */
function getCharacterBaseStat(character: Character, statName: FlatStatKey): number {
  return character.baseStats[statName];
}

/**
 * Calculate the normalization factor for a flat stat
 * @param statName The name of the flat stat (HP, ATK, DEF)
 * @returns The normalization factor for the flat stat
 */
function calculateFlatStatNormalization(statName: FlatStatKey): number {
  const percentStatName = `${statName}%` as PercentStatKey;
  const percentMainStatValue = mainStatValues[percentStatName];
  const percentHighRollValue = subStatRanges[percentStatName]?.max;
  const flatHighRollValue = FLAT_STAT_HIGH_ROLLS[statName];
  
  if (!percentMainStatValue || !percentHighRollValue || !flatHighRollValue) return 1;
  
  return (64.8 / percentMainStatValue) * (percentHighRollValue / flatHighRollValue);
}

/**
 * Calculate the score for a substat
 * @param statName The name of the substat
 * @param statValue The value of the substat
 * @param characterData The character to calculate the score for
 * @returns The calculated score for the substat
 */
function calculateSubstatScore(
    statName: string,
    statValue: number,
    character: Character,
    store: AppStore
  ): number {
    const { getCurrentWeightPreset } = characterUtils();
    const currentWeight = getCurrentWeightPreset(character.id, store);
    if (!currentWeight) return 0;
     
    let weight = currentWeight.weights[statName] || 0;
    let normalization = NORMALIZATION_FACTORS[statName as NormalizationFactorKey] || 1;
    
    // Handle flat stats specially
    if (['HP', 'ATK', 'DEF'].includes(statName)) {
      weight = calculateFlatStatWeight(statName as FlatStatKey, character, store);
      normalization = calculateFlatStatNormalization(statName as FlatStatKey);
    }
  
    return weight * normalization * statValue;
  }

/**
 * Calculate the score for a main stat
 * @param relic The Relic to calculate the score for
 * @param character The character to calculate the score for
 * @returns The calculated score for the main stat
 */
function calculateMainstatScore(relic: Relic, character: Character, store: AppStore): number {
  // Returns 0 score for heads and hands as they have fixed main stats
  if (relic.type === 'Head' || relic.type === 'Hand') return 0;

  const { getCurrentWeightPreset } = characterUtils();
  const currentWeight = getCurrentWeightPreset(character.id, store);
  if (!currentWeight) return 0;

  // Get the main stat name from the relic
  const mainStatName = relic.mainStat.name;
  
  // Check if this relic type has recommended main stats in character data
  const recommendedMainStats = currentWeight.mainStats[relic.type as 'Chest' | 'Feet' | 'Orb' | 'Rope'];
  
  // If the main stat is in the recommended list, return full value (64.8)
  if (recommendedMainStats && recommendedMainStats.includes(mainStatName)) {
    return 64.8;
  }

  const weight = currentWeight.weights[mainStatName] || 0;
  const normalization = NORMALIZATION_FACTORS[mainStatName as NormalizationFactorKey] || 1;
  
  // Return a scaled-down value based on the weight
  return 64.8 * (weight * normalization) / 10;
}

/**
 * Calculate the score bonus for a relic set based on character preferences
 * @param setName The name of the relic set
 * @param character The character to calculate the set score for
 * @returns A score bonus for the set match
 */
function calculateSetScore(setName: string, character: Character, store: AppStore): number {
  const { getCurrentWeightPreset } = characterUtils();
  const currentWeight = getCurrentWeightPreset(character.id, store);
  if (!currentWeight) return 0;

  const isOrnament: boolean = relicData.ornamentSets.some((x) => x.internalName === setName);
  if (isOrnament) {
    const recommendedSets = currentWeight.sets.ornament || [];
    if (recommendedSets.includes(setName)) {
      return 1;
    }
    return 0.6; // Penalize using an ornament set if not in the recommended list
  }
  
  const recommendedSets = currentWeight.sets.relic || [];
  if (recommendedSets.includes(setName)) {
    return 1;
  }
  
  return 0.6; // Penalize using an ornament set if not in the recommended list
}

/**
 * Calculate the score for a relic
 * @param relic The relic to calculate the score for
 * @param character The character to calculate the score for
 * @returns The calculated score for the relic
 */
function calculateRelic(relic: Relic, character: Character, store: AppStore): number {
   // Calculate substat score
   let substatScore = 0;
   for (const substat of relic.subStats) {
     substatScore += calculateSubstatScore(substat.name, substat.value, character, store);
   }

   // Calculate main stat score
   let mainStatScore = calculateMainstatScore(relic, character, store);
   
   // Calculate set score
   let setScore = calculateSetScore(relic.set, character, store);
   
   // Return the total score
   return (substatScore + mainStatScore) * setScore;
}

/**
 * Calculate the score for a relic
 * @param relic The relic to calculate the score for
 * @param character The character to calculate the score for
 * @returns The calculated score for the relic
 */
export function calculateRelicScore(relic: Relic, character: Character, store: AppStore): Score {
    // Calculate the score for the relic
    const actualScore = calculateRelic(relic, character, store);
    const perfectRelic = generatePerfectRelic(relic.type, character, store);
    const idealScore = calculateRelic(perfectRelic, character, store);
    const grade = getRelicGrade(idealScore, actualScore);

    return {
        score: (actualScore / idealScore) * 100,
        grade
    };
}

/**
 * Find the best main stat for a relic type based on character weights
 * @param characterData The character data to use for determining the best main stat
 * @param relicType The type of relic to find the best main stat for
 * @returns The name of the best main stat for the relic type
 */
function findBestMainStat(relicType: RelicType, character: Character, store: AppStore): string {
  // For Head and Hand, there's only one possible main stat
  if (relicType === 'Head') return 'HP';
  if (relicType === 'Hand') return 'ATK';

  const { getCurrentWeightPreset } = characterUtils();
  const currentWeight = getCurrentWeightPreset(character.id, store);
  if (!currentWeight){
    throw new Error('Invalid character ID');
  }
  
  // Get the available main stats for this relic type
  const availableMainStats = allStats.mainStats[relicType];
  if (!availableMainStats || availableMainStats.length === 0) {
    return ''; // No main stats available for this relic type
  }
  
  // Check if the character has recommended main stats for this relic type
  const recommendedMainStats = currentWeight.mainStats[relicType as 'Chest' | 'Feet' | 'Orb' | 'Rope'];
  if (recommendedMainStats && recommendedMainStats.length > 0) {
    // Return the first recommended main stat
    return recommendedMainStats[0];
  }
  
  let bestMainStat = '';
  let highestScore = -1;
  
  for (const statName of availableMainStats) {
    const weight = currentWeight.weights[statName] || 0;
    const statValue = mainStatValues[statName as keyof typeof mainStatValues] || 0;
    let normalization = NORMALIZATION_FACTORS[statName as NormalizationFactorKey] || 1;
    
    // Handle flat stats specially
    if (['HP', 'ATK', 'DEF'].includes(statName)) {
      // Skip flat stats in main stat selection if not fixed
      continue;
    }
    
    const score = weight * normalization * statValue;
    if (score > highestScore) {
      highestScore = score;
      bestMainStat = statName;
    }
  }
  
  return bestMainStat; // Fallback to first available if no weights
}

/**
 * Find the best substats for a relic based on character weights
 * @param mainStatName The name of the main stat
 * @param relicType The type of relic to find the best substats for
 * @param character The character data to use for determining the best substats
 * @returns An array of the best substats for the relic
 */
function findBestSubstats(mainStatName: string, relicType: RelicType, character: Character, store: AppStore): Stat[] {
  const { getCurrentWeightPreset } = characterUtils();
  const currentWeight = getCurrentWeightPreset(character.id, store);
  if (!currentWeight) {
    throw new Error('Invalid character ID');
  };

  const availableSubstats = allStats.subStats.filter(stat => stat !== mainStatName);
  
  // Calculate score for each substat
  const substatScores: Array<{name: string; score: number}> = [];
  
  for (const statName of availableSubstats) {
    let weight = currentWeight.weights[statName] || 0;
    let normalization = NORMALIZATION_FACTORS[statName as NormalizationFactorKey] || 1;
    const maxValue = subStatRanges[statName as keyof typeof subStatRanges]?.max || 0;
    
    // Handle flat stats specially
    if (['HP', 'ATK', 'DEF'].includes(statName)) {
      // For flat stats, we need to calculate their weight based on the character's base stats
      // This is a simplified approach since we don't have the character object here
      const percentStatName = `${statName}%` as PercentStatKey;
      weight = currentWeight.weights[percentStatName] || 0;
      // Flat stats are generally less valuable, so we'll apply a penalty
      weight *= 0.5;
    }
    
    const score = weight * normalization * maxValue;
    substatScores.push({ name: statName, score });
  }
  
  // Sort substats by score in descending order
  substatScores.sort((a, b) => b.score - a.score);
  
  // Take the top 4 substats (relics can have at most 4 substats)
  const bestSubstats = substatScores.slice(0, 4);

  // Distribute rolls to substats based on weights
  var relicRolls = bestSubstats.map(substat => ({
    name: substat.name,
    value: 0 
  }));

  // If its a Orb or Rope maxRolls is 8 instead
  
  let maxRolls;
  if (['Orb', 'Rope'].includes(relicType)) {
    maxRolls = 8;
  } else {
    maxRolls = 9;
  }

  let remainingRolls = maxRolls;
  for (const substat of bestSubstats) {
    if (remainingRolls <= 0) break;
    //Add the value of a max row to the value of this substat
    const maxValue = subStatRolls[substat.name as keyof typeof subStatRolls]?.max || 0;
    relicRolls[substatScores.indexOf(substat)].value = maxValue;
    remainingRolls --;
  }
  for (let index = 0; index < relicRolls.length; index++) {
    if (remainingRolls <= 0) break;
    // Find the max substat roll for this stat
    const maxSubstatRoll = subStatRanges[relicRolls[index].name as keyof typeof subStatRanges]?.max || 0;
    const maxValue = subStatRolls[relicRolls[index].name as keyof typeof subStatRolls]?.max || 0;

    while(remainingRolls > 0) {
        const tryNewValue = relicRolls[index].value + maxValue;
        if (tryNewValue > maxSubstatRoll) {
            break;
        }

        relicRolls[index].value = tryNewValue;
        remainingRolls--;
    }
  }

  return relicRolls;
}

/**
 * Generate a perfect relic for a character based on their preferences
 * @param relicType The type of relic to generate
 * @param character The character data to use for generating the perfect relic
 * @returns A perfect relic object for the character
 */
export function generatePerfectRelic(relicType: RelicType, character: Character, store: AppStore): Relic {
  const { getCurrentWeightPreset, generateRelicId, getRelicMainStatValue } = characterUtils();
  const currentWeight = getCurrentWeightPreset(character.id, store);
  if (!currentWeight){
    throw new Error('Invalid character ID');
  }

  // Find the best main stat for this relic type
  const mainStatName = findBestMainStat(relicType, character, store);
  
  // Find the best substats for this relic
  const substats = findBestSubstats(mainStatName, relicType, character, store);
  
  let newSet = '';

  const isOrnament : boolean = relicType === 'Orb' || relicType === 'Rope';
  if (isOrnament) {
    if (currentWeight.sets.ornament && currentWeight.sets.ornament.length > 0) {
      newSet = currentWeight.sets.ornament[0]; 
    }
  } else {
    if (currentWeight.sets.relic && currentWeight.sets.relic.length > 0) {
      newSet = currentWeight.sets.relic[0];
    }
  }

  const value = getRelicMainStatValue(mainStatName);
  
  // Generate a unique ID for the relic
  const id = generateRelicId(relicType, newSet, { name: mainStatName, value: value }, substats);
  console.log(`${mainStatName}: ${value}`);
  
  // Create and return the perfect relic
  return {
    id,
    type: relicType,
    set: newSet,
    mainStat: { name: mainStatName, value: value },
    subStats: substats
  };
}

/**
 * Convert a relic score comparison into a letter grade
 * @param idealScore The ideal or maximum possible score
 * @param actualScore The actual score being evaluated
 * @returns A letter grade representing the quality of the relic (WTF, SSS, SS, S, A, B, C, D, E, F)
 */
export function getRelicGrade(idealScore: number, actualScore: number): string {
  // Handle edge cases
  if (idealScore <= 0) return 'F'; // Invalid ideal score
  if (actualScore <= 0) return 'F'; // Zero or negative actual score
  
  // Calculate percentage
  const percentage = (actualScore / idealScore) * 100;
  
  // Return grade based on percentage thresholds
  if (percentage >= 95) return 'WTF';
  if (percentage >= 80) return 'SSS';
  if (percentage >= 70) return 'SS';
  if (percentage >= 60) return 'S';
  if (percentage >= 50) return 'A';
  if (percentage >= 40) return 'B';
  if (percentage >= 30) return 'C';
  if (percentage >= 20) return 'D';
  if (percentage >= 10) return 'E';
  return 'F';
}
