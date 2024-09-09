import { contextBridge, ipcRenderer } from "electron";

// Safely expose methods to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  scanDirectory: (path, maxSizeMB) => ipcRenderer.send('scan-directory', path, maxSizeMB),
  onDatabaseStatus: (callback: (event: any, message: string) => void) => ipcRenderer.on('database-status', callback),
  onScanStatus: (callback) => ipcRenderer.on('scan-status', callback)
});

