/* eslint-disable react-hooks/exhaustive-deps */
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Progress } from 'electron-dl';
import { useEffect, useState } from 'react';
import { Id, ToastContainer, ToastOptions, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'renderer/components/Button';
import {
  selectInstalledApps,
  selectRunningApps,
  setAppAsInstalled,
  setupInstalledApps,
} from 'renderer/features/appsSlice';
import { useAppDispatch, useAppSelector } from 'renderer/utils/hooks';
import { styled } from 'styled-components';
import APPS_CONFIG from '../../../config/apps';

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

  const dispatch = useAppDispatch();

  const handleAppDownload = (appId: string) => {
    setLoading({ ...loading, [appId]: true });
    window.electron.ipcRenderer.madaraApp.download(appId);
  };

  window.electron.ipcRenderer.madaraApp.onAppDownloadProgress(
    (
      event: any,
      data: { appId: string; progress: Progress; filename: string }
    ) => {
      const TOAST_STYLE: ToastOptions = {
        position: 'bottom-center',
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        theme: 'dark',
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

  const handleAppStart = (appId: string) => {
    window.electron.ipcRenderer.madaraApp.startApp(appId);
  };

  const handleAppStop = (appId: string) => {
    window.electron.ipcRenderer.madaraApp.stopApp(appId);
  };

  useEffect(() => {
    dispatch(setupInstalledApps());
  }, []);

  return (
    <AppsContainer>
      <Heading>Apps</Heading>
      <AppRows>
        {APPS_CONFIG.apps.map((app) => {
          let appRightJsx;
          if (runningApps[app.id]) {
            appRightJsx = (
              <FontAwesomeIcon
                onClick={() => handleAppStop(app.id)}
                icon={faPause}
                style={{ cursor: 'pointer' }}
              />
            );
          } else if (installedApps[app.id]) {
            appRightJsx = (
              <FontAwesomeIcon
                onClick={() => handleAppStart(app.id)}
                icon={faPlay}
                style={{ cursor: 'pointer' }}
              />
            );
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
              <AppRowRight>{appRightJsx}</AppRowRight>
            </AppRow>
          );
        })}
      </AppRows>
      <ToastContainer />
    </AppsContainer>
  );
}
