import { EnhancedStore } from '@reduxjs/toolkit';
import { Persistor } from 'redux-persist';

let store: EnhancedStore;
let persistor: Persistor;

export function registerStore(newStore: EnhancedStore) {
  store = newStore;
}

export function getStore(): EnhancedStore {
  return store;
}

export function registerPersistor(newPersistor: Persistor) {
  persistor = newPersistor;
}

export function getPersistor(): Persistor {
  return persistor;
}
