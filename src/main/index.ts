import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import appPng from '../../resources/icon.icns?asset'
import appIcon from '../../resources/icon.ico?asset'
import Store from 'electron-store'
const store = new Store()

let mainWindow: BrowserWindow

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    title: 'WorkHours',
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: appIcon } : { icon: appPng }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.myss.workHours.app')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 定义ipcRenderer监听事件
  ipcMain.on('setStore', async (_, key, value) => {
    store.set(key, value)
  })

  ipcMain.handle('getStore', async (_, key) => {
    const value = await store.get(key)
    return value
  })

  ipcMain.on('setTop', async () => {
    //窗体置顶，窗体级别（由低到高）：normal, floating, torn-off-menu, modal-panel, main-menu, status, pop-up-menu, screen-saver
    mainWindow?.setAlwaysOnTop(true, 'screen-saver')
  })

  ipcMain.on('cancelTop', async () => {
    //取消窗体置顶
    mainWindow?.setAlwaysOnTop(false)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
