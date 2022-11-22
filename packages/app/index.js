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

  if (module.context) {
    module.context.publisher = publisher
    module.context.subscriber = sub
    module.context.publish = (topic, msg) => {
      publisher.publish(`${ctx}.${topic}`, msg)
    }
    module.context.publishToAll = (topic, msg) => {
      publisher.publish(topic, msg)
    }
  }

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
  // Set up our endpoint.
  const end = publisher.connect('*', (msg) => {
    mainWindow.webContents.send('publish', msg)
  })

  // Create our window.
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, 'public/app.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
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
    return await (await fs.readdir('../../modules', { withFileTypes: true })).filter(v=>v.isDirectory()).map(v=>v.name)
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
    publisher.publish(end, msg)
  })
})
