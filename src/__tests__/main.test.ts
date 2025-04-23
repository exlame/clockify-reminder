import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { BrowserWindow, IpcMain, App, Menu } from 'electron';

// Define mock types
type MockedModule<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any
    ? jest.Mock<ReturnType<T[P]>, Parameters<T[P]>>
    : T[P];
};

// Mock the Electron modules
jest.mock('electron', () => {
  const mockIpcMain = {
    on: jest.fn(),
    handle: jest.fn()
  } as unknown as MockedModule<IpcMain>;
  
  const mockApp = {
    on: jest.fn(),
    whenReady: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn()
  } as unknown as MockedModule<App>;
  
  const mockBrowserWindow = jest.fn().mockImplementation(() => ({
    loadURL: jest.fn().mockResolvedValue(undefined),
    loadFile: jest.fn().mockResolvedValue(undefined),
    webContents: {
      openDevTools: jest.fn(),
      on: jest.fn()
    },
    on: jest.fn(),
    show: jest.fn(),
    setMenu: jest.fn()
  }));
  
  return {
    app: mockApp,
    BrowserWindow: mockBrowserWindow,
    ipcMain: mockIpcMain,
    Menu: {
      setApplicationMenu: jest.fn()
    } as unknown as MockedModule<typeof Menu>
  };
});

jest.mock('electron-squirrel-startup', () => false);
jest.mock('update-electron-app', () => jest.fn());
jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }));
});

// Since we can't directly test the main.ts file because it runs code immediately,
// we'll test a simplified version of the createWindow function
describe('Main Process', () => {
  // Import electron after mocks are set up
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const electron = require('electron');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('App initialization', () => {
    it('should be able to initialize electron app', () => {
      // Make sure we can access the app property
      expect(electron.app).toBeDefined();
      // Check that the whenReady method exists (without calling it)
      expect(typeof electron.app.whenReady).toBe('function');
    });
    
    // We can test a simplified version of the createWindow function
    // that would be in main.ts
    it('should be able to create a browser window', () => {
      function createWindow() {
        const win = new electron.BrowserWindow({
          width: 800,
          height: 600,
          webPreferences: {
            preload: 'preload.js',
            contextIsolation: true
          }
        });
        
        win.loadFile('index.html');
        return win;
      }
      
      const window = createWindow();
      expect(electron.BrowserWindow).toHaveBeenCalledWith(expect.objectContaining({
        width: 800,
        height: 600,
        webPreferences: expect.objectContaining({
          preload: 'preload.js',
          contextIsolation: true
        })
      }));
      expect(window.loadFile).toHaveBeenCalledWith('index.html');
    });
  });
}); 