import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: electronAPI
    api: unknown
  }
  interface electronAPI {
    setStore: (key, value) => void
    getStore: (key) => unknown
  }
}
