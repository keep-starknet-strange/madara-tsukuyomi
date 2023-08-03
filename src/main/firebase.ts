// Import the Firebase Dynamic Links API library
import axios from 'axios';
import { TELEMETRY_LINK } from './constants';

// url for getting dynamic link

// function to create dynamic links
async function createShortLink(imageLink: string): Promise<string | null> {
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
    console.error(err);
    return null;
  }
}

export default createShortLink;
