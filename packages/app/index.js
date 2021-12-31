const { app, screen, BrowserWindow, ipcMain } = require("electron")
const { promises: fs } = require('fs')
const path = require("path")
require('electron-app-settings')

let services = []

app.on("ready", async () => {
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, 'public/app.png'),
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
  ipcMain.handle('getModules', async () => {
    return await fs.readdir('../../modules')
  })
  ipcMain.handle('getServices', async () => {
    services = []
    let files = await fs.readdir('../../services', {withFileTypes: true})
    for (let file of files) {
      if (file.isDirectory()) {
        services.push({
          dir: file.name,
          channel: {}, // TODO
          main: {}, // TODO
        })
      }
    }
    return services
  })
})

//
/*const express = require('express')
const crapp = express()
crapp.get('/login', (req, res) => {
  //console.log("oh", req, res)
  res.send("Got some sort of login thingie here...")
})
crapp.get('/', (req, res) => {
  //console.log("oh2", req, res)
  res.send("Got some sort of garbage login thingie here...")
})
crapp.listen(8090, () => {
  console.log('lsitetning')
})

const { ElectronAuthProvider } = require('@twurple/auth-electron')

const clientId = '59uderjhnb4qau8yr82b84x4x0f8ja'
const redirectUri = 'http://localhost:8090/login'

const authProvider = new ElectronAuthProvider({
  clientId,
  redirectUri
})
//authProvider.allowUserChange();

const { ApiClient } = require('@twurple/api');
const { ChatClient } = require('@twurple/chat');
const apiClient = new ApiClient({ authProvider });

console.log('uh...', authProvider)

setTimeout(async () => {
  const user = await apiClient.users.getUserByName("kts_kettek");
	if (!user) {
		return false;
	}
	console.log('kts', await user.getStream() !== null);

  console.log("time to try chatbot")
  const chatClient = new ChatClient({ authProvider, channels: ['kts_kettek'] });
  await chatClient.connect();
  console.log('chatbot is connected, hmmm')
  chatClient.onMessage((channel, user, message) => {
    console.log('message', channel, user, message)
    if (message === '!ping') {
      chatClient.say(channel, '[BOT] Pong!');
    } else if (message === '!dice') {
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      chatClient.say(channel, `[BOT] @${user} rolled a ${diceRoll}`)
    }
  });
  console.log(chatClient)
  chatClient.onAnyMessage(e => {
    console.log(e)
  })
}, 5000)*/