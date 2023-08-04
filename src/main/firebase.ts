// Import the Firebase Dynamic Links API library
import axios from 'axios';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp, initializeApp } from 'firebase/app';
import { TELEMETRY_LINK } from './constants';

// firebase setup
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  appId: process.env.FIREBASE_APP_ID,
};

initializeApp(firebaseConfig);

class FireBaseService {
  /**
   * @function createShortLink
   * @param {string} imageLink the link of image to be added to the dynamic link
   *
   * Call this function to create a dynamic link with the image url which we need to
   * show in open graph tags
   */
  static async createShortLink(imageLink: string): Promise<string> {
    const FIREBASE_REQUEST_URL = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FIREBASE_API_KEY}`;
    let response;
    try {
      response = await axios.post(FIREBASE_REQUEST_URL, {
        dynamicLinkInfo: {
          domainUriPrefix: process.env.FIREBASE_DYNAMIC_LINK_PREFIX,
          link: TELEMETRY_LINK,
          socialMetaTagInfo: {
            socialTitle: 'Madara Desktop App',
            socialDescription: 'One click solution to run node on your desktop',
            socialImageLink: imageLink,
          },
        },
        suffix: {
          option: 'SHORT',
        },
      });
      return response.data.shortLink;
    } catch (err) {
      throw new Error('Failed to create dynamic link');
    }
  }

  /**
   * @function uploadFilesToStorageFirebase
   * @param {Buffer} file the image file which we need to upload to the firebase storage
   *
   * Call this function upload the image file to the firebase storage
   */
  static async uploadFilesToStorageFirebase(file: Buffer) {
    try {
      const firebaseApp = getApp();
      const storage = getStorage(firebaseApp);

      /*
        when pushing for production we can switch to
        appending current date time to image name

        const storageRef = ref(storage, `image_${Date.now()}.png`);
      */

      // Create a storage reference from our storage service-
      const storageRef = ref(storage, 'image.png');

      // Create file metadata including the content type
      /** @type {any} */
      const metadata = {
        contentType: 'image/png',
      };

      // 'file' comes from the Blob or File API
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const res = await getDownloadURL(snapshot.ref);
      return res;
    } catch (error) {
      throw new Error('Failed to upload asset to storage');
    }
  }
}

export default FireBaseService;
