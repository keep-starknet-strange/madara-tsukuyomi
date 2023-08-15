/* eslint-disable no-await-in-loop */
import { ChildProcess, exec, execSync } from 'child_process';
import { BrowserWindow } from 'electron';
import { download } from 'electron-dl';
import { existsSync, readdirSync } from 'fs';
import APPS_CONFIG, { AppProperties } from '../../config/apps';
import { MADARA_APP_PATH } from './constants';
import Dockerode from 'dockerode';
import DockerodeCompose from 'dockerode-compose';

const APPS_FOLDER = `${MADARA_APP_PATH}/apps`;
const APP_PROCESSES: { [appId: string]: ChildProcess[] } = {};

export async function downloadApp(window: BrowserWindow, appId: string) {
  const appConfig = APPS_CONFIG.apps.filter((app) => app.id === appId)[0];
  for (let i = 0; i < appConfig.files.length; i++) {
    const binary = appConfig.files[i];
    await download(window, binary.url, {
      directory: `${APPS_FOLDER}/${appId}/${binary.name}`,
      saveAs: false,
      overwrite: true,
      onProgress: (progress: any) => {
        window.webContents.send('app-download-progress', {
          appId,
          filename: binary.name,
          progress,
        });
      },
    });
  }

  appConfig.postInstallationCommands.forEach((command) => {
    execSync(command, {
      cwd: `${APPS_FOLDER}/${appId}`,
    });
  });
  await startApp(window, appId);
  window.webContents.send('app-download-complete', {
    appId,
  });
}

export function getInstalledApps() {
  const installedApps: { [appId: string]: boolean } = {};
  if (existsSync(APPS_FOLDER) === false) {
    // create APPS_FOLDER directory
    execSync(`mkdir -p ${APPS_FOLDER}`);
  }
  readdirSync(APPS_FOLDER, { withFileTypes: true }).forEach((app) => {
    if (app.isDirectory()) {
      installedApps[app.name] = true;
    }
  });
  return installedApps;
}

export async function startApp(window: BrowserWindow, appId: string) {
  const appConfig = APPS_CONFIG.apps.filter((app) => app.id === appId)[0];
  if (appConfig.appType === 'binary') {
    await startAppBinary(appConfig);
  } else if (appConfig.appType === 'docker') {
  }
  window.webContents.send('app-start', {
    appId,
  });
}

async function startAppBinary(appConfig: AppProperties) {
  const appId = appConfig.id;
  if (APP_PROCESSES[appId] === undefined) {
    APP_PROCESSES[appId] = [];
  }
  appConfig.runCommamd.forEach((command) => {
    const process = exec(command, {
      cwd: `${APPS_FOLDER}/${appId}`,
    });
    APP_PROCESSES[appId].push(process);
  });
}

async function startAppDocker(appConfig: AppProperties) {
  const appId = appConfig.id;
  if (APP_PROCESSES[appId] === undefined) {
    APP_PROCESSES[appId] = [];
  }
  appConfig.runCommamd.forEach((command) => {
    const process = exec(command, {
      cwd: `${APPS_FOLDER}/${appId}`,
    });
    APP_PROCESSES[appId].push(process);
  });
}

export async function stopApp(window: BrowserWindow, appId: string) {
  if (APP_PROCESSES[appId] !== undefined) {
    APP_PROCESSES[appId].forEach((process) => {
      process.kill();
    });
    APP_PROCESSES[appId] = [];
  }
  window.webContents.send('app-stop', {
    appId,
  });
}
