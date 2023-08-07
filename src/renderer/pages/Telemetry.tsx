import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import InfiniteBarLoader from 'renderer/components/InfiniteBarLoader';
import { selectConfig } from 'renderer/features/nodeSlice';
import { useAppSelector } from 'renderer/utils/hooks';
import { styled } from 'styled-components';

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

export default function Telemetry() {
  const [loading, setLoading] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const nodeConig = useAppSelector(selectConfig);

  useEffect(() => {
    setIsBannerVisible(true);
    setTimeout(() => setIsBannerVisible(false), 5000);
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
        src="https://telemetry.madara.zone/"
        title="telemetry"
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
              {nodeConig.testnet !== 'sharingan'
                ? `You must set the testnet to "sharingan" to see your node here.`
                : `It can take a few minutes for your node to reflect here. Kindly
              check the Logs for any errors`}
            </Banner>
          </BannerContainer>
        )}
      </AnimatePresence>
    </TelemetryContainer>
  );
}
