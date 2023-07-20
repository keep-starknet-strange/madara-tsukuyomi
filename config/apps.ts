const APPS_CONFIG = {
  apps: [
    {
      id: '5625b08e-ac19-49c9-b514-8ba7d12acd13',
      appName: 'Faucet',
      configParams: {},
      binaryFiles: [
        {
          name: 'frontend',
          url: 'https://github.com/keep-starknet-strange/madara-infra/releases/download/starknet-stack-precompiled-bins/starkcet-frontend',
        },
        {
          name: 'backend',
          url: 'https://github.com/keep-starknet-strange/madara-infra/releases/download/starknet-stack-precompiled-bins/starkcet-backend',
        },
      ],
      showFrontend: true,
      frontendUrl: 'http://localhost:3000',
      logoUrl:
        'https://pbs.twimg.com/profile_images/1641711653224890368/10F9oEsa_400x400.jpg',
      postInstallationCommands: [
        'chmod +x ./backend/starkcet-backend',
        'chmod +x ./frontend/starkcet-frontend',
      ],
      runCommamd: [
        'PRIVATE_KEY=0x00c1cf1490de1352865301bb8705143f3ef938f97fdf892f1090dcb5ac7bcd1d STARKNET_ACCOUNT_ADDRESS=0x2 TOKEN_ADDRESS=0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7 RPC_URL=http://localhost:9944 AMOUNT_TRANSFERED=1000000000000000 ./backend/starkcet-backend',
        './frontend/starkcet-frontend',
      ],
    },
    {
      id: '4a4ffc33-d60e-49db-9f55-0c43815dcf86',
      appName: 'Madara Explorer',
      configParams: {},
      binaryFiles: [
        {
          name: 'explorer',
          url: 'https://raw.githubusercontent.com/keep-starknet-strange/madara-infra/stack/bins/starknet-stack/bin/madara-explorer.tar',
        },
      ],
      showFrontend: true,
      frontendUrl: 'http://localhost:8080',
      logoUrl:
        'https://pbs.twimg.com/profile_images/1616483145297035272/SL-kzr3Z_400x400.jpg',
      postInstallationCommands: [
        'tar -xf ./explorer/madara-explorer.tar -C ./explorer',
      ],
      runCommamd: [
        'RPC_API_HOST=http://localhost:9944 SECRET_KEY_BASE=JyULoT5cLBifW+XNEuCTVoAb+SaFgQt9j227RN0cKpR3wTsrApGd1HNcgeopemyl DATABASE_URL=ecto://postgres:postgres@localhost:5432/starknet_explorer_dev PHX_HOST=localhost PORT=8080 ./explorer/starknet_explorer/bin/starknet_explorer start',
      ],
    },
  ],
};

export default APPS_CONFIG;
