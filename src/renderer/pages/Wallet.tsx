import { useEffect } from 'react';
import Button from 'renderer/components/Button';
import Input from 'renderer/components/Input';
import {
  getFunds,
  newWallet,
  selectAddress,
  selectBalance,
  selectPrivateKey,
  setupWallet,
} from 'renderer/features/walletSlice';
import { useAppDispatch, useAppSelector } from 'renderer/utils/hooks';
import { styled } from 'styled-components';

const WalletContainer = styled.div`
  width: 100%;
  height: 100%;
  padding-left: 3rem;
  padding-top: 3rem;
  display: flex;
  flex-direction: column;
`;

const Label = styled.div`
  color: #e62600;
  font-weight: 600;
  font-size: 1.15rem;
`;

const ActionRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 1rem;
`;

const NewWalletButton = styled.div`
  color: grey;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin-left: 1rem;
  font-size: 0.9rem;
  cursor: pointer;
`;

function Value({ value }: { value: string }) {
  return (
    <Input
      onChange={() => {}}
      style={{
        width: '50%',
        marginTop: '1rem',
        fontSize: '1rem',
        color: 'grey',
        caretColor: 'transparent',
        marginBottom: '2rem',
        padding: '0.5rem 1rem',
      }}
      value={value}
    />
  );
}

export default function Wallet() {
  const dispatch = useAppDispatch();
  const address = useAppSelector(selectAddress);
  const privateKey = useAppSelector(selectPrivateKey);
  const balance = useAppSelector(selectBalance);
  useEffect(() => {
    (async () => {
      dispatch(setupWallet());
    })();
  }, []);

  const handleGetFunds = () => {
    dispatch(getFunds());
  };

  const handleNewWallet = () => {
    dispatch(newWallet());
  };

  return (
    <WalletContainer>
      <Label>Wallet Address</Label>
      <Value value={address} />
      <Label>Private Key</Label>
      <Value value={privateKey} />
      <Label>Balance</Label>
      <Value value={balance} />
      <ActionRow>
        <Button
          verticalPadding="0.5rem"
          horizontalPadding="1rem"
          text="💧 Get funds"
          style={{ fontSize: '1.1rem', width: '20%' }}
          onClick={handleGetFunds}
        />
        <NewWalletButton onClick={handleNewWallet}>New wallet</NewWalletButton>
      </ActionRow>
    </WalletContainer>
  );
}
