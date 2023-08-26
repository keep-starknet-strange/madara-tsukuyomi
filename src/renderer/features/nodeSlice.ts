import { createSlice } from '@reduxjs/toolkit';
import { MadaraConfig } from 'main/types';
import { getStore } from 'renderer/store/storeRegistry';
import { closeAllApps } from './appsSlice';

export type configTypes =
  | 'RPCCors'
  | 'RPCExternal'
  | 'RPCMethods'
  | 'port'
  | 'RPCPort'
  | 'telemetryURL'
  | 'bootnodes'
  | 'testnet'
  | 'name'
  | 'release'
  | 'developmentMode';

const STARTING_LOGS = 'Starting...';

const initialState = {
  logs: STARTING_LOGS,
  isRunning: false,
  config: {
    RPCCors: '',
    RPCExternal: 'false',
    RPCMethods: 'Auto',
    port: '10333',
    RPCPort: '9944',
    telemetryURL: 'wss://telemetry.madara.zone/submit 0',
    bootnodes: '',
    testnet: '',
    name: '',
    release: 'v0.1.0.experimental.3',
    developmentMode: 'false',
  },
  setupComplete: false,
};

export const nodeSlice = createSlice({
  name: 'node',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setIsRunning: (state, data) => {
      state.isRunning = data.payload;
    },
    appendLogs: (state, data) => {
      state.logs += data.payload;
    },
    setLogs: (state, data) => {
      state.logs = data.payload;
    },
    setConfig: (state, data) => {
      state.config = data.payload;
    },
    setSetupComplete: (state, data) => {
      state.setupComplete = data.payload;
    },
  },
});

export const {
  setIsRunning,
  appendLogs,
  setConfig,
  setLogs,
  setSetupComplete,
} = nodeSlice.actions;

export const selectIsRunning = (state: any): boolean => {
  return state.node.isRunning;
};

export const selectSetupComplete = (state: any): boolean => {
  return state.node.setupComplete;
};

export const selectLogs = (state: any): string => {
  return state.node.logs;
};

export const selectConfig = (state: any): MadaraConfig => {
  return state.node.config;
};

export const startNode = () => async (dispatch: any, getState: any) => {
  const isSetupComplete = selectSetupComplete(getState());
  if (!isSetupComplete) {
    dispatch(setSetupComplete(true));
  }
  const isRunning = selectIsRunning(getState());
  if (isRunning) {
    return;
  }
  await window.electron.ipcRenderer.madara.start(selectConfig(getState()));
  dispatch(setIsRunning(true));
};

export const stopNode = () => async (dispatch: any, getState: any) => {
  const isRunning = selectIsRunning(getState());
  if (!isRunning) {
    return;
  }
  await window.electron.ipcRenderer.madara.stop();
  dispatch(setIsRunning(false));
};

export const deleteNode = () => async (dispatch: any) => {
  dispatch(setIsRunning(false));
  dispatch(setLogs(STARTING_LOGS));
  dispatch(closeAllApps());
  await window.electron.ipcRenderer.madara.delete();
};

// set up listener to get all log events
window.electron.ipcRenderer.madara.onNodeLogs((event: any, data: string) => {
  getStore().dispatch(appendLogs(data));
});

// set up listener to set isRunning to false when node stops
window.electron.ipcRenderer.madara.onNodeStop(() => {
  getStore().dispatch(setIsRunning(false));
  // get local data time in format YYYY-MM-DD HH:MM:SS
  const date = new Date()
    .toLocaleString()
    .replaceAll(',', '')
    .replaceAll('/', '-');
  getStore().dispatch(appendLogs(`${date} ********** NODE STOPPED **********`));
});

export default nodeSlice.reducer;
