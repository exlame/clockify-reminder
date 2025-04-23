// This file will be used by Jest as a setup file
import { jest } from '@jest/globals';

// Mock window.electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: {
    getEnv: jest.fn().mockImplementation((key: string) => {
      if (key === 'REFRESH_INTERVAL_SECONDS') return '300';
      if (key === 'VALIDATION_DAY') return '2';
      if (key === 'CUSTOM_START_DATE') return '2023-01-01';
      return null;
    }),
    setApiKey: jest.fn(),
    getApiKey: jest.fn(),
    clearApiKey: jest.fn(),
    openPopup: jest.fn(),
    hidePopup: jest.fn()
  },
  writable: true
}); 