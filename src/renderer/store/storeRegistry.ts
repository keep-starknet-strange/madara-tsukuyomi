import { EnhancedStore } from '@reduxjs/toolkit';

let store: EnhancedStore;

export function register(newStore: EnhancedStore) {
  store = newStore;
}

export function getStore(): EnhancedStore {
  return store;
}
