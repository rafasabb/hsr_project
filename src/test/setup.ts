import '@testing-library/jest-dom';

// Mock localStorage for tests
class LocalStorageMock {
  store: Record<string, string>;
  
  constructor() {
    this.store = {};
  }
  
  clear() {
    this.store = {};
  }
  
  getItem(key: string) {
    return this.store[key] || null;
  }
  
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  
  removeItem(key: string) {
    delete this.store[key];
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock()
});
