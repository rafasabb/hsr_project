import { useState } from 'react';
import EditWeights from '../components/EditWeights';

type SidebarOption = 'edit-weights' | 'op2' | 'op3';

export default function CustomizePage() {
  const [selectedOption, setSelectedOption] = useState<SidebarOption>('edit-weights');

  // Function to handle sidebar option selection
  const handleOptionSelect = (option: SidebarOption) => {
    setSelectedOption(option);
  };

  // Function to render the main content based on selected option
  const renderContent = () => {
    switch (selectedOption) {
      case 'edit-weights':
        return <EditWeights />;
      case 'op2':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Option 2</h2>
            <p className="text-gray-600">Option 2 configuration panel.</p>
            {/* Add Option 2 components here */}
          </div>
        );
      case 'op3':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Option 3</h2>
            <p className="text-gray-600">Option 3 configuration panel.</p>
            {/* Add Option 3 components here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Customize Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-700">Options</h2>
            </div>
            <ul>
              <li>
                <button
                  onClick={() => handleOptionSelect('edit-weights')}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedOption === 'edit-weights' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : ''}`}
                >
                  Edit Weights
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOptionSelect('op2')}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedOption === 'op2' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : ''}`}
                >
                  Op2
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOptionSelect('op3')}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedOption === 'op3' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : ''}`}
                >
                  Op3
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-grow">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}