/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import { REFRESH_INTERVAL_SECONDS, VALIDATION_DAY, API_ENDPOINTS, DAY_NAMES, setupRefreshInterval, CUSTOM_START_DATE } from './config';

let weAreOnMOnday = false;
let apiKey: string | null = null;
let isApiKeyValidated = false;
let defaultWorkspace: string | null = null;
let userId: string | null = null;
let currentApprovalStatus: string | null = null;
let currentDateRange: { start: string; end: string } | null = null;
let currentStatusInfo: { total: string; approvedCount: number; entriesCount: number } | null = null;
let tutorialCompleted = false;

// Tutorial navigation
let currentStep = 1;
const totalSteps = 3;

// Function to format date string
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Function to update the API key status display
function updateApiKeyStatus(isValid: boolean | null) {
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
}

// Function to update the approval status display
function updateApprovalStatus(status: string | null) {
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
            element.textContent = `Period: ${formatDate(currentDateRange.start)} - ${formatDate(currentDateRange.end)}`;
        }
    });

    statusInfoElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element && currentStatusInfo) {
            element.textContent = `Total Hours: ${currentStatusInfo.total} | Approved Entries: ${currentStatusInfo.approvedCount}/${currentStatusInfo.entriesCount}`;
        }
    });
}

// Function to check if today is the validation day
function checkIfValidationDay() {
    const today = new Date();
    weAreOnMOnday = today.getDay() === VALIDATION_DAY;
    console.log(`Is it the validation day (${DAY_NAMES[VALIDATION_DAY]})?`, weAreOnMOnday);
}

// Function to get the Sunday before the last Sunday
function getSundayBeforeLast() {
    // If a custom start date is set, use it
    if (CUSTOM_START_DATE) {
        // Format the date to include timezone information
        const customDate = new Date(CUSTOM_START_DATE);
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

// Function to validate API key
async function validateApiKey(key: string): Promise<boolean> {
    try {
        const response = await fetch(API_ENDPOINTS.USER_INFO, {
            headers: {
                'X-Api-Key': key
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            defaultWorkspace = data.defaultWorkspace;
            userId = data.id;
            console.log('User workspace:', defaultWorkspace);
            console.log('User ID:', userId);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error validating API key:', error);
        return false;
    }
}

// Function to call the API
async function fetchApiData(forceFetch = false) {
    if (!forceFetch) {
        checkIfValidationDay();
    }
    
    try {
        if ((forceFetch || weAreOnMOnday) && apiKey && isApiKeyValidated && defaultWorkspace && userId) {
            const sundayBeforeLast = getSundayBeforeLast();
            const apiUrl = API_ENDPOINTS.APPROVAL_STATUS(defaultWorkspace, userId, sundayBeforeLast);
            const response = await fetch(apiUrl, {
                headers: {
                    'X-Api-Key': apiKey
                }
            });
            const data = await response.json();
            console.log('API Data:', data);
            
            // Update the approval status display
            currentApprovalStatus = data?.status || null;
            currentDateRange = data?.dateRange || null;
            currentStatusInfo = {
                total: data?.total || '0H',
                approvedCount: data?.approvedCount || 0,
                entriesCount: data?.entriesCount || 0
            };
            updateApprovalStatus(currentApprovalStatus);
            
            if(data && data.status === null) {
                window.electronAPI.openPopup();
            }
        } else {
            // If we can't fetch data, show a message
            currentDateRange = null;
            currentStatusInfo = null;
            updateApprovalStatus(null);
        }
    } catch (error) {
        console.error('Error fetching API data:', error);
        currentDateRange = null;
        currentStatusInfo = null;
        updateApprovalStatus(null);
    }
}

// Function to initialize API key from storage and validate it
async function initializeApiKey() {
    console.log('Initializing API key');
    updateApiKeyStatus(null);
    const storedKey = await window.electronAPI.getApiKey();
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    const prefilledMessage = document.getElementById('prefilledMessage');
    const tutorialSteps = document.getElementById('tutorialSteps');
    const dashboardView = document.getElementById('dashboardView');
    
    // Initially hide dashboard and show tutorial steps
    if (dashboardView) dashboardView.classList.add('hidden');
    if (tutorialSteps) tutorialSteps.classList.remove('hidden');
    
    if (storedKey) {
        apiKey = storedKey;
        apiKeyInput.value = storedKey;
        isApiKeyValidated = await validateApiKey(storedKey);
        updateApiKeyStatus(isApiKeyValidated);
        
        if (isApiKeyValidated) {
            console.log('API key validated successfully on startup');
            if (prefilledMessage) {
                prefilledMessage.style.display = 'block';
            }
            
            // Show dashboard if API key is valid
            if (dashboardView && tutorialSteps) {
                dashboardView.classList.remove('hidden');
                tutorialSteps.classList.add('hidden');
                tutorialCompleted = true;
            }
            fetchApiData(true);
        } else {
            // Clear invalid key and show tutorial step 1
            apiKey = null;
            defaultWorkspace = null;
            userId = null;
            apiKeyInput.value = '';
            await window.electronAPI.saveApiKey('');
            console.log('Invalid API key found on startup, cleared from storage');
            showStep(1);
        }
    } else {
        // No API key found, show tutorial step 1
        updateApiKeyStatus(false);
        console.log('No API key found in storage');
        showStep(1);
    }
}

// Tutorial navigation
function updateTutorialNavigation() {
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const closeButton = document.getElementById('closeWindow');

    if (prevButton) {
        prevButton.classList.toggle('hidden', currentStep === 1);
    }

    if (nextButton) {
        // Hide next button on step 3
        nextButton.classList.toggle('hidden', currentStep === totalSteps);
    }

    if (closeButton) {
        closeButton.classList.toggle('hidden', currentStep !== totalSteps);
    }
}

function showStep(step: number) {
    // Hide all steps
    for (let i = 1; i <= totalSteps; i++) {
        const stepElement = document.getElementById(`tutorialStep${i}`);
        if (stepElement) {
            stepElement.classList.remove('active');
        }
    }

    // Show current step
    const currentStepElement = document.getElementById(`tutorialStep${step}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }

    currentStep = step;
    updateTutorialNavigation();
}

// Function to clear all data
async function clearAllData() {
    try {
        // Clear API key
        await window.electronAPI.saveApiKey('');
        apiKey = null;
        isApiKeyValidated = false;
        defaultWorkspace = null;
        userId = null;

        // Clear UI elements
        const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
        const prefilledMessage = document.getElementById('prefilledMessage');
        const approvalStatus = document.getElementById('approvalStatus');
        const dateRange = document.getElementById('dateRange');
        const statusInfo = document.getElementById('statusInfo');

        if (apiKeyInput) apiKeyInput.value = '';
        if (prefilledMessage) prefilledMessage.style.display = 'none';
        if (approvalStatus) approvalStatus.textContent = 'Checking status...';
        if (dateRange) dateRange.textContent = '';
        if (statusInfo) statusInfo.textContent = '';

        // Update API key status
        updateApiKeyStatus(false);
        
        // Show tutorial and hide dashboard
        const tutorialSteps = document.getElementById('tutorialSteps');
        const dashboardView = document.getElementById('dashboardView');
        
        if (tutorialSteps && dashboardView) {
            tutorialSteps.classList.remove('hidden');
            dashboardView.classList.add('hidden');
            tutorialCompleted = false;
        }
        
        showStep(1);
        alert('All data has been cleared successfully.');
    } catch (error) {
        console.error('Error clearing data:', error);
        alert('An error occurred while clearing data. Please try again.');
    }
}

// Create a function for setting up event listeners
function setupEventListeners() {
    const saveButton = document.getElementById('saveApiKey');
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    const clearDataButton = document.getElementById('clearData');
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const closeButton = document.getElementById('closeWindow');
    
    // Clear data button
    clearDataButton?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            await clearAllData();
        }
    });

    // API Key save button
    saveButton?.addEventListener('click', async () => {
        const newApiKey = apiKeyInput?.value;
        if (newApiKey) {
            updateApiKeyStatus(null);
            const isValid = await validateApiKey(newApiKey);
            updateApiKeyStatus(isValid);
            
            if (isValid) {
                await window.electronAPI.saveApiKey(newApiKey);
                apiKey = newApiKey;
                isApiKeyValidated = true;
                alert('API key validated and saved successfully!');
                fetchApiData(true);
            } else {
                alert('Invalid API key. Please check and try again.');
                apiKeyInput.value = '';
                defaultWorkspace = null;
                userId = null;
            }
        }
    });

    // Navigation buttons
    prevButton?.addEventListener('click', () => {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });

    nextButton?.addEventListener('click', () => {
        console.log('Next button clicked, current step:', currentStep);
        if (currentStep < totalSteps) {
            if (currentStep === 1 && !isApiKeyValidated) {
                alert('Please enter and validate your API key first');
                return;
            }
            console.log('Moving to step:', currentStep + 1);
            showStep(currentStep + 1);
        }
    });

    // Close window button
    closeButton?.addEventListener('click', () => {
        const tutorialSteps = document.getElementById('tutorialSteps');
        const dashboardView = document.getElementById('dashboardView');
        
        if (tutorialSteps && dashboardView) {
            tutorialSteps.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            tutorialCompleted = true;
        }
        
        window.electronAPI.closeWindow();
    });

    // Add dashboard close button handler
    const dashboardClose = document.getElementById('dashboardClose');
    dashboardClose?.addEventListener('click', () => {
        window.electronAPI.closeWindow();
    });
}

// Modify the initialization logic to run only once
console.log('Renderer script loaded');
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('DOMContentLoaded event fired');
        await initializeApiKey();
        setupEventListeners();
        updateTutorialNavigation();
        // Set up the refresh interval
        setupRefreshInterval(() => fetchApiData(false));
    });
} else {
    console.log('Document already loaded, initializing manually');
    (async () => {
        await initializeApiKey();
        setupEventListeners();
        updateTutorialNavigation();
        // Set up the refresh interval
        setupRefreshInterval(() => fetchApiData(false));
    })();
}

console.log('👋 This message is being logged by "renderer.ts", included via Vite');
