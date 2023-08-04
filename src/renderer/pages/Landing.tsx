import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import {
  AnimatePresence,
  motion,
  useAnimate,
  useAnimation,
} from 'framer-motion';
import { Progress } from 'electron-dl';
import { MadaraConfig } from 'main/madara';
import SharinganEye from '../components/SharinganEye';
import Input from '../components/Input';
import Button from '../components/Button';
import InfiniteBarLoader from '../components/InfiniteBarLoader';
import { useDispatch } from 'react-redux';
import {
  selectConfig,
  setConfig,
  startNode,
} from 'renderer/features/nodeSlice';
import { useNavigate } from 'react-router-dom';
import Settings from 'renderer/components/Settings';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'renderer/utils/hooks';

const LandingContainer = styled(motion.div)`
  background-color: black;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const HeadingRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  position: fixed;
  top: 0;
  padding-right: 3rem;
  padding-top: 1rem;
`;

const FormContainer = styled(motion.form)`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const InfiniteLoaderContainer = styled(motion.div)`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const InfiniteLoaderText = styled.div`
  color: white;
  margin-top: 1rem;
`;

const convertBytesToMegabytes = (bytes: number): number => {
  // convert bytes to megabytes and round to 2 decimal places
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
};

export default function Landing() {
  const formAnimationControl = useAnimation();
  const loaderAnimationControl = useAnimation();
  const [redIrisScope, redIrisAnimate] = useAnimate();
  const [redIrisOuterScope, redIrisOuterAnimate] = useAnimate();
  const [purpleIrisScope, purpleIrisAnimate] = useAnimate();
  const [eyeScope] = useAnimate();
  const brightnessOneControl = useAnimation();
  const brightnessTwoControl = useAnimation();
  const [bytesDownloaded, setBytesDownlaoded] = useState<number>(0);
  const [percentageDownloaded, setPercentageDownloaded] = useState<
    number | undefined
  >(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const nodeConfig = useSelector(selectConfig);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  window.electron.ipcRenderer.madara.onDownloadProgress(
    (event: any, progress: Progress) => {
      if (progress.percent !== 0) {
        setPercentageDownloaded(progress.percent * 100);
      }
      setBytesDownlaoded(progress.transferredBytes);
    }
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeConfig.name) {
      return;
    }

    // remove the form
    formAnimationControl.start({
      opacity: [1, 0],
      transition: { duration: 1 },
    });

    // remove the white spots from the eye
    brightnessOneControl.start({
      opacity: 0,
      transition: { duration: 1 },
    });
    brightnessTwoControl.start({
      opacity: 0,
      transition: { duration: 1 },
    });

    // make the height of the form 0 so that the spacing between the loader and the eye is correct
    formAnimationControl.start({
      height: 0,
      transition: { delay: 1, duration: 1 },
    });

    // show the loader for downlaing
    const releaseExists =
      await window.electron.ipcRenderer.madara.releaseExists(nodeConfig);
    if (!releaseExists) {
      loaderAnimationControl.start({
        opacity: [0, 1],
        transition: { duration: 1, delay: 1 },
      });
    }

    // start the rotation of the red eye
    redIrisAnimate(
      redIrisScope.current,
      { rotate: 360 },
      { duration: 1, repeat: Infinity, ease: 'linear', delay: 1 }
    );

    await window.electron.ipcRenderer.madara.setup(nodeConfig);

    if (!releaseExists) {
      await loaderAnimationControl.start({ opacity: [1, 0] });
    }

    redIrisOuterAnimate(
      redIrisOuterScope.current,
      { rotate: 2160 * 4, opacity: [1, 1, 1, 1, 0] },
      {
        duration: 1.4,
        type: 'tween',
        onComplete: () => {
          redIrisOuterScope.current.style.display = 'none';
          purpleIrisScope.current.style.display = 'block';
          eyeScope.current.style.boxShadow = '2px 11px 23px 1px #391a5c';
        },
        rotate: {
          duration: 1.4 * 2,
          repeat: Infinity,
          ease: 'linear',
        },
      }
    );
    await purpleIrisAnimate(
      purpleIrisScope.current,
      { rotate: 2160, opacity: [0, 1, 1, 1, 1] },
      { duration: 1.4, delay: 1.4 }
    );

    // wait for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    dispatch(startNode());
  };

  const handleNameChange = (e: any) => {
    dispatch(
      setConfig({
        ...nodeConfig,
        name: e.target.value,
      })
    );
  };

  return (
    <LandingContainer
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key={'landing_container'}
    >
      <AnimatePresence>
        {isSettingsOpen && (
          <Settings onClose={() => setIsSettingsOpen(false)}></Settings>
        )}
      </AnimatePresence>
      <HeadingRow>
        <FontAwesomeIcon
          icon={faSliders}
          color="white"
          size="xl"
          style={{ opacity: '70%', cursor: 'pointer' }}
          onClick={() => setIsSettingsOpen(true)}
        />
      </HeadingRow>
      <SharinganEye
        redIrisScope={redIrisScope}
        redIrisOuterScope={redIrisOuterScope}
        purpleIrisScope={purpleIrisScope}
        eyeScope={eyeScope}
        brightnessOneControl={brightnessOneControl}
        brightnessTwoControl={brightnessTwoControl}
      />
      <FormContainer onSubmit={handleFormSubmit} animate={formAnimationControl}>
        <Input
          verticalPadding="0.7rem"
          placeholder="What name shall you be known by in this realm?"
          style={{ fontSize: '1rem', width: '40%', textAlign: 'center' }}
          onChange={handleNameChange}
        />
        <Button
          verticalPadding="0.7rem"
          text="Wake up to reality"
          style={{
            fontSize: '1rem',
            width: '40%',
            textAlign: 'center',
            marginTop: '1rem',
          }}
        />
      </FormContainer>
      <InfiniteLoaderContainer
        initial={{ opacity: 0 }}
        animate={loaderAnimationControl}
      >
        <InfiniteBarLoader />
        <InfiniteLoaderText>
          Downloading{' '}
          {percentageDownloaded !== undefined
            ? `${percentageDownloaded.toFixed(2)}%`
            : `${convertBytesToMegabytes(bytesDownloaded)} MB`}
        </InfiniteLoaderText>
      </InfiniteLoaderContainer>
    </LandingContainer>
  );
}
