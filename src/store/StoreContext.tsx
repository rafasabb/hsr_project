import { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppStore, Character, Relic } from '../types';

const initialStore: AppStore = {
  characters: [],
  relics: []
};

type StoreContextType = {
  store: AppStore;
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (characterId: string) => void;
  addRelic: (relic: Relic) => void;
  addRelics: (relics: Relic[]) => void;
  updateRelic: (relic: Relic) => void;
  deleteRelic: (relicId: string) => void;
  equipRelic: (characterId: string, relicId: string, relicType: Relic['type']) => void;
  unequipRelic: (characterId: string, relicType: Relic['type']) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useLocalStorage<AppStore>('hsr-store', initialStore);

  const addCharacter = (character: Character) => {
    setStore({
      ...store,
      characters: [...store.characters, character]
    });
  };

  const updateCharacter = (character: Character) => {
    setStore({
      ...store,
      characters: store.characters.map(c => 
        c.id === character.id ? character : c
      )
    });
  };

  const addRelic = (relic: Relic) => {
    // Check if a relic with the same ID already exists
    const relicExists = store.relics.some(r => r.id === relic.id);
    
    // Only add the relic if it doesn't already exist
    if (!relicExists) {
      setStore({
        ...store,
        relics: [...store.relics, relic]
      });
    }
  };

  const addRelics = (relics: Relic[]) => {
    // Filter out relics that already exist in the store
    const newRelics = relics.filter(newRelic => 
      !store.relics.some(existingRelic => existingRelic.id === newRelic.id)
    );
    
    // Only update the store if there are new relics to add
    if (newRelics.length > 0) {
      setStore({
        ...store,
        relics: [...store.relics, ...newRelics]
      });
    }
  };

  const updateRelic = (relic: Relic) => {
    setStore({
      ...store,
      relics: store.relics.map(r => 
        r.id === relic.id ? relic : r
      )
    });
  };

  const equipRelic = (characterId: string, relicId: string, relicType: Relic['type']) => {
    setStore({
      ...store,
      characters: store.characters.map(character => {
        if (character.id === characterId) {
          return {
            ...character,
            equippedRelics: {
              ...character.equippedRelics,
              [relicType]: relicId
            }
          };
        }
        return character;
      })
    });
  };

  const unequipRelic = (characterId: string, relicType: Relic['type']) => {
    setStore({
      ...store,
      characters: store.characters.map(character => {
        if (character.id === characterId) {
          const newEquippedRelics = { ...character.equippedRelics };
          delete newEquippedRelics[relicType];
          return {
            ...character,
            equippedRelics: newEquippedRelics
          };
        }
        return character;
      })
    });
  };

  const deleteCharacter = (characterId: string) => {
    // Remove the character from the store
    setStore({
      ...store,
      characters: store.characters.filter(character => character.id !== characterId)
    });
  };

  const deleteRelic = (relicId: string) => {
    // First, unequip this relic from any character that has it equipped
    const updatedCharacters = store.characters.map(character => {
      const newEquippedRelics = { ...character.equippedRelics };
      
      // Check each relic type to see if this relic is equipped
      Object.entries(newEquippedRelics).forEach(([relicType, equippedRelicId]) => {
        if (equippedRelicId === relicId) {
          delete newEquippedRelics[relicType as keyof typeof newEquippedRelics];
        }
      });
      
      return {
        ...character,
        equippedRelics: newEquippedRelics
      };
    });
    
    // Then remove the relic from the store
    setStore({
      ...store,
      characters: updatedCharacters,
      relics: store.relics.filter(relic => relic.id !== relicId)
    });
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        addRelic,
        addRelics,
        updateRelic,
        deleteRelic,
        equipRelic,
        unequipRelic
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}