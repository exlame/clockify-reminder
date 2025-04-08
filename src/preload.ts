// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Define the API interface
interface IElectronAPI {
    openPopup: () => Promise<void>;
    saveApiKey: (key: string) => Promise<void>;
    getApiKey: () => Promise<string | null>;
    closeWindow: () => void;
    getEnv: (key: string) => Promise<string | undefined>;
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    openPopup: () => ipcRenderer.invoke('open-popup'),
    saveApiKey: (key: string) => ipcRenderer.invoke('save-api-key', key),
    getApiKey: () => ipcRenderer.invoke('get-api-key'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    getEnv: (key: string) => ipcRenderer.invoke('get-env', key)
} as IElectronAPI);

// Add type declaration for the window object
declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}