import { useRef, useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { importRelicsFromJson } from '../../utils/importRelic';

export default function ImportRelicForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { addRelics, store } = useStore();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const importedRelics = importRelicsFromJson(jsonData);
        
        if (importedRelics.length > 0) {
          // Check for duplicates by comparing IDs with existing relics
          const existingRelicIds = store.relics.map(relic => relic.id);
          const duplicates = importedRelics.filter(relic => 
            existingRelicIds.includes(relic.id)
          );
          const uniqueRelics = importedRelics.filter(relic => 
            !existingRelicIds.includes(relic.id)
          );
          
          // Add only unique relics
          if (uniqueRelics.length > 0) {
            addRelics(uniqueRelics);
          }
          
          // Provide feedback to the user
          if (duplicates.length > 0) {
            alert(`Imported ${uniqueRelics.length} relics. Discarded ${duplicates.length} duplicate relics.`);
          } else {
            alert(`Successfully imported ${uniqueRelics.length} relics`);
          }
        } else {
          alert('No valid relics found in the import file');
        }
      } catch (error) {
        console.error('Error importing relics:', error);
        alert('Failed to import relics. Please check the file format.');
      } finally {
        setIsImporting(false);
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mb-4">
      <button 
        onClick={handleImportClick}
        disabled={isImporting}
        className={`w-full ${isImporting ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium py-2 px-4 rounded`}
      >
        {isImporting ? 'Importing...' : 'Import Relics from JSON'}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
    </div>
  );
}