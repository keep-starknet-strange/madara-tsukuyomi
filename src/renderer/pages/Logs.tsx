import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectLogs } from 'renderer/features/nodeSlice';
import { styled } from 'styled-components';

const TerminalContainer = styled(motion.div)`
  color: #cccccc;
  white-space: pre-wrap;
  overflow-y: scroll;
  height: 99%;
  padding-bottom: 1%;
  font-size: 12px;
  font-family: Hack;
  /* line-height: 1.2px; */
`;

const TerminalTime = styled.span`
  color: #868686;
`;

const TerminalNormalLog = styled.span`
  color: #cccccc;
`;

export default function Logs() {
  const logs = useSelector(selectLogs);
  const terminalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const formatLogs = (combinedLogs: string) => {
    // split combinedLogs by \n and returns two spans for each line, the first span is the first 19 chars and the second is the remaining
    return combinedLogs.split('\n').map((log, index) => {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index}>
          <TerminalTime>{log.slice(0, 19)}</TerminalTime>
          <TerminalNormalLog>{log.slice(19)}</TerminalNormalLog>
        </div>
      );
    });
  };

  return (
    <TerminalContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      ref={terminalRef}
    >
      {formatLogs(logs)}
    </TerminalContainer>
  );
}
