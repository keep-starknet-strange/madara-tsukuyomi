import { useEffect } from "react";
import { showSnackbar } from "renderer/store/snackbar";
import { useAppDispatch } from "renderer/utils/hooks";

function useUnhandledErrorListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    function handleUnhandledError(message: any) {
      console.error('Unhandled error from main process:', message);
      dispatch(showSnackbar('Something went wrong'));
    }
    window.electron.ipcRenderer.onUnhandledError(handleUnhandledError);
  }, []);
}

export default useUnhandledErrorListener;
