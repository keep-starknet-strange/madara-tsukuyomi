import { motion } from 'framer-motion';
import React from 'react';
import { styled } from 'styled-components';

const AppSideDrawerContainer = styled(motion.div)`
  color: #cccccc;
  overflow-y: hidden;
  height: 100%;
  font-size: 12px;
  font-family: Hack;
  position: absolute;
  top: 0%;
  background-color: black;
  width: 70%;
  right: 0;
  padding-left: 2%;
  padding-right: 2%;
  border-left: 1px solid #222;
`;

const Overlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  opacity: 0.5;
`;

export default function AppSideDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
      />
      <AppSideDrawerContainer
        initial={{ x: '100%' }}
        animate={{ x: 0, transition: { type: 'tween' } }}
        exit={{ x: '100%' }}
      >
        {children}
      </AppSideDrawerContainer>
    </>
  );
}
