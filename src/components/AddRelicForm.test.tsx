import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddRelicForm from './AddRelicForm';
import { StoreProvider } from '../store/StoreContext';
import * as StoreContextModule from '../store/StoreContext';

// Mock the useStore hook
vi.mock('../store/StoreContext', async () => {
  const actual = await vi.importActual('../store/StoreContext');
  return {
    ...actual as object,
    useStore: vi.fn()
  };
});

describe('AddRelicForm', () => {
  const mockAddRelic = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the useStore hook implementation
    vi.mocked(StoreContextModule.useStore).mockReturnValue({
      store: { relics: [], characters: [] },
      addRelic: mockAddRelic,
      updateRelic: vi.fn(),
      deleteRelic: vi.fn(),
      addCharacter: vi.fn(),
      updateCharacter: vi.fn(),
      equipRelic: vi.fn(),
      unequipRelic: vi.fn()
    });
  });
  
  it('renders the form correctly', () => {
    render(<AddRelicForm />);
    
    // Check that the form elements are rendered
    expect(screen.getByText('Add New Relic')).toBeInTheDocument();
    expect(screen.getByText('Relic Type')).toBeInTheDocument();
    expect(screen.getByText('Relic Set')).toBeInTheDocument();
    expect(screen.getByText('Main Stat')).toBeInTheDocument();
    expect(screen.getByText('Sub Stats')).toBeInTheDocument();
  });
  
  it('automatically sets main stat for Hand and Head relics', () => {
    render(<AddRelicForm />);
    
    // Hand type should have ATK main stat by default
    const typeSelect = screen.getAllByRole('combobox')[0]; // Get the first combobox (Relic Type)
    expect(typeSelect).toHaveValue('Hand');
    
    // Check that the main stat is set to ATK
    const mainStatName = screen.getAllByText('ATK')[0];
    expect(mainStatName).toBeInTheDocument();
    
    // Change to Head type
    fireEvent.change(typeSelect, { target: { value: 'Head' } });
    
    // Check that the main stat is set to HP
    const mainStatNameAfterChange = screen.getAllByText('HP')[0];
    expect(mainStatNameAfterChange).toBeInTheDocument();
  });
  
  it('allows selecting main stat for other relic types', () => {
    render(<AddRelicForm />);
    
    // Change to Chest type
    const typeSelect = screen.getAllByRole('combobox')[0]; // Get the first combobox (Relic Type)
    fireEvent.change(typeSelect, { target: { value: 'Chest' } });
    
    // Check that main stat can be selected
    // Using a more specific selector that matches the actual component structure
    const mainStatSelects = screen.getAllByRole('combobox');
    const mainStatSelect = mainStatSelects.find(select => 
      select.previousSibling?.textContent?.includes('Name'));
    
    expect(mainStatSelect).toBeInTheDocument();
    
    // Select a main stat
    if (mainStatSelect) {
      fireEvent.change(mainStatSelect, { target: { value: 'HP%' } });
    }
    expect(mainStatSelect).toHaveValue('HP%');
  });
  
  it('validates and adds a valid relic', async () => {
    render(<AddRelicForm />);
    
    // Set up a valid relic
    // Type is already Hand with ATK main stat
    
    // Fill in sub stats
    const subStatSelects = screen.getAllByRole('combobox').slice(2); // Skip type and set selects
    const subStatInputs = screen.getAllByRole('spinbutton');
    
    // First sub stat
    fireEvent.change(subStatSelects[0], { target: { value: 'HP' } });
    fireEvent.change(subStatInputs[0], { target: { value: '100' } });
    
    // Second sub stat
    fireEvent.change(subStatSelects[1], { target: { value: 'DEF' } });
    fireEvent.change(subStatInputs[1], { target: { value: '50' } });
    
    // Third sub stat
    fireEvent.change(subStatSelects[2], { target: { value: 'Crit Rate%' } });
    fireEvent.change(subStatInputs[2], { target: { value: '10' } });
    
    // Fourth sub stat
    fireEvent.change(subStatSelects[3], { target: { value: 'Speed' } });
    fireEvent.change(subStatInputs[3], { target: { value: '5' } });
    
    // Submit the form
    const addButton = screen.getByText('Add Relic');
    fireEvent.click(addButton);
    
    // Check that addRelic was called with the correct relic
    await waitFor(() => {
      expect(mockAddRelic).toHaveBeenCalledTimes(1);
      const calledRelic = mockAddRelic.mock.calls[0][0];
      expect(calledRelic.type).toBe('Hand');
      expect(calledRelic.mainStat.name).toBe('ATK');
      expect(calledRelic.subStats).toHaveLength(4);
      expect(calledRelic.subStats[0].name).toBe('HP');
      expect(calledRelic.subStats[0].value).toBe(100);
    });
  });
  
  it('prevents adding a relic with invalid sub stat values', async () => {
    // Mock window.alert
    const alertMock = vi.fn();
    window.alert = alertMock;
    
    render(<AddRelicForm />);
    
    // Set up a relic with invalid sub stat value
    // Type is already Hand with ATK main stat
    
    // Fill in sub stats
    const subStatSelects = screen.getAllByRole('combobox').slice(2); // Skip type and set selects
    const subStatInputs = screen.getAllByRole('spinbutton');
    
    // First sub stat - valid
    fireEvent.change(subStatSelects[0], { target: { value: 'HP' } });
    fireEvent.change(subStatInputs[0], { target: { value: '100' } });
    
    // Second sub stat - valid
    fireEvent.change(subStatSelects[1], { target: { value: 'DEF' } });
    fireEvent.change(subStatInputs[1], { target: { value: '50' } });
    
    // Third sub stat - valid
    fireEvent.change(subStatSelects[2], { target: { value: 'Crit Rate%' } });
    fireEvent.change(subStatInputs[2], { target: { value: '10' } });
    
    // Fourth sub stat - invalid (too high)
    fireEvent.change(subStatSelects[3], { target: { value: 'Speed' } });
    fireEvent.change(subStatInputs[3], { target: { value: '20' } }); // Max is 15
    
    // Submit the form
    const addButton = screen.getByText('Add Relic');
    fireEvent.click(addButton);
    
    // Check that alert was shown and addRelic was not called
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
      expect(mockAddRelic).not.toHaveBeenCalled();
    });
  });
});