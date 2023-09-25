// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { MadaraConfig } from './types';

const electronHandler = {
  ipcRenderer: {
    madara: {
      setup: (config: MadaraConfig) =>
        ipcRenderer.invoke('madara-setup', config),
      start: (config: MadaraConfig) =>
        ipcRenderer.invoke('madara-start', config),
      stop: () => ipcRenderer.invoke('madara-stop'),
      delete: () => ipcRenderer.invoke('madara-delete'),
      onDownloadProgress: (callback: any) =>
        ipcRenderer.on('download-progress', callback),
      onNodeLogs: (callback: any) => ipcRenderer.on('node-logs', callback),
      onNodeStop: (callback: any) => ipcRenderer.on('node-stop', callback),
      releaseExists: (config: MadaraConfig) =>
        ipcRenderer.invoke('release-exists', config),
      childProcessInMemory: () => ipcRenderer.invoke('child-process-in-memory'),
      sendTweet: () => ipcRenderer.invoke('send-tweet'),
    },
    madaraApp: {
      download: (appId: string) =>
        ipcRenderer.invoke('madara-app-download', appId),
      onAppDownloadProgress: (callback: any) =>
        ipcRenderer.on('app-download-progress', callback),
      onAppDownloadComplete: (callback: any) =>
        ipcRenderer.on('app-download-complete', callback),
      onAppStart: (callback: any) => ipcRenderer.on('app-start', callback),
      onAppStop: (callback: any) => ipcRenderer.on('app-stop', callback),
      installedApps: () => ipcRenderer.invoke('madara-installed-apps'),
      startApp: (appId: string) =>
        ipcRenderer.invoke('madara-app-start', appId),
      stopApp: (appId: string) => ipcRenderer.invoke('madara-app-stop', appId),
      onAppLogs: (callback: any) => ipcRenderer.on('app-logs', callback),
      updateAppSettings: (appId: string, settings: any) =>
        ipcRenderer.invoke('madara-app-update-settings', appId, settings),
      getAppSettings: (appId: string) =>
        ipcRenderer.invoke('madara-app-get-settings', appId),
      fetchAllRunningApps: () =>
        ipcRenderer.invoke('madara-fetch-all-running-apps'),
    },
    onUnhandledError: (callback: (message: string) => void) =>
      ipcRenderer.on('backend-error', (event, message) => callback(message)),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
