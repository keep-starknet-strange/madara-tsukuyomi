import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import App from './App';
import store, { persistor } from './store/store';
import ErrorBoundary from './components/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

declare global {
  interface Window {
    electron: any;
  }
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Router>
          <App />
        </Router>
      </PersistGate>
      <ToastContainer />
    </Provider>
  </ErrorBoundary>
);
