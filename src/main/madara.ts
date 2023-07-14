import { ChildProcessWithoutNullStreams, spawn, execSync } from 'child_process';
import { BrowserWindow, app } from 'electron';
import { download } from 'electron-dl';
import fs from 'fs';
import _ from 'lodash';

const MADARA_APP_ROOT_FOLDER = '.madara-app';
const RELEASES_FOLDER = `${app.getPath(
  'home'
)}/${MADARA_APP_ROOT_FOLDER}/releases`;

// we download the chain specs for now because of an issue in the binaries
// we can skip this step once this is fixed -  https://github.com/keep-starknet-strange/madara/issues/728
const CHAIN_SPECS_FOLDER = `${app.getPath('home')}/.madara/chain-specs`;

// TODO: update this once we have binary releases on Madara
const GIT_RELEASE_BASE_PATH =
  'https://raw.githubusercontent.com/apoorvsadana/madara-app/main/config/releases';

export type MadaraConfig = {
  git_tag: string;
  name?: string;
};

const SETUP_FILES = [
  {
    url: `https://raw.githubusercontent.com/keep-starknet-strange/madara/main/crates/node/chain-specs/testnet-sharingan.json`,
    directory: CHAIN_SPECS_FOLDER,
    showProgress: false,
  },
  {
    url: `https://raw.githubusercontent.com/keep-starknet-strange/madara/main/crates/node/chain-specs/testnet-sharingan-raw.json`,
    directory: CHAIN_SPECS_FOLDER,
    showProgress: false,
  },
  {
    url: `${GIT_RELEASE_BASE_PATH}/<%= git_tag %>`, // git_tag is replaced by the config
    directory: RELEASES_FOLDER,
    showProgress: true,
  },
];

function getSetupFiles(config: MadaraConfig) {
  return SETUP_FILES.map((file) => {
    const url = _.template(file.url)(config);
    return {
      ...file,
      url,
      filename: url.split('/').pop(),
    };
  });
}

const getNotDownloadedFiles = (config: MadaraConfig) => {
  const setupFiles = getSetupFiles(config);
  return setupFiles.filter((file) => {
    const fileDir = file.directory;
    if (!fs.existsSync(`${fileDir}/${file.filename}`)) {
      return true;
    }
    return false;
  });
};

export function releaseExists(config: MadaraConfig): boolean {
  return getNotDownloadedFiles(config).length === 0;
}

export async function setup(window: BrowserWindow, config: MadaraConfig) {
  if (releaseExists(config)) {
    return;
  }

  const notDownloadedFiles = getNotDownloadedFiles(config);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < notDownloadedFiles.length; i++) {
    const file = notDownloadedFiles[i];
    const opts: {
      directory: string;
      saveAs: boolean;
      overwrite: boolean;
      onProgress: any;
    } = {
      directory: file.directory,
      saveAs: false,
      overwrite: true,
      onProgress: undefined,
    };
    if (file.showProgress) {
      opts.onProgress = (progress: any) => {
        window.webContents.send('download-progress', progress);
      };
    }

    // eslint-disable-next-line no-await-in-loop
    await download(window, file.url, opts);
  }
}

// this is a global variable that stores the latest childProcess
let childProcess: ChildProcessWithoutNullStreams | undefined;
export async function start(window: BrowserWindow, config: MadaraConfig) {
  if (childProcess !== undefined) {
    // we already have node running, it must be killed before we start a new one
    throw Error('Node is already running!');
  }

  const args = [
    '--testnet',
    'sharingan',
    '--telemetry-url',
    'wss://telemetry.madara.zone/submit 0',
  ];
  if (config.name) {
    args.push('--name');
    args.push(config.name);
  }

  const execPath = `${RELEASES_FOLDER}/${config.git_tag}`;
  // if the os is linux or mac then get access to execPath
  if (process.platform !== 'win32') {
    execSync(`chmod +x ${execPath}`);
  }
  childProcess = spawn(execPath, args);

  // BY DEFAULT SUBSTRATE LOGS TO STDERR SO WE USE THIS
  childProcess.stderr.on('data', (data) => {
    window.webContents.send('node-logs', data.toString());
  });

  // Update the react state when the node is stopped
  childProcess.on('close', () => {
    try {
      window.webContents.send('node-stop');
    } catch (err) {
      // if the user has closed the window then this emit won't work and it throws an error dialog, hence try catch
    }
  });
}

export async function stop() {
  // stop the child process
  if (!childProcess) {
    throw Error('No child process is running!');
  }
  childProcess.kill();
  childProcess = undefined;
}

export function childProcessInMemory(): boolean {
  return childProcess !== undefined;
}
