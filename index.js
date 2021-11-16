const { app, screen, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
require('electron-app-settings')

app.on("ready", async () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  mainWindow.loadFile(path.join(__dirname, "public/index.html"))
  mainWindow.webContents.openDevTools()
  ipcMain.handle('getPath', async (e, w) => {
    return app.getPath(w)
  })
  ipcMain.handle('getLocale', async () => {
    return app.getLocale()
  })
  ipcMain.handle('getDisplaySize', async () => {
    return screen.getPrimaryDisplay().size
  })
})

