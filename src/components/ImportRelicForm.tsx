import { useRef } from 'react';
import { useStore } from '../store/StoreContext';
import { importRelicsFromJson } from '../utils/importRelic';

export default function ImportRelicForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addRelics } = useStore();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const importedRelics = importRelicsFromJson(jsonData);
        
        if (importedRelics.length > 0) {
          // Log the imported relics for debugging
          importedRelics.forEach(relic => {
            console.log(`Imported Relic: ${relic}`);
          });
          
          // Add all relics at once using the new bulk function
          addRelics(importedRelics);
          alert(`Successfully imported ${importedRelics.length} relics`);
        } else {
          alert('No valid relics found in the import file');
        }
      } catch (error) {
        console.error('Error importing relics:', error);
        alert('Failed to import relics. Please check the file format.');
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mb-4">
      <button 
        onClick={handleImportClick}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
      >
        Import Relics from JSON
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