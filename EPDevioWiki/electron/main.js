const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const distPath = path.join(__dirname, '..', 'dist', 'EPDevioWiki', 'browser');

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(distPath, 'favicon.ico'),
    title: 'EPDevio Wiki',
  });

  mainWindow.loadFile(path.join(distPath, 'index.html'));

  mainWindow.on('closed', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
