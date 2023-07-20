import { styled } from 'styled-components';
import Select from 'react-select';

const StyledContainer = styled.div`
  .react-select__option {
    color: white;
  }
  .react-select__option--is-selected {
    color: #e62600;
    background-color: rgba(230, 38, 0, 0.17);
  }

  .react-select__option--is-active {
    background-color: transparent;
  }
`;

function StyledSelect(props: { options: any; value: any; onChange: any }) {
  const { options, value, onChange } = props;
  return (
    <StyledContainer>
      <Select
        options={options}
        value={value}
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            width: '100%',
            marginTop: '1rem',
          }),
        }}
        className="react-select-container"
        classNamePrefix="react-select"
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '',
            primary25: '',
            primary50: '',
            primary75: '',
            neutral90: 'hsl(0, 0%, 100%)',
            neutral80: 'hsl(0, 0%, 95%)',
            neutral70: 'hsl(0, 0%, 90%)',
            neutral60: 'hsl(0, 0%, 80%)',
            neutral50: 'hsl(0, 0%, 70%)',
            neutral40: 'hsl(0, 0%, 60%)',
            neutral30: 'hsl(0, 0%, 50%)',
            neutral20: 'hsl(0, 0%, 40%)',
            neutral10: 'hsl(0, 0%, 30%)',
            neutral5: 'hsl(0, 0%, 20%)',
            neutral0: 'hsl(0, 0%, 10%)',
          },
        })}
        onChange={onChange}
      />
    </StyledContainer>
  );
}

export default StyledSelect;
