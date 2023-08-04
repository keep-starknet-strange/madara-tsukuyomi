/* eslint-disable react/require-default-props */
import React, { CSSProperties } from 'react';
import { styled } from 'styled-components';

const InputContainer = styled.input`
  background-color: #151515;
  border: 1px solid #2c2e31;
  border-radius: 4px;
  color: white;
  box-sizing: border-box;
  padding: 0.7rem;

  &:focus {
    outline: none;
  }
`;

export default function Input({
  placeholder = '',
  style = {},
  onChange,
  value,
}: {
  placeholder?: string;
  style?: CSSProperties;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string | undefined;
}) {
  return (
    <InputContainer
      value={value}
      style={{
        ...style,
      }}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
    />
  );
}
