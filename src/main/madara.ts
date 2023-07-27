import { ChildProcessWithoutNullStreams, spawn, execSync } from 'child_process';
import { BrowserWindow, app } from 'electron';
import { download } from 'electron-dl';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import sharp from 'sharp';
import { MADARA_APP_PATH, NODE_CONFIG_DIRECTORY } from './constants';
import { MadaraConfig } from './types';

const RELEASES_FOLDER = `${MADARA_APP_PATH}/releases`;

// we download the chain specs for now because of an issue in the binaries
// we can skip this step once this is fixed -  https://github.com/keep-starknet-strange/madara/issues/728
const CHAIN_SPECS_FOLDER = `${app.getPath('home')}/.madara/chain-specs`;
const CHAIN_DB_FOLDER = `${MADARA_APP_PATH}/data`;

// TODO: update this once we have binary releases on Madara
const GIT_RELEASE_BASE_PATH =
  'https://raw.githubusercontent.com/keep-starknet-strange/madara-tsukuyomi/main/config/releases';

const EQUALITY_FLAGS = ['RPCMethods', 'RPCCors'];
const BOOLEAN_FLAGS = ['RPCExternal', 'developmentMode'];

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

export async function getCurrentWindowScreenshot(win: BrowserWindow) {
  try {
    const contents = win.webContents;
    const nativeImage = await contents.capturePage();
    await fs.promises.writeFile(
      `${MADARA_APP_PATH}/image.png`,
      nativeImage.toPNG()
    );
  } catch (error) {
    throw new Error('failed to fetch screenshot from path');
  }
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

  let args = ['--base-path', CHAIN_DB_FOLDER];
  Object.keys(config).forEach((eachKey) => {
    // get value from node config input by user
    const value = config[eachKey as keyof MadaraConfig];

    // return if no value present in config
    if (!value) return;

    // get argument name for cmd line
    const argumentName =
      NODE_CONFIG_DIRECTORY[eachKey as keyof typeof NODE_CONFIG_DIRECTORY];

    // if boolean flag then add argument name only
    if (BOOLEAN_FLAGS.includes(eachKey)) {
      // check if string value is true
      if (value === 'true') {
        args.push(argumentName);
      }
    }

    // add argument name with config value
    else if (EQUALITY_FLAGS.includes(eachKey)) {
      args.push(`${argumentName}=${value}`);
    }

    // add value with argument name
    else if (eachKey !== 'release') {
      args.push(argumentName);
      args.push(value);
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
    // return safely if nothing is running
    return;
  }
  childProcess.kill();
  childProcess = undefined;
}

export async function deleteNode() {
  // stop the child process
  await stop();
  // delete the releases folder
  if (fs.existsSync(CHAIN_DB_FOLDER)) {
    fs.rmdirSync(CHAIN_DB_FOLDER, { recursive: true });
  }
}

export function childProcessInMemory(): boolean {
  return childProcess !== undefined;
}

export async function fetchScreenshotFromSystem(): Promise<Buffer | null> {
  const filePath = `${MADARA_APP_PATH}/image.png`; // Replace with the actual path to your file
  try {
    const data = await fs.readFileSync(path.resolve(__dirname, filePath));
    const fa = await sharp(data).rotate().resize(1048, 717).png().toBuffer();
    await fs.unlinkSync(path.resolve(__dirname, filePath));
    return data ?? fa;
  } catch (err) {
    throw new Error('failed to fetch screenshot from path');
  }
}
