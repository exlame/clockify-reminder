// Mock Electron
const electron = {
  app: {
    on: jest.fn(),
    whenReady: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn()
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn().mockResolvedValue(undefined),
    loadFile: jest.fn().mockResolvedValue(undefined),
    webContents: {
      openDevTools: jest.fn(),
      on: jest.fn(),
      send: jest.fn()
    },
    on: jest.fn(),
    show: jest.fn(),
    setMenu: jest.fn()
  })),
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn()
  },
  Menu: {
    setApplicationMenu: jest.fn()
  }
};

export = electron; 