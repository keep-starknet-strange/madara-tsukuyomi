/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { BrowserWindow, app, ipcMain, shell } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { initializeApp } from 'firebase/app';
import * as Madara from './madara';
import * as MadaraApp from './madara-app';
import { resolveHtmlPath } from './util';
import createShortLink from './firebase';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.handle('madara-start', async (event, config: Madara.MadaraConfig) => {
  await Madara.start(mainWindow as BrowserWindow, config);
});

ipcMain.handle('madara-stop', async () => {
  await Madara.stop();
});

ipcMain.handle('madara-delete', async () => {
  await Madara.deleteNode();
});

ipcMain.handle('madara-setup', async (event, config: Madara.MadaraConfig) => {
  await Madara.setup(mainWindow as BrowserWindow, config);
});

ipcMain.handle('release-exists', (event, config: Madara.MadaraConfig) => {
  return Madara.releaseExists(config);
});

ipcMain.handle('send-tweet', async () => {
  await Madara.getScreenShotWindow(mainWindow as BrowserWindow);
  const firebaseConfig = {
    apiKey: 'AIzaSyC-u7ceUKNo8jyKw5I1YEazN4poQqhngbo',
    authDomain: 'test-b5696.firebaseapp.com',
    projectId: 'test-b5696',
    storageBucket: 'test-b5696.appspot.com',
    messagingSenderId: '627711477848',
    appId: '1:627711477848:web:17917840281ff63c3ca22d',
    measurementId: 'G-RL4PH93SQ3',
  };

  initializeApp(firebaseConfig);
  const file = await Madara.getFile();
  const shortURL = await Madara.uploadFilesToStorageFirebase(file);
  const getShortenedLink = await createShortLink(shortURL);
  shell.openExternal(
    `https://twitter.com/intent/tweet?text=Just%20ran%20my%20blazingly%20fast%20%40MadaraStarknet%20node%20in%20less%20than%20a%20minute%20%E2%9A%A1.%20Check%20out%20all%20the%20Sharingan%20nodes%20here%20-%20${getShortenedLink}`
  );
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

  console.log('this is the resolved - ', resolveHtmlPath('index.html'));
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
