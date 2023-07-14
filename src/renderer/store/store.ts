import { configureStore } from '@reduxjs/toolkit';
import nodeReducer from '../features/nodeSlice';

const store = configureStore({
  reducer: {
    node: nodeReducer,
  },
  devTools: true,
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
