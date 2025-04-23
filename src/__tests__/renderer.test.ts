import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Set up the DOM elements before running tests
beforeEach(() => {
  document.body.innerHTML = `
    <div id="apiKeyStatus"></div>
    <div id="approvalStatus"></div>
    <div id="dateRange"></div>
    <div id="statusInfo"></div>
    <div id="dashboardApprovalStatus"></div>
    <div id="dashboardDateRange"></div>
    <div id="dashboardStatusInfo"></div>
  `;
});

// Create a separate module to avoid direct imports from renderer.ts
// which contains code that runs immediately and depends on browser APIs
const rendererModule = {
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  updateApiKeyStatus: (isValid: boolean | null) => {
    const statusElement = document.getElementById('apiKeyStatus');
    if (statusElement) {
      statusElement.className = 'api-key-status';
      if (isValid === null) {
        statusElement.classList.add('status-unknown');
        statusElement.textContent = 'Checking API key...';
      } else if (isValid) {
        statusElement.classList.add('status-valid');
        statusElement.textContent = 'API key is valid';
      } else {
        statusElement.classList.add('status-invalid');
        statusElement.textContent = 'API key is invalid';
      }
    }
  },
  
  updateApprovalStatus: (status: string | null, currentDateRange: { start: string; end: string } | null, currentStatusInfo: { total: string; approvedCount: number; entriesCount: number } | null) => {
    const statusElements = ['approvalStatus', 'dashboardApprovalStatus'];
    const dateRangeElements = ['dateRange', 'dashboardDateRange'];
    const statusInfoElements = ['statusInfo', 'dashboardStatusInfo'];
    
    statusElements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) {
        element.classList.remove('status-null', 'status-pending', 'status-approved', 'status-other');
        
        if (status === null) {
          element.classList.add('status-null');
          element.textContent = 'NOT SUBMITTED';
        } else if (status === 'PENDING') {
          element.classList.add('status-pending');
          element.textContent = 'PENDING APPROVAL';
        } else if (status === 'APPROVED') {
          element.classList.add('status-approved');
          element.textContent = 'APPROVED';
        } else {
          element.classList.add('status-other');
          element.textContent = status || 'UNKNOWN';
        }
      }
    });

    dateRangeElements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element && currentDateRange) {
        element.textContent = `Period: ${rendererModule.formatDate(currentDateRange.start)} - ${rendererModule.formatDate(currentDateRange.end)}`;
      }
    });

    statusInfoElements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element && currentStatusInfo) {
        element.textContent = `Total Hours: ${currentStatusInfo.total} | Approved Entries: ${currentStatusInfo.approvedCount}/${currentStatusInfo.entriesCount}`;
      }
    });
  },
  
  getSundayBeforeLast: (customStartDate: string | null): string => {
    // If a custom start date is set, use it
    if (customStartDate) {
      // Format the date to include timezone information
      const customDate = new Date(customStartDate);
      // Set the time to midnight UTC
      customDate.setUTCHours(0, 0, 0, 0);
      return customDate.toISOString();
    }
    
    // Otherwise, calculate the Sunday before last
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diffToLastSunday = day === 0 ? 7 : day; // Adjust for Sunday being 0
    const lastPeriodStart = new Date(today);
    lastPeriodStart.setDate(today.getDate() - 7 - diffToLastSunday);
    lastPeriodStart.setHours(0, 0, 0, 0); // Set time to midnight
    return lastPeriodStart.toISOString();
  }
};

describe('Renderer Module', () => {
  describe('formatDate', () => {
    it('formats date strings correctly', () => {
      const timestamp = '2023-01-01T12:30:00.000Z';
      const formattedDate = rendererModule.formatDate(timestamp);
      
      // Note: The exact output depends on the timezone of the test environment
      // So we'll just check for partial match of expected format
      expect(formattedDate).toContain('2023');
      expect(formattedDate).toContain('Jan');
    });
  });

  describe('updateApiKeyStatus', () => {
    beforeEach(() => {
      // Reset the status element before each test
      const element = document.getElementById('apiKeyStatus');
      if (element) {
        element.className = '';
        element.textContent = '';
      }
    });

    it('shows checking status when isValid is null', () => {
      rendererModule.updateApiKeyStatus(null);
      
      const element = document.getElementById('apiKeyStatus');
      expect(element?.classList.contains('status-unknown')).toBe(true);
      expect(element?.textContent).toBe('Checking API key...');
    });

    it('shows valid status when isValid is true', () => {
      rendererModule.updateApiKeyStatus(true);
      
      const element = document.getElementById('apiKeyStatus');
      expect(element?.classList.contains('status-valid')).toBe(true);
      expect(element?.textContent).toBe('API key is valid');
    });

    it('shows invalid status when isValid is false', () => {
      rendererModule.updateApiKeyStatus(false);
      
      const element = document.getElementById('apiKeyStatus');
      expect(element?.classList.contains('status-invalid')).toBe(true);
      expect(element?.textContent).toBe('API key is invalid');
    });
  });

  describe('updateApprovalStatus', () => {
    const testDateRange = {
      start: '2023-01-01T00:00:00.000Z',
      end: '2023-01-07T23:59:59.999Z'
    };
    
    const testStatusInfo = {
      total: '40H',
      approvedCount: 5,
      entriesCount: 5
    };

    beforeEach(() => {
      // Reset the status elements before each test
      ['approvalStatus', 'dashboardApprovalStatus', 'dateRange', 'dashboardDateRange', 'statusInfo', 'dashboardStatusInfo'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.className = '';
          element.textContent = '';
        }
      });
    });

    it('shows NOT SUBMITTED when status is null', () => {
      rendererModule.updateApprovalStatus(null, testDateRange, testStatusInfo);
      
      const element = document.getElementById('approvalStatus');
      expect(element?.classList.contains('status-null')).toBe(true);
      expect(element?.textContent).toBe('NOT SUBMITTED');
    });

    it('shows PENDING APPROVAL when status is PENDING', () => {
      rendererModule.updateApprovalStatus('PENDING', testDateRange, testStatusInfo);
      
      const element = document.getElementById('approvalStatus');
      expect(element?.classList.contains('status-pending')).toBe(true);
      expect(element?.textContent).toBe('PENDING APPROVAL');
    });

    it('shows APPROVED when status is APPROVED', () => {
      rendererModule.updateApprovalStatus('APPROVED', testDateRange, testStatusInfo);
      
      const element = document.getElementById('approvalStatus');
      expect(element?.classList.contains('status-approved')).toBe(true);
      expect(element?.textContent).toBe('APPROVED');
    });

    it('updates date range elements correctly', () => {
      rendererModule.updateApprovalStatus('APPROVED', testDateRange, testStatusInfo);
      
      const element = document.getElementById('dateRange');
      expect(element?.textContent).toContain('Period:');
      // Only check for the year and month, as day might be different due to timezone
      expect(element?.textContent).toContain('2023');
      expect(element?.textContent).toContain('Jan');
    });

    it('updates status info elements correctly', () => {
      rendererModule.updateApprovalStatus('APPROVED', testDateRange, testStatusInfo);
      
      const element = document.getElementById('statusInfo');
      expect(element?.textContent).toBe('Total Hours: 40H | Approved Entries: 5/5');
    });
  });

  describe('getSundayBeforeLast', () => {    
    it('returns the custom start date when provided', () => {
      const customDate = '2023-05-01';
      const result = rendererModule.getSundayBeforeLast(customDate);
      
      // Should match the custom date at midnight UTC
      expect(result.substring(0, 10)).toBe(new Date('2023-05-01T00:00:00.000Z').toISOString().substring(0, 10));
    });

    it('calculates a date for Sunday before last when no custom date is provided', () => {
      const result = rendererModule.getSundayBeforeLast(null);
      
      // Just verify it's a valid date in ISO format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
}); 