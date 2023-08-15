import { ChildProcessWithoutNullStreams, spawn, execSync } from 'child_process';
import { BrowserWindow, app } from 'electron';
import { Options, download } from 'electron-dl';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import axios from 'axios';
import _ from 'lodash';
import { MADARA_APP_PATH, NODE_CONFIG_DIRECTORY } from './constants';
import { MadaraConfig } from './types';
import { MADARA_RELEASES_URL } from '../../config/constants';

const RELEASES_FOLDER = `${MADARA_APP_PATH}/releases`;

// we download the chain specs for now because of an issue in the binaries
// we can skip this step once this is fixed -  https://github.com/keep-starknet-strange/madara/issues/728
const CHAIN_SPECS_FOLDER = `${app.getPath('home')}/.madara/chain-specs`;
const CHAIN_DB_FOLDER = `${MADARA_APP_PATH}/data`;

const EQUALITY_FLAGS = ['RPCMethods', 'RPCCors'];
const BOOLEAN_FLAGS = ['RPCExternal', 'developmentMode'];

const SETUP_FILES = [
  {
    url: `https://raw.githubusercontent.com/keep-starknet-strange/madara/main/crates/node/chain-specs/testnet-sharingan.json`,
    directory: CHAIN_SPECS_FOLDER,
    showProgress: false,
    saveFilename: 'testnet-sharingan.json',
  },
  {
    url: `https://raw.githubusercontent.com/keep-starknet-strange/madara/main/crates/node/chain-specs/testnet-sharingan-raw.json`,
    directory: CHAIN_SPECS_FOLDER,
    showProgress: false,
    saveFilename: 'testnet-sharingan-raw.json',
  },
  {
    url: getReleaseUrl,
    directory: RELEASES_FOLDER,
    showProgress: true,
    saveFilename: '<%= release %>', // release is replaced by the config
  },
];

async function getReleaseUrl(config: MadaraConfig): Promise<string> {
  const response = await axios.get(MADARA_RELEASES_URL);
  const releases: {
    tag_name: string;
    assets: { browser_download_url: string; name: string }[];
  }[] = response.data;
  const release = releases.filter((r) => r.tag_name === config.release)[0];

  const { platform, arch } = process;
  let assetName = '';

  if (platform === 'darwin') {
    if (arch === 'arm64') {
      assetName = 'aarch64-apple-darwin-madara';
    } else if (arch === 'x64') {
      assetName = 'x86_64-apple-darwin-madara';
    }
  } else if (platform === 'linux') {
    if (arch === 'arm64') {
      assetName = 'aarch64-unknown-linux-gnu-madara';
    } else if (arch === 'x64') {
      assetName = 'x86_64-unknown-linux-gnu-madara';
    }
  } else if (platform === 'win32') {
    if (arch === 'x64') {
      assetName = 'x86_64-pc-windows-msvc-madara.exe';
    }
  }

  if (assetName === '') {
    throw new Error(
      `Platform: ${platform} and Architecture: ${arch} is not supported`
    );
  }
  return release.assets.filter((a) => a.name === assetName)[0]
    .browser_download_url;
}

async function getSetupFiles(config: MadaraConfig, fetchUrls: boolean) {
  const promises = SETUP_FILES.map(async (file) => {
    let url;
    if (_.isFunction(file.url) && fetchUrls) {
      url = (await file.url(config)) as string;
    } else {
      url = file.url as string;
    }
    return {
      ...file,
      url,
      filename: _.template(file.saveFilename)(config),
    };
  });
  return Promise.all(promises);
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
    throw new Error('Failed to fetch screenshot from path');
  }
}

const getNotDownloadedFiles = async (
  config: MadaraConfig,
  fetchUrls: boolean
) => {
  const setupFiles = await getSetupFiles(config, fetchUrls);
  return setupFiles.filter((file) => {
    const fileDir = file.directory;
    if (!fs.existsSync(`${fileDir}/${file.filename}`)) {
      return true;
    }
    return false;
  });
};

export async function releaseExists(config: MadaraConfig): Promise<boolean> {
  return (await getNotDownloadedFiles(config, false)).length === 0;
}

export async function setup(window: BrowserWindow, config: MadaraConfig) {
  if (await releaseExists(config)) {
    return;
  }

  const notDownloadedFiles = await getNotDownloadedFiles(config, true);

  for (let i = 0; i < notDownloadedFiles.length; i++) {
    const file = notDownloadedFiles[i];
    type DownoadOptionsModifiable = {
      -readonly [K in keyof Options]: K extends 'propertyName'
        ? string
        : Options[K];
    };
    const opts: DownoadOptionsModifiable = {
      directory: file.directory,
      saveAs: false,
      overwrite: true,
      onProgress: undefined,
      filename: file.filename,
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

  const args = ['--base-path', CHAIN_DB_FOLDER];
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

    // to delete the file after fetching
    await fs.unlinkSync(path.resolve(__dirname, filePath));

    return data ?? fa;
  } catch (err) {
    throw new Error('failed to fetch screenshot from path');
  }
}
