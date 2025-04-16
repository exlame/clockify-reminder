import { app, BrowserWindow, dialog, ipcMain, ipcRenderer, Menu, nativeImage, Notification, Tray } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import Store from 'electron-store';
import dotenv from 'dotenv';
import iconData from '../images/favicon-32x32.png';
import { updateElectronApp } from 'update-electron-app';
updateElectronApp(); // additional configuration options available

// Load environment variables
dotenv.config();

interface StoreSchema {
    apiKey: string | null;
}

// Initialize secure store
const store = new Store<StoreSchema>({
    encryptionKey: process.env.ENCRYPTION_KEY,
    clearInvalidConfig: true,
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Set up auto-launch with platform-specific settings
const setAutoLaunch = () => {
  if (process.platform === 'darwin') {
    // macOS specific settings
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true, // Start hidden on macOS
    });
  } else {
    // Windows settings
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe'),
      args: ['--hidden'], // Add a flag to start hidden
    });
  }
};

// Call the function to set up auto-launch
setAutoLaunch();

// Track if we're starting hidden
const isStartingHidden = process.argv.includes('--hidden');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: !isStartingHidden, // Hide window if starting with --hidden flag
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Create tray icon
  createTray();

  // Handle window close event
  mainWindow.on('close', (event) => {
    // Prevent the window from being destroyed
    event.preventDefault();
    
    // Hide the window instead
    if (mainWindow) {
      mainWindow.hide();
    }
  });
};

const createTray = () => {
  try {
    const icon = nativeImage.createFromDataURL(iconData);
    if (icon.isEmpty()) {
      console.error('Failed to load tray icon. Icon is empty.');
    } else {
      tray = new Tray(icon);

      // Set tooltip
      tray.setToolTip('Clockify Timesheet Monitor');

      // Create context menu
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show Window',
          click: () => {
            if (mainWindow) {
              mainWindow.show();
            } else {
              createWindow();
            }
          }
        },
        {
          label: 'Toggle Window',
          click: () => {
            if (mainWindow) {
              mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
            } else {
              createWindow();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click: () => {
            // Force app to quit completely
            app.exit(0);
          }
        }
      ]);

      tray.setContextMenu(contextMenu);

      // Handle tray click
      tray.on('click', () => {
        if (mainWindow) {
          mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        } else {
          createWindow();
        }
      });
    }
  } catch (error) {
    console.error('Error creating tray icon:', error);
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Prevent app from quitting when all windows are closed
app.on('window-all-closed', () => {
  // Don't quit the app when all windows are closed (keep running in background)
  // Only quit explicitly when user chooses Exit from tray menu
  if (process.platform !== 'darwin') {
    // On macOS it's common for applications to stay open until explicitly quit
    // For Windows/Linux, we'll keep the same behavior for consistency
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    // Show the window if it exists but is hidden
    if (mainWindow) {
      mainWindow.show();
    }
  }
});

let popup: any = null;

ipcMain.handle('open-popup', (event, arg) => {
  if(!popup) {
    popup = dialog.showMessageBox({title: 'Clockify', message: 'Houla! Ta feuille de temps n\'est pas soumise', }).then(() => {
      popup = null;
    });
  }

  if(Notification.isSupported()) {
    const noti = new Notification({
      title: 'Clockify',
      body: 'Houla! Ta feuille de temps n\'est pas soumise',
    });
    noti.show();
  }
});

// Add these handlers before the end of the file
ipcMain.handle('save-api-key', async (event, key: string) => {
    (store as any).set('apiKey', key);
    return true;
});

ipcMain.handle('get-api-key', async () => {
    return (store as any).get('apiKey');
});

ipcMain.handle('close-window', () => {
    if (mainWindow) {
        mainWindow.hide();
    }
});

ipcMain.handle('get-env', (event, key: string) => {
    return process.env[key];
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
