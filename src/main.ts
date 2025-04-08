import { app, BrowserWindow, dialog, ipcMain, ipcRenderer, Menu, nativeImage, Notification, Tray } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import Store from 'electron-store';

// Initialize secure store
const store = new Store({
  encryptionKey: 'your-encryption-key', // You should use a secure key in production
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  const icon = nativeImage.createFromPath('./favicon-32x32.png')

  const menu = Menu.buildFromTemplate([

    {role: "quit"}, // "role": system prepared action menu
]);
  const tray = new Tray(icon)
  tray.setContextMenu(menu);

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let popup: any = null;

ipcMain.handle('open-popup', (event, arg) => {
  
  if(!popup) {
    popup = dialog.showMessageBox({title: 'Clockify', message: 'Houla! Ta feuille de temps n\'est pas soumise', }).then(() => {
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
ipcMain.handle('save-api-key', async (event, key) => {
  store.set('apiKey', key);
  return true;
});

ipcMain.handle('get-api-key', async () => {
  return store.get('apiKey');
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
