import { useEffect } from 'react';
import { showSnackbar } from 'renderer/store/snackbar';
import { useAppDispatch } from 'renderer/utils/hooks';

// Global variable to check if the listener has already been attached
let hasListenerBeenAttached = false;

function useErrorBoundaryMain() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (hasListenerBeenAttached) {
      // If the listener is already attached, no need to attach it again
      return;
    }

    function handleUnhandledError(message: any) {
      console.error('Unhandled error from main process:', message);
      dispatch(showSnackbar('Something went wrong'));
    }

    window.electron.ipcRenderer.onUnhandledError(handleUnhandledError);
    hasListenerBeenAttached = true;

    return () => { //clean mount
      window.electron.ipcRenderer.offUnhandledError(handleUnhandledError);
    };
  }, [dispatch]);
}

export default useErrorBoundaryMain;
