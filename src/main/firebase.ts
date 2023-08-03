// Import the Firebase Dynamic Links API library
import axios from 'axios';

const API_KEY = 'AIzaSyC-u7ceUKNo8jyKw5I1YEazN4poQqhngbo';

// url for getting dynamic link
const FIRE_BASE_URL = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${API_KEY}`;

// function to create dynamic links
async function createShortLink(imageLink: string): Promise<void> {
  let response;
  try {
    response = await axios.post(FIRE_BASE_URL, {
      dynamicLinkInfo: {
        domainUriPrefix: 'https://madarazone.page.link',
        link: 'https://telemetry.madara.zone',
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
  }
}

export default createShortLink;
