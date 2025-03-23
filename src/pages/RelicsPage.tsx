import { useState } from 'react';
import AddRelicForm from '../components/relics/AddRelicForm';
import ImportRelicForm from '../components/relics/ImportRelicForm';
import RelicsTable from '../components/relics/RelicsTable';
import RelicModal from '../components/relics/RelicModal';
import { useStore } from '../store/StoreContext';
import { Relic } from '../types';

export default function RelicsPage() {
  const { store } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  
  const handleRelicClick = (relic: Relic) => {
    setSelectedRelic(relic);
    setIsModalOpen(true);
  };
  
  const selectedCharacter = selectedCharacterId
    ? store.characters.find(c => c.id === selectedCharacterId)
    : null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Relic Management</h1>
      
      <div className="flex flex-row gap-6">
        {/* Add Relic Form - Sidebar */}
        <div className="w-80 shrink-0">
          <ImportRelicForm />
          <AddRelicForm/>
        </div>
        
        {/* Relics List - Main Content */}
        <div className="flex-grow">
          <RelicsTable 
            store={store} 
            onRelicClick={handleRelicClick}
            onCharacterSelect={setSelectedCharacterId}
            selectedCharacterId={selectedCharacterId}
          />
        </div>
        
        {/* Relic Modal */}
        <RelicModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          relic={selectedRelic}
          selectedCharacter={selectedCharacter}
        />
      </div>
    </div>
  );
}