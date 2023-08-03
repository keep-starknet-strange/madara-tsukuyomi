import { ChildProcessWithoutNullStreams, spawn, execSync } from 'child_process';
import { BrowserWindow, app } from 'electron';
import { download } from 'electron-dl';
import fs from 'fs';
import _ from 'lodash';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';
import path from 'path';
import sharp from 'sharp';
import { MADARA_APP_PATH } from './constants';

const RELEASES_FOLDER = `${MADARA_APP_PATH}/releases`;

// we download the chain specs for now because of an issue in the binaries
// we can skip this step once this is fixed -  https://github.com/keep-starknet-strange/madara/issues/728
const CHAIN_SPECS_FOLDER = `${app.getPath('home')}/.madara/chain-specs`;
const CHAIN_DB_FOLDER = `${MADARA_APP_PATH}/data`;

// TODO: update this once we have binary releases on Madara
const GIT_RELEASE_BASE_PATH =
  'https://raw.githubusercontent.com/keep-starknet-strange/madara-tsukuyomi/main/config/releases';

export type MadaraConfig = {
  name?: string;
  RPCCors: string;
  RPCExternal: string;
  RPCMethods: string;
  port: string;
  RPCPort: string;
  telemetryURL: string;
  bootnodes: string;
  testnet: string;
  release: string;
  developmentMode: string;
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
    url: `${GIT_RELEASE_BASE_PATH}/<%= release %>`, // release is replaced by the config
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

export async function getScreenShotWindow(win: BrowserWindow) {
  const contents = win.webContents;
  const nativeImage = await contents.capturePage();
  await fs.promises.writeFile('image.png', nativeImage.toPNG());
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

const keyToStateMap = {
  RPCCors: '--rpc-cors',
  RPCExternal: '--rpc-external',
  RPCMethods: '--rpc-methods',
  port: '--port',
  RPCPort: '--rpc-port',
  telemetryURL: '--telemetry-url',
  bootnodes: '--bootnodes',
  testnet: '--testnet',
  name: '--name',
  release: '--release',
  developmentMode: '--dev',
};

// this is a global variable that stores the latest childProcess
let childProcess: ChildProcessWithoutNullStreams | undefined;
export async function start(window: BrowserWindow, config: MadaraConfig) {
  if (childProcess !== undefined) {
    // we already have node running, it must be killed before we start a new one
    throw Error('Node is already running!');
  }

  const args = ['--base-path', CHAIN_DB_FOLDER];
  Object.keys(config).forEach((eachKey) => {
    if (config[eachKey].length > 0 && config[eachKey] !== undefined) {
      if (eachKey === 'RPCExternal') {
        if (config[eachKey] === 'true') {
          args.push(keyToStateMap[eachKey].trim);
        }
      } else if (eachKey === 'developmentMode') {
        if (config[eachKey] === 'true') {
          args.push(keyToStateMap[eachKey].trim());
        }
      } else if (eachKey === 'RPCMethods' || eachKey === 'RPCCors') {
        if (config[eachKey].length > 0) {
          args.push(`${keyToStateMap[eachKey]}=${config[eachKey].trim()}`);
        }
      } else if (eachKey !== 'release') {
        args.push(keyToStateMap[eachKey]);
        args.push(config[eachKey].trim());
      }
    }
  });

  const execPath = `${RELEASES_FOLDER}/${config.release}`;
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
      childProcess = undefined;
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

export async function deleteNode() {
  // stop the child process
  await stop();
  // delete the releases folder
  fs.rmdirSync(CHAIN_DB_FOLDER, { recursive: true });
}

export function childProcessInMemory(): boolean {
  return childProcess !== undefined;
}

export async function getFile() {
  const filePath = '../../image.png'; // Replace with the actual path to your file
  try {
    const data = await fs.readFileSync(path.resolve(__dirname, filePath));
    const fa = await sharp(data).rotate().resize(1048, 717).png().toBuffer();
    return data ?? fa;
  } catch (err) {
    console.error(err);
  }
}

export async function uploadFilesToStorageFirebase(file: Buffer) {
  const firebaseApp = getApp();

  const storage = getStorage(firebaseApp);
  // Create a storage reference from our storage service-
  const storageRef = ref(storage, 'image.png');

  // Create file metadata including the content type
  /** @type {any} */
  const metadata = {
    contentType: 'image/png',
  };
  // 'file' comes from the Blob or File API
  const snapshot = await uploadBytes(storageRef, file, metadata);

  const res = await getDownloadURL(snapshot.ref);
  return res;
}
