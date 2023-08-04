import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import appsReducer from '../features/appsSlice';
import nodeReducer from '../features/nodeSlice';
import walletReducer from '../features/walletSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  blacklist: ['apps'],
};

const rootReducer = combineReducers({
  node: nodeReducer,
  wallet: walletReducer,
  apps: appsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
});

export default store;
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
