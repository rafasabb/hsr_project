import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider, useStore } from './StoreContext';
import { Relic, RelicType } from '../types';

// Mock component to test the store
function TestComponent() {
  const { store, addRelic, deleteRelic } = useStore();
  
  const handleAddRelic = () => {
    const testRelic: Relic = {
      id: 'test-relic-1',
      type: 'Hand' as RelicType,
      set: 'bst',
      mainStat: { name: 'ATK'},
      subStats: [
        { name: 'HP', value: 100 },
        { name: 'DEF', value: 50 },
        { name: 'Crit Rate%', value: 10 },
        { name: 'Speed', value: 5 }
      ]
    };
    addRelic(testRelic);
  };
  
  const handleDeleteRelic = (id: string) => {
    deleteRelic(id);
  };
  
  return (
    <div>
      <button data-testid="add-relic-btn" onClick={handleAddRelic}>Add Test Relic</button>
      <div data-testid="relics-count">{store.relics.length}</div>
      <ul>
        {store.relics.map(relic => (
          <li key={relic.id}>
            {relic.type} - {relic.set}
            <button 
              data-testid={`delete-relic-${relic.id}`}
              onClick={() => handleDeleteRelic(relic.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('StoreContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });
  
  it('should add a relic to the store', () => {
    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );
    
    // Check initial state
    expect(screen.getByTestId('relics-count').textContent).toBe('0');
    
    // Add a relic
    fireEvent.click(screen.getByTestId('add-relic-btn'));
    
    // Check that the relic was added
    expect(screen.getByTestId('relics-count').textContent).toBe('1');
  });
  
  it('should delete a relic from the store', () => {
    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );
    
    // Add a relic
    fireEvent.click(screen.getByTestId('add-relic-btn'));
    
    // Check that the relic was added
    expect(screen.getByTestId('relics-count').textContent).toBe('1');
    
    // Delete the relic
    fireEvent.click(screen.getByTestId('delete-relic-test-relic-1'));
    
    // Check that the relic was deleted
    expect(screen.getByTestId('relics-count').textContent).toBe('0');
  });
});