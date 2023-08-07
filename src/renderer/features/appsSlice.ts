import { createSlice } from '@reduxjs/toolkit';
import { getStore } from 'renderer/store/storeRegistry';

type InstalledApps = { [appId: string]: boolean };
type RunningApps = { [appId: string]: boolean };
const initialState: {
  installedApps: InstalledApps;
  runningApps: RunningApps;
} = {
  installedApps: {},
  runningApps: {},
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
  },
});

export const { setInstalledApps, setRunningApps } = appsSlice.actions;

export const selectInstalledApps = (state: any): InstalledApps =>
  state.apps.installedApps;
export const selectRunningApps = (state: any): RunningApps => {
  return state.apps.runningApps;
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
  (event: any, data: { appId: string }) =>
    // @ts-ignore
    getStore().dispatch(updateAppRunningStatus(data.appId, false))
);

export default appsSlice.reducer;
