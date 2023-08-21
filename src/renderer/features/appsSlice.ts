import { createSlice } from '@reduxjs/toolkit';
import { AppAppendLogs } from 'main/types';
import { getStore } from 'renderer/store/storeRegistry';

type InstalledApps = { [appId: string]: boolean };
type RunningApps = { [appId: string]: boolean };
export type AppLogs = { [appId: string]: { [containerName: string]: string } };
const initialState: {
  installedApps: InstalledApps;
  runningApps: RunningApps;
  appLogs: AppLogs;
} = {
  installedApps: {},
  runningApps: {},
  appLogs: {},
};

export const appsSlice = createSlice({
  name: 'apps',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setInstalledApps: (state, data) => {
      state.installedApps = data.payload;
    },
    setRunningApps: (state, data) => {
      state.runningApps = data.payload;
    },
    appendAppLogs: (state, data) => {
      if (!state.appLogs[data.payload.appId]) {
        state.appLogs[data.payload.appId] = {};
      }
      if (!state.appLogs[data.payload.appId][data.payload.containerName]) {
        state.appLogs[data.payload.appId][data.payload.containerName] = '';
      }
      state.appLogs[data.payload.appId][data.payload.containerName] +=
        data.payload.logs;
    },
    clearAppLogs: (state, data) => {
      state.appLogs[data.payload.appId] = {};
    },
  },
});

export const { setInstalledApps, setRunningApps, appendAppLogs, clearAppLogs } =
  appsSlice.actions;

export const selectInstalledApps = (state: any): InstalledApps =>
  state.apps.installedApps;
export const selectRunningApps = (state: any): RunningApps => {
  return state.apps.runningApps;
};
export const selectAppLogs = (state: any): AppLogs => {
  return state.apps.appLogs;
};

export const setAppAsInstalled =
  (appId: string) => (dispatch: any, getState: any) => {
    const installedApps = selectInstalledApps(getState());
    dispatch(setInstalledApps({ ...installedApps, [appId]: true }));
  };

export const updateAppRunningStatus =
  (appId: string, status: boolean) => (dispatch: any, getState: any) => {
    const runningApps = selectRunningApps(getState());
    dispatch(setRunningApps({ ...runningApps, [appId]: status }));
  };

export const setupInstalledApps = () => async (dispatch: any) => {
  const installedApps =
    await window.electron.ipcRenderer.madaraApp.installedApps();
  dispatch(setInstalledApps(installedApps));
};

export const closeAllApps = () => async (dispatch: any, getState: any) => {
  const runningApps = selectRunningApps(getState());
  Object.entries(runningApps).forEach(([appId, isRunning]) => {
    if (isRunning) {
      window.electron.ipcRenderer.madaraApp.stopApp(appId);
    }
  });
};

// listener to know when an app is running
window.electron.ipcRenderer.madaraApp.onAppStart(
  (event: any, data: { appId: string }) =>
    // @ts-ignore
    getStore().dispatch(updateAppRunningStatus(data.appId, true))
);

window.electron.ipcRenderer.madaraApp.onAppStop(
  (event: any, data: { appId: string }) => {
    // @ts-ignore
    getStore().dispatch(updateAppRunningStatus(data.appId, false));
    // @ts-ignore
    getStore().dispatch(clearAppLogs({ appId: data.appId }));
  }
);

// listener to add logs for apps
window.electron.ipcRenderer.madaraApp.onAppLogs(
  (event: any, data: AppAppendLogs) => {
    getStore().dispatch(
      appendAppLogs({
        appId: data.appId,
        containerName: data.containerName,
        logs: data.logs,
      })
    );
  }
);

export default appsSlice.reducer;
