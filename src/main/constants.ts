import { app } from 'electron';

export const MADARA_APP_ROOT_FOLDER = '.madara-app';
export const MADARA_APP_PATH = `${app.getPath(
  'home'
)}/${MADARA_APP_ROOT_FOLDER}`;
