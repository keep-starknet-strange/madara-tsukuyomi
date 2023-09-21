import React from 'react';
import styled from 'styled-components';

// Define the Tooltip component using styled-components
const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipTrigger = styled.div`
  cursor: pointer;
`;

const TooltipText = styled.div`
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s, transform 0.2s ease-in-out;
  font-size: 12px;
  text-align: left;
  width: 170px;

  ${TooltipContainer}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateX(-80%) translateY(-5px);
  }
`;

export default function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipContainer>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipText>{text}</TooltipText>
    </TooltipContainer>
  );
}
