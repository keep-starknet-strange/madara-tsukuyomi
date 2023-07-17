import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { selectConfig, setConfig } from 'renderer/features/nodeSlice';
import { styled } from 'styled-components';

const SettingsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background-color: #111111;
  height: 95%;
  width: 30%;
  position: fixed;
  right: 2rem;
  border-radius: 20px;
  z-index: 1;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 2rem;
  border: 1px solid #2d2d2d;
`;

const OpacityContainer = styled(motion.div)`
  position: fixed;
  background-color: black;
  opacity: 0.5;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const MainHeading = styled.div`
  font-size: 1.5rem;
  color: white;
  font-weight: 600;
  margin-bottom: 2rem;
`;

const SettingContainer = styled.div`
  display: flex;
  flex-direction: column;
  .react-select__option {
    color: white;
  }
  .react-select__option--is-selected {
    color: #e62600;
    background-color: rgba(230, 38, 0, 0.17);
  }

  .react-select__option--is-active {
    background-color: transparent;
  }
`;

const SettingHeading = styled.div`
  color: #e62600;
  font-weight: 600;
`;

const CloseButton = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
`;

export default function Settings({ onClose }: { onClose: any }) {
  const [releases, setReleases] = useState([]);
  const [chainSpecs, setChainSpecs] = useState([]);
  const nodeConfig = useSelector(selectConfig);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const response = await axios.get(
        'https://api.github.com/repos/keep-starknet-strange/madara/releases'
      );
      setReleases(
        response.data.map((release: any) => {
          return { value: release.name, label: release.name };
        })
      );
    })();
  }, []);

  const configKeyUpdate = (key: string, value: any) => {
    const newConfig: any = { ...nodeConfig };
    newConfig[key] = value;
    dispatch(setConfig(newConfig));
  };

  return (
    <>
      <OpacityContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
      />
      <SettingsContainer
        initial={{ x: '150%' }}
        animate={{ x: 0, transition: { type: 'tween' } }}
        exit={{ x: '150%' }}
      >
        <CloseButton onClick={onClose}>
          <FontAwesomeIcon icon={faClose} color="white" size="xl" />
        </CloseButton>
        <MainHeading>Settings</MainHeading>
        <SettingContainer>
          <SettingHeading>Release</SettingHeading>
          <Select
            options={releases}
            value={{ value: nodeConfig.git_tag, label: nodeConfig.git_tag }}
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                width: '100%',
                marginTop: '1rem',
              }),
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: '',
                primary25: '',
                primary50: '',
                primary75: '',
                neutral90: 'hsl(0, 0%, 100%)',
                neutral80: 'hsl(0, 0%, 95%)',
                neutral70: 'hsl(0, 0%, 90%)',
                neutral60: 'hsl(0, 0%, 80%)',
                neutral50: 'hsl(0, 0%, 70%)',
                neutral40: 'hsl(0, 0%, 60%)',
                neutral30: 'hsl(0, 0%, 50%)',
                neutral20: 'hsl(0, 0%, 40%)',
                neutral10: 'hsl(0, 0%, 30%)',
                neutral5: 'hsl(0, 0%, 20%)',
                neutral0: 'hsl(0, 0%, 10%)',
              },
            })}
            onChange={(value: any) => configKeyUpdate('git_tag', value.value)}
          />
        </SettingContainer>
        <SettingContainer>
          <SettingHeading>Chain Spec</SettingHeading>
          <Select
            options={chainSpecs}
            value={{ value: nodeConfig.git_tag, label: nodeConfig.git_tag }}
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                width: '100%',
                marginTop: '1rem',
              }),
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: '',
                primary25: '',
                primary50: '',
                primary75: '',
                neutral90: 'hsl(0, 0%, 100%)',
                neutral80: 'hsl(0, 0%, 95%)',
                neutral70: 'hsl(0, 0%, 90%)',
                neutral60: 'hsl(0, 0%, 80%)',
                neutral50: 'hsl(0, 0%, 70%)',
                neutral40: 'hsl(0, 0%, 60%)',
                neutral30: 'hsl(0, 0%, 50%)',
                neutral20: 'hsl(0, 0%, 40%)',
                neutral10: 'hsl(0, 0%, 30%)',
                neutral5: 'hsl(0, 0%, 20%)',
                neutral0: 'hsl(0, 0%, 10%)',
              },
            })}
            onChange={(value: any) => configKeyUpdate('git_tag', value.value)}
          />
        </SettingContainer>
      </SettingsContainer>
    </>
  );
}
