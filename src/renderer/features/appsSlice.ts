import { createSlice } from '@reduxjs/toolkit';
import { getStore } from 'renderer/store/storeRegistry';

const initialState = {
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

export const selectInstalledApps = (state: any) => state.apps.installedApps;
export const selectRunningApps = (state: any) => {
  console.log('reading the state now - ', state);
  return state.apps.runningApps;
};

export const setAppAsInstalled =
  (appId: string) => (dispatch: any, getState: any) => {
    const installedApps = selectInstalledApps(getState());
    dispatch(setInstalledApps({ ...installedApps, [appId]: true }));
  };

export const updateAppRunningStatus =
  (appId: string, status: boolean) => (dispatch: any, getState: any) => {
    console.log('state inside set app as running - ', getState());
    const runningApps = selectRunningApps(getState());
    dispatch(setRunningApps({ ...runningApps, [appId]: status }));
  };

export const setupInstalledApps = () => async (dispatch: any) => {
  const installedApps =
    await window.electron.ipcRenderer.madaraApp.installedApps();
  dispatch(setInstalledApps(installedApps));
};

// listener to know when an app is running
window.electron.ipcRenderer.madaraApp.onAppStart(
  (event: any, data: { appId: string }) => {
    getStore().dispatch(updateAppRunningStatus(data.appId, true));
  }
);

window.electron.ipcRenderer.madaraApp.onAppStop(
  (event: any, data: { appId: string }) => {
    console.log('inside app stop!!');
    getStore().dispatch(updateAppRunningStatus(data.appId, false));
  }
);

export default appsSlice.reducer;
