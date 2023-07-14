import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import App from './App';
import store from './store/store';

declare global {
  interface Window {
    electron: any;
  }
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);
