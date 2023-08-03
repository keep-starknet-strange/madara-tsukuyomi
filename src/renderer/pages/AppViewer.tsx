import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InfiniteBarLoader from 'renderer/components/InfiniteBarLoader';
import { styled } from 'styled-components';
import APPS_CONFIG from '../../../config/apps';

const TelemetryContainer = styled.div`
  height: 100%;
`;

const Iframe = styled.iframe`
  border: 0;
  width: 100%;
  height: 100%;
`;

const BannerContainer = styled(motion.div)`
  position: absolute;
  bottom: 2rem;
  width: 100%;
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-content: center;
`;

const Banner = styled.div`
  border: 1px solid white;
  background-color: #2c2c2c;
  color: white;
  width: 90%;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  padding-left: 1.2rem;
  border-radius: 50px;
`;

const BANNER_SEEN_KEY = 'banner_seen';

export default function AppViewer() {
  const [loading, setLoading] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const { appId } = useParams();

  useEffect(() => {
    const bannerSeen = sessionStorage.getItem(BANNER_SEEN_KEY);
    if (bannerSeen === 'true') {
      setIsBannerVisible(false);
    } else {
      setIsBannerVisible(true);
      setTimeout(() => setIsBannerVisible(false), 5000);
    }
  }, []);

  const handleLoad = () => {
    setLoading(false);
    sessionStorage.setItem(BANNER_SEEN_KEY, 'true');
  };
  return (
    <TelemetryContainer>
      {loading && (
        <InfiniteBarLoader style={{ width: '100%', borderRadius: 0 }} />
      )}
      <Iframe
        src={APPS_CONFIG.apps.find((app) => app.id === appId)?.frontendUrl}
        title="app-viewer"
        style={{ width: '100%', height: '100%', opacity: loading ? 0 : 1 }}
        onLoad={handleLoad}
      />
      <AnimatePresence>
        {isBannerVisible && (
          <BannerContainer
            initial={{ y: '200%' }}
            animate={{
              y: 0,
              transition: { type: 'tween' },
            }}
            exit={{ y: '200%' }}
          >
            <Banner>
              It can take a few minutes for your app to reflect here. Kindly
              check the Logs for any errors
            </Banner>
          </BannerContainer>
        )}
      </AnimatePresence>
    </TelemetryContainer>
  );
}
