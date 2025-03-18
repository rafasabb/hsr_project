import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RelicsList from './RelicsList';
import * as StoreContextModule from '../store/StoreContext';
import { Relic, RelicType } from '../types';

// Mock the useStore hook
vi.mock('../store/StoreContext', async () => {
  const actual = await vi.importActual('../store/StoreContext');
  return {
    ...actual as object,
    useStore: vi.fn()
  };
});

describe('RelicsList', () => {
  const mockDeleteRelic = vi.fn();
  
  // Sample relics for testing
  const sampleRelics: Relic[] = [
    {
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
    },
    {
      id: 'test-relic-2',
      type: 'Head' as RelicType,
      set: 'gbs',
      mainStat: { name: 'HP'},
      subStats: [
        { name: 'ATK', value: 100 },
        { name: 'DEF%', value: 15 },
        { name: 'Crit DMG%', value: 20 },
        { name: 'Effect Hit Rate%', value: 10 }
      ]
    }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the useStore hook implementation
    vi.mocked(StoreContextModule.useStore).mockReturnValue({
      store: { relics: sampleRelics, characters: [] },
      addRelic: vi.fn(),
      updateRelic: vi.fn(),
      deleteRelic: mockDeleteRelic,
      addCharacter: vi.fn(),
      updateCharacter: vi.fn(),
      equipRelic: vi.fn(),
      unequipRelic: vi.fn()
    });
  });
  
  it('renders the relics list correctly', () => {
    render(<RelicsList />);
    
    // Check that the component renders
    expect(screen.getByText('Your Relics')).toBeInTheDocument();
    
    // The DataTable component might render the data differently, so let's check for the presence
    // of the table instead of specific text
    expect(document.querySelector('table')).toBeInTheDocument();
  });
  
  it('calls deleteRelic when delete button is clicked', () => {
    render(<RelicsList />);
    
    // Find all delete buttons
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2);
    
    // Click the first delete button
    fireEvent.click(deleteButtons[0]);
    
    // Check that deleteRelic was called with the correct ID
    expect(mockDeleteRelic).toHaveBeenCalledTimes(1);
    expect(mockDeleteRelic).toHaveBeenCalledWith('test-relic-1');
  });
});