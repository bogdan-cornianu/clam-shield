import { contextBridge, ipcRenderer } from "electron";

// Safely expose methods to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  scanDirectory: (path, maxSizeMB) => ipcRenderer.send('scan-directory', path, maxSizeMB),
  removeScanStatusListener: (callback: (event: any, message: { file: string; status: string; virus?: string }) => void) =>
      ipcRenderer.removeListener('scan-status', callback),
  onDatabaseStatus: (callback: (event: any, message: string) => void) => ipcRenderer.on('database-status', callback),
  onScanStatus: (callback: (event: any, message: { file: string; status: string; virus?: string }) => void) =>
      ipcRenderer.on('scan-status', callback),
});

