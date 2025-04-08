// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    openPopup: () => ipcRenderer.invoke('open-popup'),
    saveApiKey: (key: string) => ipcRenderer.invoke('save-api-key', key),
    getApiKey: () => ipcRenderer.invoke('get-api-key'),
});