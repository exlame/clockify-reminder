/**
 * Application Configuration
 * 
 * This file contains all the configurable settings for the application.
 * Settings can be overridden by environment variables for development.
 */

// Default refresh interval in seconds
const DEFAULT_REFRESH_INTERVAL_SECONDS = 6 * 60;

// Default validation day (0 = Sunday, 1 = Monday, 2 = Tuesday, etc.)
const DEFAULT_VALIDATION_DAY = 1; // Monday

// Initialize with default values
let REFRESH_INTERVAL_SECONDS = DEFAULT_REFRESH_INTERVAL_SECONDS;
let VALIDATION_DAY = DEFAULT_VALIDATION_DAY;
let intervalId: NodeJS.Timeout | null = null;
let CUSTOM_START_DATE: string | null = null;

// Load environment variables asynchronously
async function loadEnvVariables() {
    const refreshInterval = await window.electronAPI.getEnv('REFRESH_INTERVAL_SECONDS');
    const validationDay = await window.electronAPI.getEnv('VALIDATION_DAY');
    const customStartDate = await window.electronAPI.getEnv('CUSTOM_START_DATE');

    if (refreshInterval) {
        REFRESH_INTERVAL_SECONDS = parseInt(refreshInterval, 10);
    }
    if (validationDay) {
        VALIDATION_DAY = parseInt(validationDay, 10);
    }
    if (customStartDate) {
        CUSTOM_START_DATE = customStartDate;
    }

    console.log(`Application Configuration:
- Refresh Interval: ${REFRESH_INTERVAL_SECONDS} seconds
- Validation Day: ${DAY_NAMES[VALIDATION_DAY]} (${VALIDATION_DAY})
- Custom Start Date: ${CUSTOM_START_DATE || 'Not set (using auto-selected Sunday)'}
- Environment Variables: ${refreshInterval ? 'REFRESH_INTERVAL_SECONDS, ' : ''}${validationDay ? 'VALIDATION_DAY, ' : ''}${customStartDate ? 'CUSTOM_START_DATE' : ''}
`);
}

// Function to set up the refresh interval
export function setupRefreshInterval(fetchCallback: () => void) {
    // Clear any existing interval
    if (intervalId) {
        clearInterval(intervalId);
    }
    
    // Set up new interval with current REFRESH_INTERVAL_SECONDS
    intervalId = setInterval(fetchCallback, REFRESH_INTERVAL_SECONDS * 1000);
    console.log(`Refresh interval set to ${REFRESH_INTERVAL_SECONDS} seconds`);
}

// Load environment variables
loadEnvVariables();

export { REFRESH_INTERVAL_SECONDS, VALIDATION_DAY, CUSTOM_START_DATE };

// API endpoints
export const API_ENDPOINTS = {
  USER_INFO: 'https://api.clockify.me/api/v1/user',
  APPROVAL_STATUS: (workspaceId: string, userId: string, startDate: string) => 
    `https://app.clockify.me/api/workspaces/${workspaceId}/users/${userId}/approval-requests/status?start=${startDate}`
};

// Day names for reference
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// Log the current configuration
console.log(`Application Configuration:
- Refresh Interval: ${REFRESH_INTERVAL_SECONDS} seconds
- Validation Day: ${DAY_NAMES[VALIDATION_DAY]} (${VALIDATION_DAY})
- Custom Start Date: ${CUSTOM_START_DATE || 'Not set (using auto-selected Sunday)'}
- Environment Variables: ${REFRESH_INTERVAL_SECONDS ? 'REFRESH_INTERVAL_SECONDS, ' : ''}${VALIDATION_DAY ? 'VALIDATION_DAY, ' : ''}${CUSTOM_START_DATE ? 'CUSTOM_START_DATE' : ''}
`); 