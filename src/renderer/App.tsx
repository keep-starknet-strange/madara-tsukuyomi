/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import sharinganConfig from '../../config/sharingan.json';
import './App.css';
import {
  selectConfig,
  selectSetupComplete,
  setConfig,
  setIsRunning,
} from './features/nodeSlice';
import Landing from './pages/Landing';
import Navigtion from './pages/Navigation';
import store, { persistor } from './store/store';
import { registerPersistor, registerStore } from './store/storeRegistry';
import { useAppDispatch, useAppSelector } from './utils/hooks';

// putting the store and persistor in registry so that we can use it outside of react components
registerStore(store);
registerPersistor(persistor);

export default function App() {
  const location = useLocation();
  const nodeConfig = useAppSelector(selectConfig);
  const dispatch = useAppDispatch();
  const isSetupComplete = useAppSelector(selectSetupComplete);
  const navigate = useNavigate();

  // check if the node is running and set the screen
  useEffect(() => {
    (async () => {
      const childProcessInMemory =
        await window.electron.ipcRenderer.madara.childProcessInMemory();
      if (childProcessInMemory) {
        dispatch(setIsRunning(true));
      } else {
        dispatch(setIsRunning(false));
      }
    })();
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      navigate('/navigation/logs');
    }
  }, []);

  // get the config and set it in redux
  useEffect(() => {
    (async () => {
      let gitTag;
      if (process.env.NODE_ENV === 'development') {
        gitTag = sharinganConfig.version_git_tag;
      } else {
        const response = await axios.get(
          'https://raw.githubusercontent.com/keep-starknet-strange/madara-tsukuyomi/main/config/sharingan.json'
        );
        gitTag = response.data.version_git_tag;
      }

      dispatch(
        setConfig({
          ...nodeConfig,
          release: gitTag,
        })
      );
    })();
  }, []);

  return (
    <Routes location={location}>
      <Route path="/" element={<Landing />} />
      <Route path="/navigation/*" element={<Navigtion />} />
    </Routes>
  );
}
