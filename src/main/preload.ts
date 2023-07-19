// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { MadaraConfig } from './madara';

const electronHandler = {
  ipcRenderer: {
    madara: {
      setup: (config: MadaraConfig) =>
        ipcRenderer.invoke('madara-setup', config),
      start: (config: MadaraConfig) =>
        ipcRenderer.invoke('madara-start', config),
      stop: () => ipcRenderer.invoke('madara-stop'),
      onDownloadProgress: (callback: any) =>
        ipcRenderer.on('download-progress', callback),
      onNodeLogs: (callback: any) => ipcRenderer.on('node-logs', callback),
      onNodeStop: (callback: any) => ipcRenderer.on('node-stop', callback),
      releaseExists: (config: MadaraConfig) =>
        ipcRenderer.invoke('release-exists', config),
      childProcessInMemory: () => ipcRenderer.invoke('child-process-in-memory'),
      sendTweet: () => ipcRenderer.invoke('send-tweet'),
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
