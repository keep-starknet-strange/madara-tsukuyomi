import { createSlice } from '@reduxjs/toolkit';
import * as starknet from 'starknet';
import erc20Abi from '../../../config/abi/erc20.json';

// global variable initialized only once
let PROVIDER: starknet.RpcProvider;

const FAUCET_WALLET_ADDRESS = '0x2';
const FAUCET_PRIVATE_KEY =
  '0x00c1cf1490de1352865301bb8705143f3ef938f97fdf892f1090dcb5ac7bcd1d';
const FEE_TOKEN_ADDRESS =
  '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';

export enum NEW_WALLET_STATE {
  UNINITIALIZED = 'UNINITIALIZED',
  GETTING_FUNDS = 'GETTING_FUNDS',
  DEPLOYING = 'DEPLOYING',
  DEPLOYED = 'DEPLOYED',
}

const initialState = {
  address: '',
  privateKey: '',
  balance: '',
  newWalletState: NEW_WALLET_STATE.UNINITIALIZED,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setBalance: (state, data) => {
      state.balance = data.payload;
    },
    setKeyPair: (state, data) => {
      state.address = data.payload.address;
      state.privateKey = data.payload.privateKey;
    },
    setNewWalletState: (state, data) => {
      state.newWalletState = data.payload;
    },
  },
});

export const { setBalance, setKeyPair, setNewWalletState } =
  walletSlice.actions;

export const selectAddress = (state: any): string => {
  return state.wallet.address;
};

export const selectPrivateKey = (state: any): string => {
  return state.wallet.privateKey;
};

export const selectBalance = (state: any): string => {
  return state.wallet.balance;
};

export const setupWallet = () => async (dispatch: any, getState: any) => {
  const address = selectAddress(getState());
  if (!address) {
    await newWallet()(dispatch, getState);
  }
};

export const newWallet = () => async (dispatch: any, getState: any) => {
  const provider = getProvider();
  dispatch(setBalance(0));
  dispatch(
    setKeyPair({
      address: '0x',
      privateKey: '0x',
    })
  );
  const privateKey = starknet.addAddressPadding(randomHexNumber());
  const SALT =
    '0x0000000000000000000000000000000000000000000000000000000000001111';
  const CAIRO_1_ACCOUNT_CONTRACT_CLASS_HASH =
    '0x35ccefcf9d5656da623468e27e682271cd327af196785df99e7fee1436b6276';
  const CONSTRUCTOR_CALLDATA = [privateKey];

  const accountAddress = starknet.hash.calculateContractAddressFromHash(
    SALT,
    CAIRO_1_ACCOUNT_CONTRACT_CLASS_HASH,
    CONSTRUCTOR_CALLDATA,
    0
  );

  const account = new starknet.Account(
    provider,
    accountAddress,
    privateKey,
    '1'
  );
  dispatch(
    setKeyPair({
      address: accountAddress,
      privateKey,
    })
  );
  dispatch(setNewWalletState(NEW_WALLET_STATE.GETTING_FUNDS));
  await getFunds()(dispatch, getState);
  dispatch(setNewWalletState(NEW_WALLET_STATE.DEPLOYING));

  const txn = await account.deploySelf(
    {
      classHash: CAIRO_1_ACCOUNT_CONTRACT_CLASS_HASH,
      constructorCalldata: CONSTRUCTOR_CALLDATA,
      addressSalt: SALT,
      contractAddress: accountAddress,
    },
    { maxFee: '12345678' }
  );
  await provider.waitForTransaction(txn.transaction_hash);

  // get balance updates the balance in the state as well
  await getBalance()(dispatch, getState);
  dispatch(setNewWalletState(NEW_WALLET_STATE.DEPLOYED));
};

export const getFunds = () => async (dispatch: any, getState: any) => {
  const provider = getProvider();
  const address = selectAddress(getState());
  const contract = new starknet.Contract(erc20Abi, FEE_TOKEN_ADDRESS, provider);
  const faucetAccount = new starknet.Account(
    provider,
    FAUCET_WALLET_ADDRESS,
    FAUCET_PRIVATE_KEY
  );

  const calls = contract.populate('transfer', {
    recipient: address,
    amount: {
      low: '100000000000000000',
      high: '0',
    },
  });
  const txn = await faucetAccount.execute(calls, undefined, {
    maxFee: '12345678',
  });

  // TODO: handle failing transactions
  await provider.waitForTransaction(txn.transaction_hash);

  // get balance updates the balance in the state as well
  await getBalance()(dispatch, getState);
};

export const getBalance = () => async (dispatch: any, getState: any) => {
  const provider = getProvider();
  const address = selectAddress(getState());
  const contract = new starknet.Contract(erc20Abi, FEE_TOKEN_ADDRESS, provider);
  const balance = await contract.balanceOf(address);
  const balanceBn = starknet.uint256.uint256ToBN(balance.balance);
  dispatch(setBalance(balanceBn.toString()));
  return balanceBn.toString();
};

export default walletSlice.reducer;

const getProvider = (): starknet.RpcProvider => {
  if (PROVIDER) {
    return PROVIDER;
  }
  PROVIDER = new starknet.RpcProvider({
    nodeUrl: `http://localhost:9944`,
    retries: 3,
  });
  return PROVIDER;
};

// function to generate a random hex number
function randomHexNumber(): string {
  return `0x${Math.floor(Math.random() * 100000).toString(16)}`;
}
