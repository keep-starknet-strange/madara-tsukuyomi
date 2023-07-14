// inspired from here - https://codepen.io/juliandavidmr/pen/JjGrdZV

import { styled } from 'styled-components';
import { AnimationControls, AnimationScope, motion } from 'framer-motion';
import Rinnegan from '../../../assets/rinnegan.png';

const SharinganContainer = styled(motion.div)`
  .container .eye {
    position: relative;
    width: 12em;
    height: 20em;
    margin: 0 auto;
    border-radius: 100% 0px;
    transform: rotate(75deg);
    display: flex;
    justify-content: center;
    align-items: center;
    border: 8px solid #1e1f26;
    overflow: hidden;
    /* box-shadow: 5px 17px 20px 4px #210000; */
    box-shadow: 2px 11px 23px 1px #4a0000;
    animation: open 2s;
  }
  .container .eye:before {
    content: '';
    width: 12em;
    height: 23em;
    position: absolute;
    border-radius: 100%;
    background-color: white;
    box-shadow: inset 20px -2px 20px 0px lightgrey;
    transform: rotate(30deg);
    z-index: 1;
  }
  .container .eye:after {
    content: '';
    width: 24em;
    height: 24em;
    position: absolute;
    border-radius: 100%;
    background-color: white;
    box-shadow: inset -3px 4px 20px 0px lightgray;
  }
  .container .eye:hover .pupil {
    width: 2.7em;
    height: 2.7em;
  }
  .container .eye:hover .brightness {
    width: 1.9em;
    height: 2.9em;
  }
  .container .eye:hover .brightness--1 {
    top: 11.1em;
    left: 7em;
  }
  .container .eye .pupil {
    width: 3em;
    height: 3em;
    background-color: black;
    border-radius: 100%;
    box-shadow: 0px 0px 20px 0px;
    transition-duration: 0.5s;
    position: relative;
  }

  .container .eye .irisOuter {
    margin-bottom: 3em;
    margin-right: 3em;
    z-index: 1;
  }
  .container .eye .iris {
    width: 11em;
    height: 11em;
    background-color: #b00000;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    z-index: 1;
    box-shadow: 0px 0px 20px 0px #8b4513 91;
    border: 8px solid #770707;
    animation: rotateIris 2.4s;
  }

  .container .eye .iris_rennegan {
    width: 11em;
    height: 11em;
    background-color: #b00000;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    z-index: 1;
    /* box-shadow: 0px 0px 20px 0px #8b4513 91; */
    margin-bottom: 3em;
    margin-right: 2em;
    display: none;
  }
  .container .eye .iris-1 {
    height: 11em;
    width: 11em;
    box-shadow: 0 0 1px 1px #b00000;
    background: linear-gradient(
      90deg,
      #b00000 1%,
      #b00000 22%,
      #b00000 50%,
      #b00000 76%,
      #b00000 99%
    );
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
  }
  .container .eye .iris-2 {
    height: 6em;
    width: 6em;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    border: 4px solid #870000;
    position: relative;
  }
  .container .eye .iris-mark {
    position: absolute;
    font-size: 8em;
    text-shadow: 0 1px 8px #fd0404;
  }
  .container .eye .iris-mark-1 {
    left: 0.2em;
    bottom: -0.25em;
    transform: rotate(30deg);
  }
  .container .eye .iris-mark-2 {
    bottom: 0;
    left: 0.45em;
    transform: rotate(-40deg);
  }
  .container .eye .iris-mark-3 {
    bottom: -0.1em;
    left: 0.2em;
    transform: scaleY(-1);
  }
  .container .eye .brightness {
    width: 2em;
    height: 3em;
    background-color: white;
    position: absolute;
    z-index: 1;
    top: 5em;
    border-radius: 14px 31px 10px 7px / 68px 28px 4px 9px;
    opacity: 0.8;
    transition-duration: 0.4s;
  }
  .container .eye .brightness--1 {
    position: absolute;
    width: 1em;
    height: 2em;
    top: 11em;
    left: 7em;
    background-color: white;
    box-shadow: none;
    z-index: 1;
    border-radius: 27px 26px 23px 9px / 92px 58px 43px 14px;
    opacity: 0.8;
    transition-duration: 0.4s;
  }
  @keyframes open {
    from {
      height: 0em;
      transform: rotate(0deg);
    }
  }
  @keyframes rotateIris {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export default function SharinganEye({
  redIrisScope,
  redIrisOuterScope,
  purpleIrisScope,
  eyeScope,
  brightnessOneControl,
  brightnessTwoControl,
}: {
  redIrisScope: AnimationScope;
  redIrisOuterScope: AnimationScope;
  purpleIrisScope: AnimationScope;
  eyeScope: AnimationScope;
  brightnessOneControl: AnimationControls;
  brightnessTwoControl: AnimationControls;
}) {
  return (
    <SharinganContainer animate={{ transition: { type: 'inertia' } }}>
      <div className="container">
        <motion.div className="eye" ref={eyeScope}>
          <motion.img
            ref={purpleIrisScope}
            src={Rinnegan}
            className="iris_rennegan"
            alt="eye"
          />
          <motion.div ref={redIrisOuterScope} className="irisOuter">
            <motion.div ref={redIrisScope} className="iris">
              <div className="iris-1">
                <div className="iris-2">
                  <div className="pupil" />
                  <div className="iris-mark iris-mark-1">,</div>
                  <div className="iris-mark iris-mark-2">,</div>
                  <div className="iris-mark iris-mark-3">,</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          <motion.div animate={brightnessOneControl} className="brightness" />
          <motion.div
            animate={brightnessTwoControl}
            className="brightness--1"
          />
        </motion.div>
      </div>
    </SharinganContainer>
  );
}
