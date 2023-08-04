/* eslint-disable react/require-default-props */
import { styled } from 'styled-components';

const InputContainer = styled.input`
  background-color: #151515;
  border: 1px solid #2c2e31;
  border-radius: 4px;
  color: white;

  &:focus {
    outline: none;
  }
`;

export default function Input({
  verticalPadding = '0px',
  horizontalPadding = '0px',
  placeholder = '',
  style = {},
  onChange,
}: {
  verticalPadding?: string;
  horizontalPadding?: string;
  placeholder?: string;
  style?: object;
  onChange: any;
}) {
  return (
    <InputContainer
      style={{
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
        paddingTop: verticalPadding,
        paddingBottom: verticalPadding,
        ...style,
      }}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
}
