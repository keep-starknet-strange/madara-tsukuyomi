import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { styled } from 'styled-components';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { stopNode } from 'renderer/features/nodeSlice';
import { useAppDispatch } from 'renderer/utils/hooks';
import MadaraLogo from '../../../assets/madara-logo.png';
import Logs from './Logs';
import Telemetry from './Telemetry';
import TwitterIcon from '../../../assets/twitter.png';
import Spinner from 'renderer/components/Spinner';

const NavbarContainer = styled(motion.div)`
  background-color: black;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

const Navbar = styled(motion.div)`
  background-color: #111111;
  height: 100%;
  width: 18%;
  display: flex;
  flex-direction: column;
  padding-left: 0.8rem;
  padding-right: 0.8rem;
`;

const ContentContainer = styled.div`
  background-color: black;
  width: 82%;
  height: 100%;
  position: relative;
`;

const NavbarHeading = styled.div`
  color: white;
  font-size: 1.6rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-top: 1rem;
`;

const NavbarHeadingLogo = styled.img`
  width: 3rem;
  margin-right: 0.4rem;
`;

const NavbarItemsContainer = styled.div`
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  padding-bottom: 1.5rem;
  height: -webkit-fill-available;
`;

const NavbarItem = styled.div<{ active: boolean }>`
  background-color: ${(props) =>
    props.active ? 'rgba(230, 38, 0, 0.17)' : 'transparent'};
  color: ${(props) => (props.active ? '#e62600' : '#9CA3AF')};
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
  padding-left: 0.8rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
`;

type NavbarItemType = {
  name: string;
  path: string;
  component: ReactNode;
};
const NAVBAR_ITEMS: NavbarItemType[] = [
  {
    name: '🔍 Logs',
    path: 'logs',
    component: <Logs />,
  },
  {
    name: '📊 Telemetry',
    path: 'telemetery',
    component: <Telemetry />,
  },
];

export default function Navigtion() {
  const [navbarIndex, setNavbarIndex] = useState<number>(0);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleScreenshot = async () => {
    await window.electron.ipcRenderer.madara.sendTweet();
  };

  return (
    <NavbarContainer>
      <Navbar
        initial={{ x: '-150%' }}
        animate={{ x: 0, transition: { type: 'tween', duration: 0.5 } }}
      >
        <NavbarHeading>
          <NavbarHeadingLogo src={MadaraLogo} />
          Madara
        </NavbarHeading>
        <NavbarItemsContainer>
          {NAVBAR_ITEMS.map((item, index) => (
            <NavbarItem
              onClick={() => {
                navigate(`./${item.path}`);
                setNavbarIndex(index);
              }}
              active={navbarIndex === index}
            >
              {item.name}
            </NavbarItem>
          ))}
          <NavbarItem onClick={() => handleScreenshot()} active={false}>
            <img
              src={TwitterIcon}
              width={16}
              height={16}
              alt="twitter icon"
              style={{ marginRight: 10 }}
            />
            Tweet
          </NavbarItem>
          <NavbarItem
            onClick={() => {
              dispatch(stopNode());
            }}
            style={{ marginTop: 'auto' }}
            active={false}
          >
            🔌 Stop Node
          </NavbarItem>
        </NavbarItemsContainer>
      </Navbar>
      <ContentContainer>
        <Routes>
          {NAVBAR_ITEMS.map((item) => (
            <Route path={`/${item.path}`} element={item.component} />
          ))}
        </Routes>
      </ContentContainer>
    </NavbarContainer>
  );
}
