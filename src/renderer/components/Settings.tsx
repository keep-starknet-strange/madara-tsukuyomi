import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  configTypes,
  selectConfig,
  setConfig,
} from 'renderer/features/nodeSlice';
import { styled } from 'styled-components';
import StyledSelect from './Dropdown';
import Input from './Input';

const SettingsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background-color: #111111;
  height: 95%;
  width: 30%;
  position: fixed;
  right: 0rem;
  border-radius: 20px;
  z-index: 1;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 2rem;
  border: 1px solid #2d2d2d;
`;

const ContentContainer = styled.div`
  height: 100%;
  overflow-y: scroll;
  margin-bottom: 2rem;
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
  margin-top: 1.5rem;
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

/*
releases => dropdown
chain spec => file path - can be asked to browse
rpc-cors => null , all , custom list of origins
rpc-external => true/false , try to give unsafe option here too
rpc-methods => unsafe , safe , auto(default)
port => input
rpc_port => input
name => input
telemetry-url => add urls in 0->9 format with drag and drop
bootnodes => show list of bootnode identifiers
*/
export default function Settings({ onClose }: { onClose: any }) {
  const [releases, setReleases] = useState([]);

  const booleanValues = [
    { value: 'true', label: 'true' },
    { value: 'false', label: 'false' },
  ];

  const RPCMethods = [
    { value: 'unsafe', label: 'unsafe' },
    { value: 'safe', label: 'safe' },
    { value: 'auto', label: 'auto' },
  ];

  const nodeConfig = useSelector(selectConfig);
  const dispatch = useDispatch();

  const configKeyUpdate = (key: configTypes, value: any) => {
    const newConfig: any = { ...nodeConfig };
    newConfig[key] = value;
    dispatch(setConfig(newConfig));
  };

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

        <ContentContainer>
          <SettingContainer>
            {/* Releases */}
            <SettingHeading>Release</SettingHeading>
            <StyledSelect
              options={releases}
              value={{
                value: nodeConfig.release,
                label: nodeConfig.release,
              }}
              onChange={(value: any) => configKeyUpdate('release', value.value)}
            />
          </SettingContainer>

          {/* testnet */}
          <SettingContainer>
            <SettingHeading>Testnet</SettingHeading>
            <Input
              value={nodeConfig.testnet}
              placeholder="Testnet name"
              style={{
                fontSize: '1rem',
                width: '100%',
                textAlign: 'left',
                marginTop: '1rem',
              }}
              onChange={(event: any) =>
                configKeyUpdate('testnet', event.target.value)
              }
            />
          </SettingContainer>

          {/* rpc-external */}
          <SettingContainer>
            <SettingHeading>RPC External</SettingHeading>
            <StyledSelect
              options={booleanValues}
              value={{
                value: nodeConfig.RPCExternal,
                label: nodeConfig.RPCExternal,
              }}
              onChange={(value: any) =>
                configKeyUpdate('RPCExternal', value.value)
              }
            />
          </SettingContainer>

          {/* rpc-methods */}
          <SettingContainer>
            <SettingHeading>RPC Method</SettingHeading>
            <StyledSelect
              options={RPCMethods}
              value={{
                value: nodeConfig.RPCMethods,
                label: nodeConfig.RPCMethods,
              }}
              onChange={(value: any) =>
                configKeyUpdate('RPCMethods', value.value)
              }
            />
          </SettingContainer>

          {/* rpc-port */}
          <SettingContainer>
            <SettingHeading>RPC Port</SettingHeading>
            <Input
              placeholder="Default Port Number is 9944"
              style={{
                fontSize: '1rem',
                width: '100%',
                textAlign: 'left',
                marginTop: '1rem',
              }}
              value={nodeConfig.RPCPort}
              onChange={(event: any) =>
                configKeyUpdate('RPCPort', event.target.value)
              }
            />
          </SettingContainer>

          {/* port */}
          <SettingContainer>
            <SettingHeading>Port</SettingHeading>
            <Input
              value={nodeConfig.port}
              placeholder="Default Port Number is 10333"
              style={{
                fontSize: '1rem',
                width: '100%',
                textAlign: 'left',
                marginTop: '1rem',
              }}
              onChange={(event: any) =>
                configKeyUpdate('port', event.target.value)
              }
            />
          </SettingContainer>

          {/* rpc-cors */}
          <SettingContainer>
            <SettingHeading>RPC CORS</SettingHeading>
            <Input
              placeholder="Enter CORS rules"
              style={{
                fontSize: '1rem',
                width: '100%',
                textAlign: 'left',
                marginTop: '1rem',
              }}
              value={nodeConfig.RPCCors}
              onChange={(event: any) =>
                configKeyUpdate('RPCCors', event.target.value)
              }
            />
          </SettingContainer>

          {/* development mode */}
          <SettingContainer>
            <SettingHeading>Development Mode</SettingHeading>
            <StyledSelect
              options={booleanValues}
              value={{
                value: nodeConfig.developmentMode,
                label: nodeConfig.developmentMode,
              }}
              onChange={(value: any) =>
                configKeyUpdate('developmentMode', value.value)
              }
            />
          </SettingContainer>

          {/* bootnodes */}
          <SettingContainer>
            <SettingHeading>Bootnodes</SettingHeading>
            <Input
              value={nodeConfig.bootnodes}
              placeholder="Enter bootnodes seperated by space"
              style={{
                fontSize: '1rem',
                width: '100%',
                textAlign: 'left',
                marginTop: '1rem',
              }}
              onChange={(event: any) =>
                configKeyUpdate('bootnodes', event.target.value)
              }
            />
          </SettingContainer>

          {/* telemetry-url */}
          <SettingContainer>
            <SettingHeading>Telemetry URL</SettingHeading>
            <Input
              value={nodeConfig.telemetryURL}
              placeholder="Enter telemetry url with verbose level"
              style={{
                fontSize: '1rem',
                width: '100%',
                textAlign: 'left',
                marginTop: '1rem',
              }}
              onChange={(event: any) =>
                configKeyUpdate('telemetryURL', event.target.value)
              }
            />
          </SettingContainer>
        </ContentContainer>
      </SettingsContainer>
    </>
  );
}
