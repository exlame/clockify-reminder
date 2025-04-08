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

let weAreOnMOnday = false;
let apiKey: string | null = null;

// Function to check if today is Monday
function checkIfMonday() {
    const today = new Date();
    weAreOnMOnday = today.getDay() === 2; // 1 represents Monday
    console.log('Is it Monday?', weAreOnMOnday);
}

// Function to get the Sunday before the last Sunday
function getSundayBeforeLast() {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diffToLastSunday = day === 0 ? 7 : day; // Adjust for Sunday being 0
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - diffToLastSunday);
    lastSunday.setHours(0, 0, 0, 0); // Set time to midnight
    return lastSunday.toISOString();
}

// Function to call the API
async function fetchApiData() {
    try {
        if (weAreOnMOnday && apiKey) {
            const sundayBeforeLast = getSundayBeforeLast();
            const apiUrl = `https://app.clockify.me/api/workspaces/64e8851766b77570d788cf3f/users/671be8c7391d37193731d979/approval-requests/status?start=${sundayBeforeLast}`;
            const response = await fetch(apiUrl, {
                headers: {
                    'X-Api-Key': apiKey
                }
            });
            const data = await response.json();
            console.log('API Data:', data);
            if(data && data.status === null) {
                window.electronAPI.openPopup();
            }
        }
    } catch (error) {
        console.error('Error fetching API data:', error);
    }
}

// Initialize the API key from storage
async function initializeApiKey() {
    apiKey = await window.electronAPI.getApiKey();
    if (apiKey) {
        document.getElementById('apiKey')?.setAttribute('value', apiKey);
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeApiKey();
    
    const saveButton = document.getElementById('saveApiKey');
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    
    saveButton?.addEventListener('click', async () => {
        const newApiKey = apiKeyInput?.value;
        if (newApiKey) {
            await window.electronAPI.saveApiKey(newApiKey);
            apiKey = newApiKey;
            alert('API key saved successfully!');
        }
    });
});

checkIfMonday();
fetchApiData();

// Set up an interval to call the API every 1 minute
setInterval(fetchApiData, 1 * 20 * 1000);

console.log('👋 This message is being logged by "renderer.ts", included via Vite');
