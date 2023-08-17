import { useParams } from 'react-router-dom';
import { styled } from 'styled-components';
import Input from 'renderer/components/Input';
import { useEffect, useState } from 'react';
import Button from 'renderer/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import APPS_CONFIG, { DockerAppProperties } from '../../../config/apps';
import { useAppDispatch } from 'renderer/utils/hooks';
import { showSnackbar } from 'renderer/store/snackbar';

const SettingsContainer = styled.div`
  padding-top: 4%;
  display: flex;
  flex-direction: column;
`;

const SettingsTitle = styled.div`
  font-size: 2rem;
  margin-bottom: 40px;
`;

const SettingsLabel = styled.div`
  font-size: 1rem;
  margin-bottom: 10px;
  color: #e62600;
`;

export default function AppSettings({ close }: { close: any }) {
  const { appId } = useParams();
  const [settings, setSettings] = useState<{ [name: string]: string }>({});
  const appConifg = APPS_CONFIG.apps.filter(
    (app) => app.id === appId
  )[0] as DockerAppProperties;
  const dispatch = useAppDispatch();

  const handleSettingsChange = (name: string, value: string) => {
    setSettings({ ...settings, [name]: value });
  };

  const handleSave = async () => {
    await window.electron.ipcRenderer.madaraApp.updateAppSettings(
      appId,
      settings
    );
    dispatch(showSnackbar('Saved'));
  };

  useEffect(() => {
    const getSettings = async () => {
      const appSettings =
        await window.electron.ipcRenderer.madaraApp.getAppSettings(appId);
      setSettings(appSettings);
    };
    getSettings();
  }, []);

  return (
    <SettingsContainer>
      <SettingsTitle>Settings</SettingsTitle>
      {appConifg.settings?.map((setting) => (
        <>
          <SettingsLabel>{`${setting.name.toUpperCase()}${
            setting.required ? '*' : ''
          }`}</SettingsLabel>
          <Input
            placeholder={setting.environmentName}
            style={{
              fontSize: '1rem',
              width: '70%',
              textAlign: 'left',
              marginBottom: '20px',
            }}
            onChange={(e) =>
              handleSettingsChange(setting.environmentName, e.target.value)
            }
            value={settings[setting.environmentName]}
            type={setting.type === 'secret' ? 'password' : 'text'}
          />
        </>
      ))}
      <Button
        text="Save"
        verticalPadding="0.8rem"
        horizontalPadding="0.7rem"
        style={{ marginTop: '20px', width: '20%', fontSize: '1rem' }}
        onClick={handleSave}
      />
      <FontAwesomeIcon
        icon={faClose}
        size="2x"
        color="#777"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          cursor: 'pointer',
        }}
        onClick={close}
      />
    </SettingsContainer>
  );
}
