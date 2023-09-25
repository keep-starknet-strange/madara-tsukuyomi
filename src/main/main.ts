/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'dotenv/config';
import { BrowserWindow, app, ipcMain, shell } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import * as Madara from './madara';
import * as MadaraApp from './madara-app';
import { resolveHtmlPath } from './util';
import { TWEET_INTENT } from './constants';
import { MadaraConfig } from './types';
import FireBaseService from './firebase';
import { set } from 'lodash';

let mainWindow: BrowserWindow | null = null;

process.on('uncaughtException', (error) => {
  console.error('Unhandled error from main process:', error);

  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('backend-error', error);
  });
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

ipcMain.handle('madara-start', async (event, config: MadaraConfig) => {
  await Madara.start(mainWindow as BrowserWindow, config);
});

ipcMain.handle('madara-stop', async () => {
  await Madara.stop();
});

ipcMain.handle('madara-delete', async () => {
  await Madara.deleteNode();
});

ipcMain.handle('madara-setup', async (event, config: MadaraConfig) => {
  await Madara.setup(mainWindow as BrowserWindow, config);
});

ipcMain.handle('release-exists', async (event, config: MadaraConfig) => {
  return Madara.releaseExists(config);
});

ipcMain.handle('send-tweet', async () => {
  await Madara.getCurrentWindowScreenshot(mainWindow as BrowserWindow);

  const file = await Madara.fetchScreenshotFromSystem();

  // return if screenshot image is not fetched
  if (!file) return;

  const imageURL = await FireBaseService.uploadFilesToStorageFirebase(file);
  const shortenedLink = await FireBaseService.createShortLink(imageURL);

  // return if link creation fails
  if (!shortenedLink) return;

  // open link in browser
  shell.openExternal(TWEET_INTENT + shortenedLink);
});

ipcMain.handle('child-process-in-memory', (): boolean => {
  return Madara.childProcessInMemory();
});

ipcMain.handle('madara-app-download', async (event, appId: string) => {
  await MadaraApp.downloadApp(mainWindow as BrowserWindow, appId);
});

ipcMain.handle('madara-installed-apps', () => {
  return MadaraApp.getInstalledApps();
});

ipcMain.handle('madara-app-start', (event, appId: string) => {
  return MadaraApp.startApp(mainWindow as BrowserWindow, appId);
});

ipcMain.handle('madara-app-stop', (event, appId: string) => {
  return MadaraApp.stopApp(mainWindow as BrowserWindow, appId);
});

ipcMain.handle(
  'madara-app-update-settings',
  (event, appId: string, settings: any) => {
    return MadaraApp.updateAppSettings(appId, settings);
  }
);

ipcMain.handle('madara-app-get-settings', (event, appId: string) => {
  return MadaraApp.getAppSettings(appId);
});

ipcMain.handle('madara-fetch-all-running-apps', () => {
  return MadaraApp.fetchAllRunningApps(mainWindow as BrowserWindow);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    // madara explorer ha some custom x-frame-options header that prevents it from being
    // loaded, this code ensures the iframe loads
    mainWindow.webContents.session.webRequest.onHeadersReceived(
      { urls: ['*://*/*'] },
      (details, callback) => {
        if (details && details.responseHeaders) {
          if (details.responseHeaders['X-Frame-Options']) {
            delete details.responseHeaders['X-Frame-Options'];
          } else if (details.responseHeaders['x-frame-options']) {
            delete details.responseHeaders['x-frame-options'];
          }
        }
        callback({ cancel: false, responseHeaders: details.responseHeaders });
      }
    );
  });

  mainWindow.on('closed', async () => {
    if (Madara.childProcessInMemory()) {
      Madara.stop();
    }
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
