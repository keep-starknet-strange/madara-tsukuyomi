import { createSlice } from '@reduxjs/toolkit';
import { toast, ToastOptions } from 'react-toastify';

const initialState = {
  isVisible: false,
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    showToast: (state) => {
      state.isVisible = true;
    },
    hideToast: (state) => {
      state.isVisible = false;
    },
  },
});

const { showToast, hideToast } = snackbarSlice.actions;

export const showSnackbar = (message?: string) => (dispatch: any) => {
  dispatch(showToast());
  const TOAST_STYLE: ToastOptions = {
    position: 'bottom-center',
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
    theme: 'dark',
    autoClose: 2000,
  };
  toast(message ?? 'Something went wrong', { ...TOAST_STYLE });
};

export const hideSnackbar = () => (dispatch: any) => {
  dispatch(hideToast());
  toast.dismiss();
};

export default snackbarSlice.reducer;
