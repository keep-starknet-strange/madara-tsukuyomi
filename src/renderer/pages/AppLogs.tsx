import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AppLogs as AppLogsType,
  selectAppLogs,
} from 'renderer/features/appsSlice';
import { styled } from 'styled-components';
import AnsiUp from 'ansi_up';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import APPS_CONFIG, { DockerAppProperties } from '../../../config/apps';

const ansiUp = new AnsiUp();

const Logs = styled.div`
  width: 100%;
  height: 95.5vh;
  overflow-y: scroll;
  margin-top: 4.5vh;
  white-space: break-spaces;
`;

const TabsContainer = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  left: 0;
  border-bottom: 1px solid #222;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: black;
  height: 3vh;
`;

const Tab = styled.div`
  width: 25%;
  font-size: 0.9rem;
  padding-top: 5px;
  padding-bottom: 5px;
  border-right: 1px solid #222;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: center;
  cursor: pointer;
  height: -webkit-fill-available;
`;

function getAppLogsFromAppIdAndContainer(
  allAppLogs: AppLogsType,
  appConfig: DockerAppProperties,
  containerName: string
) {
  if (!allAppLogs[appConfig.id] || !allAppLogs[appConfig.id][containerName]) {
    return '';
  }
  return allAppLogs[appConfig.id][containerName];
}

export default function AppLogs({ close }: { close: any }) {
  const { appId } = useParams();
  const allAppLogs = useSelector(selectAppLogs);
  const appConifg = APPS_CONFIG.apps.filter(
    (app) => app.id === appId
  )[0] as DockerAppProperties;
  const [selectedContainer, setSelectedContaner] = useState<string>(
    appConifg.containers[0].name as string
  );
  const appLogs = getAppLogsFromAppIdAndContainer(
    allAppLogs,
    appConifg,
    selectedContainer
  );
  const terminalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [appLogs]);

  const formatLogs = (combinedLogs: string) => {
    return ansiUp.ansi_to_html(combinedLogs);
  };

  return (
    <>
      <TabsContainer>
        {appConifg.containers.map((container) => (
          <Tab
            style={{
              borderBottom:
                selectedContainer === container.name ? '1px solid #e62600' : '',
            }}
            onClick={() => setSelectedContaner(container.name as string)}
          >
            {container.name}
          </Tab>
        ))}
        <FontAwesomeIcon
          icon={faClose}
          size="2x"
          style={{
            marginLeft: 'auto',
            marginRight: '10px',
            cursor: 'pointer',
          }}
          color="#777"
          onClick={close}
        />
      </TabsContainer>
      <Logs
        dangerouslySetInnerHTML={{ __html: formatLogs(appLogs) }}
        ref={terminalRef}
      />
    </>
  );
}
