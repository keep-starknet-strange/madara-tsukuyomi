import React from 'react';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import './App.css';
import Landing from './pages/Landing';
import Navigtion from './pages/Navigation';
import store from './store/store';
import { register } from './store/storeRegistry';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  selectConfig,
  selectIsRunning,
  setConfig,
  setIsRunning,
} from './features/nodeSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';

// putting the store in registry so that we can use it outside of react components
register(store);

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isNodeRunning = useSelector(selectIsRunning);
  const nodeConfig = useSelector(selectConfig);
  const dispatch = useDispatch();

  // navigate every time isNodeRunning changes
  useEffect(() => {
    if (isNodeRunning) {
      navigate('/navigation/logs');
    } else {
      navigate('/');
    }
  }, [isNodeRunning]);

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

  // get the config and set it in redux
  useEffect(() => {
    (async () => {
      const response = await axios.get(
        'https://raw.githubusercontent.com/apoorvsadana/madara-app/main/config/sharingan.json'
      );
      dispatch(
        setConfig({
          ...nodeConfig,
          git_tag: response.data.version_git_tag,
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
