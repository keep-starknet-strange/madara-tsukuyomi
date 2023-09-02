import {
  faCog,
  faInfo,
  faPause,
  faPlay,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Progress } from 'electron-dl';
import { useEffect, useState } from 'react';
import { Id, ToastContainer, ToastOptions, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'renderer/components/Button';
import defaultToastStyleOptions from 'shared/constants';
import {
  selectInstalledApps,
  selectRunningApps,
  setAppAsInstalled,
  setupInstalledApps,
} from 'renderer/features/appsSlice';
import { selectIsRunning } from 'renderer/features/nodeSlice';
import { useAppDispatch, useAppSelector } from 'renderer/utils/hooks';
import { styled } from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { showSnackbar } from 'renderer/store/snackbar';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import APPS_CONFIG from '../../../config/apps';
import AppLogs from './AppLogs';
import AppSideDrawer from './AppSideDrawer';
import AppDocs from './AppDocs';
import AppSettings from './AppSettings';

const AppsContainer = styled.div`
  height: 100%;
  padding-left: 2rem;
  padding-top: 2rem;
  padding-right: 2rem;
`;

const Heading = styled.div`
  font-size: 1.5rem;
  color: white;
  font-weight: 600;
  margin-bottom: 2rem;
`;

const AppRows = styled.div`
  display: flex;
  flex-direction: column;
`;

const AppRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  color: grey;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const AppRowLeft = styled.div`
  display: flex;
  flex-direction: row;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const AppLogo = styled.img`
  width: 2rem;
  border-radius: 50%;
`;

const AppTitle = styled.div`
  font-size: 1rem;
  margin-left: 0.7rem;
`;

const AppRowRight = styled.div`
  display: flex;
  flex-direction: row;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Loader = styled.div`
  border: 3px solid #444;
  border-radius: 50%;
  border-top: 3px solid #e62600;
  width: 22.5px;
  height: 22.5px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;

  /* Safari */
  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

type ToastRefs = {
  [appId: string]: { [filename: string]: Id | undefined };
};
const toastRefs: ToastRefs = {};

export default function Apps() {
  const [loading, setLoading] = useState<{ [appId: string]: boolean }>({});
  const installedApps = useAppSelector(selectInstalledApps);
  const runningApps = useAppSelector(selectRunningApps);
  const navigate = useNavigate();
  const location = useLocation();
  const isNodeRunning = useAppSelector(selectIsRunning);

  const dispatch = useAppDispatch();

  const handleAppDownload = async (appId: string) => {
    setLoading({ ...loading, [appId]: true });
    await window.electron.ipcRenderer.madaraApp.download(appId);
    setLoading({ ...loading, [appId]: false });
  };

  const handleAppStart = async (appId: string) => {
    const appSettings =
      await window.electron.ipcRenderer.madaraApp.getAppSettings(appId);
    const appConfig = APPS_CONFIG.apps.find((app) => app.id === appId);
    const requiresRunningNode = true;
    if (requiresRunningNode) {
      if (!isNodeRunning) {
        dispatch(
          showSnackbar('Node must be running in order to start the app')
        );
        return;
      }
    }
    if (appConfig?.settings && appConfig.settings.length > 0) {
      const missingSettings = appConfig.settings.filter(
        (setting) => !appSettings[setting.environmentName]
      );
      if (missingSettings.length > 0) {
        dispatch(
          showSnackbar('Please enter the required variables in settings')
        );
        return;
      }
    }

    setLoading({ ...loading, [appId]: true });
    await window.electron.ipcRenderer.madaraApp.startApp(appId);
    setLoading({ ...loading, [appId]: false });
  };

  const handleAppStop = (appId: string) => {
    window.electron.ipcRenderer.madaraApp.stopApp(appId);
  };

  useEffect(() => {
    dispatch(setupInstalledApps());

    window.electron.ipcRenderer.madaraApp.onAppDownloadProgress(
      (
        event: any,
        data: { appId: string; progress: Progress; filename: string }
      ) => {
        const TOAST_STYLE: ToastOptions = {
          ...defaultToastStyleOptions,
          hideProgressBar: false,
          progressClassName: 'toast-progress-bar',
          autoClose: false,
        };
        if (toastRefs[data.appId] === undefined) {
          toastRefs[data.appId] = {};
        }
        if (toastRefs[data.appId][data.filename] === undefined) {
          toastRefs[data.appId][data.filename] = toast(
            `Downloading ${data.filename}`,
            {
              ...TOAST_STYLE,
              progress: data.progress.percent,
            }
          );
        } else {
          toast.update(toastRefs[data.appId][data.filename] as Id, {
            ...TOAST_STYLE,
            progress: data.progress.percent,
          });
        }
      }
    );

    window.electron.ipcRenderer.madaraApp.onAppDownloadComplete(
      (event: any, data: { appId: string }) => {
        dispatch(setAppAsInstalled(data.appId));
      }
    );
  }, []);

  const closeDrawer = () => {
    navigate('/navigation/apps');
  };

  return (
    <AppsContainer>
      <Heading>Apps</Heading>
      <AppRows>
        {APPS_CONFIG.apps.map((app) => {
          let appRightJsx;
          if (runningApps[app.id]) {
            appRightJsx = (
              <>
                <FontAwesomeIcon
                  onClick={() => handleAppStop(app.id)}
                  icon={faPause}
                  style={{ cursor: 'pointer' }}
                />
                <FontAwesomeIcon
                  onClick={() => navigate(`./logs/${app.id}`)}
                  icon={faTerminal}
                  style={{ cursor: 'pointer', marginLeft: '15px' }}
                />
              </>
            );
          } else if (installedApps[app.id]) {
            if (loading[app.id]) {
              appRightJsx = <Loader />;
            } else {
              appRightJsx = (
                <FontAwesomeIcon
                  onClick={() => handleAppStart(app.id)}
                  icon={faPlay}
                  style={{ cursor: 'pointer' }}
                />
              );
            }
          } else if (loading[app.id]) {
            appRightJsx = <Loader />;
          } else {
            appRightJsx = (
              <Button
                text="Install"
                verticalPadding="0.4rem"
                horizontalPadding="0.7rem"
                onClick={() => handleAppDownload(app.id)}
              />
            );
          }
          return (
            <AppRow>
              <AppRowLeft>
                <AppLogo src={app.logoUrl} />
                <AppTitle>{app.appName}</AppTitle>
              </AppRowLeft>
              <AppRowRight>
                {appRightJsx}
                {app.settings && app.settings.length > 0 && (
                  <FontAwesomeIcon
                    onClick={() => navigate(`./settings/${app.id}`)}
                    icon={faCog}
                    style={{ cursor: 'pointer', marginLeft: '15px' }}
                  />
                )}
                {app.markdownDocsUrl && (
                  <FontAwesomeIcon
                    icon={faInfo}
                    style={{ cursor: 'pointer', marginLeft: '15px' }}
                    onClick={() => navigate(`./docs/${app.id}`)}
                  />
                )}
              </AppRowRight>
            </AppRow>
          );
        })}
      </AppRows>
      <ToastContainer />

      <AnimatePresence>
        <Routes key={location.pathname} location={location}>
          <Route
            path="/logs/:appId"
            element={
              <AppSideDrawer>
                <AppLogs close={closeDrawer} />
              </AppSideDrawer>
            }
          />
          <Route
            path="/docs/:appId"
            element={
              <AppSideDrawer>
                <AppDocs close={closeDrawer} />
              </AppSideDrawer>
            }
          />
          <Route
            path="/settings/:appId"
            element={
              <AppSideDrawer>
                <AppSettings close={closeDrawer} />
              </AppSideDrawer>
            }
          />
        </Routes>
      </AnimatePresence>
    </AppsContainer>
  );
}
