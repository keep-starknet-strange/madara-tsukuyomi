// taken from here https://csslayout.io/indeterminate-progress-bar/

import { CSSProperties } from 'react';
import { styled } from 'styled-components';

const Bar = styled.div`
  /* Color */
  background-color: #2c2e31;

  /* Rounded border */
  border-radius: 4px;

  /* Size */
  height: 0.5rem;

  position: relative;
  overflow: hidden;
  width: 30%;
`;

const Loader = styled.div`
  /* Color */
  background-color: #e62600;

  /* Rounded border */
  border-radius: 4px;

  /* Absolute position */
  position: absolute;
  bottom: 0;
  top: 0;
  width: 50%;

  /* Move the bar infinitely */
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-name: indeterminate-progress-bar;

  @keyframes indeterminate-progress-bar {
    from {
      left: -50%;
    }
    to {
      left: 100%;
    }
  }
`;

export default function InfiniteBarLoader({
  style,
}: {
  style?: CSSProperties;
}) {
  return (
    <Bar style={style}>
      <Loader />
    </Bar>
  );
}
