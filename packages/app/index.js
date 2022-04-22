const { app, screen, BrowserWindow, ipcMain } = require("electron")
const { promises: fs } = require('fs')
const path = require("path")
require('electron-app-settings')
const { Publisher } = require('@kettek/pubsub')

// NOTE: The twitch service breaks if we don't have a global Headers defined.
const { Headers } = require('node-fetch')
global.Headers = Headers

const publisher = new Publisher()

let serviceSources = []
let services = []
async function createService(src) {
  let full = `../../services/${src.dir}/${src.main}`
  let module = (await import(full)).default

  let ctx = `service.${src.uuid}`
  let sub = publisher.subscribe(`${ctx}.*`)

  let s = {
    uuid: src.uuid,
    handler: async (msg) => {
      // strip the topics
      msg = {
        ...msg,
        sourceTopic: msg.sourceTopic.substring(ctx.length+1),
        topic: msg.sourceTopic.substring(ctx.length+1),
      }
      if (msg.sourceTopic === 'disable' || msg.topic === 'disable') {
        if (module.disable) {
          await module.disable()
        }
      } else if (msg.sourceTopic === 'enable' || msg.sourceTopic === 'enable') {
        if (module.enable) {
          await module.enable()
        }
      }
      if (module.receive) {
        await module.receive(msg)
      }
    },
    module,
  }

  sub.handler = s.handler

  return s
}

app.on("ready", async () => {
  // Set up our pubsub endpoints.
  const serviceEndpoint = publisher.connect('service.*', async (msg) => {
  })
  publisher.connect('service.*', serviceEndpoint)

  // Create our window.
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, 'public/app.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  mainWindow.loadFile(path.join(__dirname, "public/index.html"))
  mainWindow.webContents.openDevTools()

  // Set up our various IPC.
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
    serviceSources = []
    let files = await fs.readdir('../../services', {withFileTypes: true})
    for (let file of files) {
      if (file.isDirectory()) {
        let pkgsrc = `../../services/${file.name}/package.json`
        let pkg = JSON.parse(await fs.readFile(pkgsrc))
        serviceSources.push({
          dir: file.name,
          version: pkg.version,
          uuid: pkg.litch.uuid,
          main: pkg.exports.main,
          render: pkg.exports.render,
        })
      }
    }
    return serviceSources
  })
  ipcMain.handle('loadService', async (event, uuid) => {
    if (services.find(v=>v.uuid===uuid)) return false
    let src = serviceSources.find(v=>v.uuid===uuid)
    if (!src) return false
    let s = await createService(src)

    services.push(s)
    if (s.module.load) {
      await s.module.load()
    }
  })
  ipcMain.handle('publish', async (event, msg) => {
    publisher.publish(msg.topic, msg.message)
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
