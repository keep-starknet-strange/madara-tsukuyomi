import { createSlice } from '@reduxjs/toolkit';
import { MadaraConfig } from 'main/types';
import { getStore } from 'renderer/store/storeRegistry';

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

const initialState = {
  logs: '',
  isRunning: false,
  config: {
    RPCCors: '',
    RPCExternal: 'false',
    RPCMethods: 'Auto',
    port: '10333',
    RPCPort: '9944',
    telemetryURL: 'wss://telemetry.madara.zone/submit 0',
    bootnodes: '',
    testnet: 'sharingan',
    name: '',
    release: 'v0.1.0-testnet-sharingan-beta.8.2',
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

export const deleteNode = () => async (dispatch: any, getState: any) => {
  const isRunning = selectIsRunning(getState());
  if (!isRunning) {
    return;
  }
  await window.electron.ipcRenderer.madara.delete();
  dispatch(setIsRunning(false));
  dispatch(setLogs(''));
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
