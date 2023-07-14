import { createSlice } from '@reduxjs/toolkit';
import { MadaraConfig } from 'main/madara';
import { getStore } from 'renderer/store/storeRegistry';

const initialState = {
  logs: '',
  isRunning: false,
  config: {
    git_tag: 'v0.1.0-testnet-sharingan-beta.7',
  },
};

export const nodeSlice = createSlice({
  name: 'terminal',
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
  },
});

export const { setIsRunning, appendLogs, setConfig, setLogs } =
  nodeSlice.actions;

export const selectIsRunning = (state: any): boolean => {
  return state.node.isRunning;
};

export const selectLogs = (state: any): string => {
  return state.node.logs;
};

export const selectConfig = (state: any): MadaraConfig => {
  return state.node.config;
};

export const startNode = () => async (dispatch: any, getState: any) => {
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

// set up listener to get all log events
window.electron.ipcRenderer.madara.onNodeLogs((event: any, data: string) => {
  getStore().dispatch(appendLogs(data));
});

// set up listener to set isRunning to false when node stops
window.electron.ipcRenderer.madara.onNodeStop(() => {
  getStore().dispatch(setIsRunning(false));
  getStore().dispatch(setLogs(''));
});

export default nodeSlice.reducer;
