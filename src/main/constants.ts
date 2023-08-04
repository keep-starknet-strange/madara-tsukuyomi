import { app } from 'electron';

export const MADARA_APP_ROOT_FOLDER = '.madara-app';
export const MADARA_APP_PATH = `${app.getPath(
  'home'
)}/${MADARA_APP_ROOT_FOLDER}`;

export const TELEMETRY_LINK = 'https://telemetry.madara.zone';

export const NODE_CONFIG_DIRECTORY = {
  RPCCors: '--rpc-cors',
  RPCExternal: '--rpc-external',
  RPCMethods: '--rpc-methods',
  RPCPort: '--rpc-port',
  port: '--port',
  telemetryURL: '--telemetry-url',
  bootnodes: '--bootnodes',
  testnet: '--testnet',
  name: '--name',
  release: '--release',
  developmentMode: '--dev',
};

export const TWEET_INTENT =
  'https://twitter.com/intent/tweet?text=Just%20ran%20my%20blazingly%20fast%20%40MadaraStarknet%20node%20in%20less%20than%20a%20minute%20%E2%9A%A1.%20Check%20out%20all%20the%20Sharingan%20nodes%20here%20-%20';
