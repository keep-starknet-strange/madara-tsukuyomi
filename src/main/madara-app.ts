/* eslint-disable no-await-in-loop */
import { ChildProcess, exec, execSync } from 'child_process';
import { BrowserWindow, app as ElectronApp } from 'electron';
import { download } from 'electron-dl';
import fs, { existsSync, readdirSync } from 'fs';
import Dockerode, { ContainerCreateOptions } from 'dockerode';
import _ from 'lodash';
import APPS_CONFIG, {
  BinaryAppProperties,
  CommonAppProperties,
  DockerAppProperties,
} from '../../config/apps';
import { MADARA_APP_PATH } from './constants';
import { AppAppendLogs } from './types';

const docker = new Dockerode();

const APPS_FOLDER = `${MADARA_APP_PATH}/apps`;
const APP_PROCESSES: { [appId: string]: ChildProcess[] } = {};

async function downloadAppBinary(
  window: BrowserWindow,
  appConfig: BinaryAppProperties
) {
  for (let i = 0; i < appConfig.files.length; i++) {
    const binary = appConfig.files[i];
    await download(window, binary.url, {
      directory: `${APPS_FOLDER}/${appConfig.id}/${binary.name}`,
      saveAs: false,
      overwrite: true,
      onProgress: (progress: any) => {
        window.webContents.send('app-download-progress', {
          appId: appConfig.id,
          filename: binary.name,
          progress,
        });
      },
    });
  }
}

async function downloadAppDocker(
  window: BrowserWindow,
  appConfig: DockerAppProperties
) {
  const containerPulls = appConfig.containers.map((container) => {
    return docker.pull(container.Image as string);
  });
  await Promise.all(containerPulls);

  // create the app folder, this will store the settings
  // and is also used to detect installed apps
  execSync(`mkdir -p ${APPS_FOLDER}/${appConfig.id}`);
}

export async function downloadApp(window: BrowserWindow, appId: string) {
  const appConfig = APPS_CONFIG.apps.filter((app) => app.id === appId)[0];
  if (appConfig.appType === 'binary') {
    await downloadAppBinary(window, appConfig);
  } else if (appConfig.appType === 'docker') {
    await downloadAppDocker(window, appConfig);
  }

  appConfig.postInstallationCommands.forEach((command) => {
    execSync(command, {
      cwd: `${APPS_FOLDER}/${appId}`,
    });
  });
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

async function startAppBinary(
  window: BrowserWindow,
  appConfig: BinaryAppProperties
) {
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

const getContainerName = (
  containerConfig: ContainerCreateOptions,
  appConfig: DockerAppProperties
) => {
  return `tsukuyomi-${appConfig.id}-${containerConfig.name}`;
};

async function startContainer(
  window: BrowserWindow,
  containerConfig: ContainerCreateOptions,
  appConfig: DockerAppProperties
) {
  const containerConfigParsed: ContainerCreateOptions = JSON.parse(
    _.template(JSON.stringify(containerConfig))({
      APP_ID: appConfig.id,
      ELECTRON_APP_DIRECTORY: ElectronApp.getAppPath(),
    })
  );
  const Env = containerConfigParsed.Env ?? [];
  const appSettings = await getAppSettings(appConfig.id);
  Object.entries(appSettings).forEach(([key, value]) =>
    Env.push(`${key}=${value}`)
  );
  const container = await docker.createContainer({
    ...containerConfigParsed,
    Env,
    AttachStdout: true,
    AttachStdin: true,
    AttachStderr: true,
    name: getContainerName(containerConfigParsed, appConfig),
  });
  // create a write stream

  container.attach(
    { stream: true, stdout: true, stderr: true },
    (err, stream) => {
      if (!stream) return;
      stream.on('data', (data) => {
        // removing the first 8 bytes as they have information about the stream
        const buffer = Buffer.from(data).subarray(8, data.length);
        const event: AppAppendLogs = {
          appId: appConfig.id,
          containerName: containerConfig.name as string,
          logs: buffer.toString(),
        };
        window.webContents.send('app-logs', event);
      });
    }
  );
  await container.start();
}

async function startAppDocker(
  window: BrowserWindow,
  appConfig: DockerAppProperties
) {
  const containerStarts = appConfig.containers.map((container) =>
    startContainer(window, container, appConfig)
  );
  await Promise.all(containerStarts);
}

export async function startApp(window: BrowserWindow, appId: string) {
  const appConfig = APPS_CONFIG.apps.filter((app) => app.id === appId)[0];
  if (appConfig.appType === 'binary') {
    await startAppBinary(window, appConfig);
  } else if (appConfig.appType === 'docker') {
    await startAppDocker(window, appConfig);
  }
  window.webContents.send('app-start', {
    appId,
  });
}

export async function stopApp(window: BrowserWindow, appId: string) {
  const appConfig = APPS_CONFIG.apps.filter((app) => app.id === appId)[0];
  if (appConfig.appType === 'binary') {
    await stopAppBinary(appConfig);
  } else if (appConfig.appType === 'docker') {
    await stopAppDocker(appConfig);
  }
  window.webContents.send('app-stop', {
    appId,
  });
}

async function stopAppBinary(appConfig: CommonAppProperties) {
  const appId = appConfig.id;
  if (APP_PROCESSES[appId] !== undefined) {
    APP_PROCESSES[appId].forEach((process) => {
      process.kill();
    });
    APP_PROCESSES[appId] = [];
  }
}

async function stopAppDocker(appConfig: DockerAppProperties) {
  const containerKills = appConfig.containers.map(async (containerConfig) => {
    try {
      await docker
        .getContainer(getContainerName(containerConfig, appConfig))
        .kill();
    } catch (err) {
      // TODO: check if the container is running and only kill then
    }
  });

  await Promise.all(containerKills);

  const containerRemoves = appConfig.containers.map((containerConfig) =>
    docker.getContainer(getContainerName(containerConfig, appConfig)).remove()
  );
  await Promise.all(containerRemoves);
}

export async function updateAppSettings(appId: string, settings: any) {
  fs.writeFileSync(
    `${APPS_FOLDER}/${appId}/settings.json`,
    JSON.stringify(settings)
  );
}

export async function getAppSettings(appId: string) {
  const settingsPath = `${APPS_FOLDER}/${appId}/settings.json`;
  if (existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath).toString());
  }
  return {};
}
