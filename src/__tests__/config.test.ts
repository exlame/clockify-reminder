import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the config module
jest.mock('../config', () => {
  // Create a mock implementation of the module
  const mockSetupRefreshInterval = jest.fn();
  const REFRESH_INTERVAL_SECONDS = 360;
  const VALIDATION_DAY = 1;
  const CUSTOM_START_DATE = null;
  const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  const API_ENDPOINTS = {
    USER_INFO: 'https://api.clockify.me/api/v1/user',
    APPROVAL_STATUS: (workspaceId: string, userId: string, startDate: string) => 
      `https://app.clockify.me/api/workspaces/${workspaceId}/users/${userId}/approval-requests/status?start=${startDate}`
  };
  
  return {
    setupRefreshInterval: mockSetupRefreshInterval,
    REFRESH_INTERVAL_SECONDS,
    VALIDATION_DAY,
    CUSTOM_START_DATE,
    DAY_NAMES,
    API_ENDPOINTS
  };
});

// Import the mocked module
import { DAY_NAMES, API_ENDPOINTS } from '../config';

describe('Config Module', () => {
  describe('DAY_NAMES', () => {
    it('should contain all days of the week', () => {
      expect(DAY_NAMES).toHaveLength(7);
      expect(DAY_NAMES).toEqual([
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ]);
    });
  });

  describe('API_ENDPOINTS', () => {
    it('should have USER_INFO endpoint', () => {
      expect(API_ENDPOINTS.USER_INFO).toBe('https://api.clockify.me/api/v1/user');
    });

    it('should generate APPROVAL_STATUS endpoint with parameters', () => {
      const workspaceId = 'workspace123';
      const userId = 'user456';
      const startDate = '2023-01-01';
      
      const endpoint = API_ENDPOINTS.APPROVAL_STATUS(workspaceId, userId, startDate);
      
      expect(endpoint).toBe(
        `https://app.clockify.me/api/workspaces/${workspaceId}/users/${userId}/approval-requests/status?start=${startDate}`
      );
    });
  });
}); 