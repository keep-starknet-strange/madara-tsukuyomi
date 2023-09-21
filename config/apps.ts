import { ContainerCreateOptions } from 'dockerode';

export type AppSettings = {
  name: string;
  type: 'plaintext' | 'secret';
  environmentName: string;
  required: boolean;
  containerName: string;
};

export type CommonAppProperties = {
  id: string;
  appName: string;
  appType: 'binary' | 'docker';
  configParams: Record<string, string>;
  showFrontend: boolean;
  frontendUrl: string;
  logoUrl: string;
  postInstallationCommands: string[];
  markdownDocsUrl?: string;
  settings?: AppSettings[];
  requiresRunningNode: boolean;
  stableNodeVersion: string;
};

export type BinaryAppProperties = CommonAppProperties & {
  files: {
    name: string;
    url: string;
  }[];
  appType: 'binary';
  runCommamd: string[];
};

export type DockerAppProperties = CommonAppProperties & {
  containers: ContainerCreateOptions[];
  appType: 'docker';
  bind: boolean;
};

const APPS_CONFIG: { apps: (BinaryAppProperties | DockerAppProperties)[] } = {
  apps: [
    {
      id: '5625b08e-ac19-49c9-b514-8ba7d12acd13',
      appName: 'Faucet',
      appType: 'binary',
      configParams: {},
      files: [
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
      requiresRunningNode: true,
      stableNodeVersion: 'v0.1.0.experimental.6',
    },
    {
      id: '4a4ffc33-d60e-49db-9f55-0c43815dcf86',
      appName: 'Madara Explorer',
      appType: 'binary',
      configParams: {},
      files: [
        {
          name: 'explorer',
          url: 'https://github.com/keep-starknet-strange/madara-infra/releases/download/starknet-stack-precompiled-bins/madara-explorer.tar',
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
      requiresRunningNode: true,
      stableNodeVersion: 'v0.1.0.experimental.6',
    },
    {
      id: '20328678-1cec-4e84-a2ea-0b83cd84bece',
      appName: 'Dojo Chess',
      appType: 'binary',
      configParams: {},
      files: [
        {
          name: 'chess',
          url: 'https://raw.githubusercontent.com/keep-starknet-strange/madara-tsukuyomi/app_demo/config/dojo_chess/deploy_files.zip',
        },
      ],
      showFrontend: false,
      frontendUrl: 'http://localhost:8080',
      logoUrl:
        'https://pbs.twimg.com/profile_images/1632841549225635841/pRDUFNkT_400x400.png',
      postInstallationCommands: ['unzip chess/deploy_files.zip -d chess/'],
      runCommamd: [
        'sozo migrate --manifest-path ./chess/deploy_files/Scarb.toml',
      ],
      requiresRunningNode: true,
      stableNodeVersion: 'v0.1.0.experimental.6',
    },
    {
      id: '6430cd1b-097d-46be-a44d-aa7631433910',
      appName: 'Apibara Starknet',
      appType: 'docker',
      configParams: {},
      containers: [
        {
          Image: 'quay.io/apibara/starknet:1.0',
          Cmd: [
            'start',
            '--data=/data',
            '--rpc=http://host.docker.internal:9944', // TODO: make it work on any port
          ],
          name: 'apibara-starknet',
          HostConfig: {
            PortBindings: {
              '7171/tcp': [
                {
                  HostPort: '7171',
                },
              ],
            },
          },
        },
      ],
      showFrontend: false,
      frontendUrl: 'http://localhost:80',
      logoUrl:
        'https://pbs.twimg.com/profile_images/1551145433547825159/on1AZ7qW_400x400.jpg',
      postInstallationCommands: [],
      markdownDocsUrl:
        'https://raw.githubusercontent.com/keep-starknet-strange/madara/main/README.md',
      bind: false,
      requiresRunningNode: true,
      stableNodeVersion: 'v0.1.0.experimental.6',
    },
    {
      id: '5d4c83c6-40bc-4437-a31e-f51635f1d01e',
      appName: 'Pragma Price Dump',
      appType: 'docker',
      configParams: {},
      containers: [
        {
          Image: 'quay.io/apibara/sink-postgres:0.1.0',
          Cmd: [
            'run',
            '/data/pragma_price_dump.js',
            '--stream-url',
            'http://host.docker.internal:7171',
          ],
          name: 'apibara-sink-postgres',
          HostConfig: {
            Binds: [
              '<%= ELECTRON_APP_DIRECTORY %>/apps/<%= APP_ID %>/volume:/data',
            ],
          },
        },
        {
          Image: 'apoorvsadana/pragma_publish',
          Cmd: [],
          name: 'pragma-publish',
        },
        {
          Image: 'apoorvsadana/pragma_explorer',
          Cmd: [],
          name: 'pragma-explorer',
          HostConfig: {
            PortBindings: {
              '3000/tcp': [
                {
                  HostPort: '3131',
                },
              ],
            },
          },
        },
      ],
      showFrontend: true,
      frontendUrl: 'http://localhost:3131',
      logoUrl:
        'https://pbs.twimg.com/profile_images/1660624429632585728/XHGqaFAP_400x400.jpg',
      postInstallationCommands: [
        'curl -O https://raw.githubusercontent.com/apoorvsadana/storage/main/pragma_price_dump.js',
      ],
      settings: [
        {
          name: 'Supabase Url',
          type: 'plaintext',
          environmentName: 'NEXT_PUBLIC_SUPABASE_URL',
          containerName: 'pragma-explorer',
          required: true,
        },
        {
          name: 'Supabase Anon Key',
          type: 'secret',
          environmentName: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          containerName: 'pragma-explorer',
          required: true,
        },
        {
          name: 'Postgres Connection String',
          type: 'plaintext',
          environmentName: 'POSTGRES_CONNECTION_STRING',
          containerName: 'apibara-sink-postgres',
          required: true,
        },
      ],
      bind: true,
      requiresRunningNode: true,
      stableNodeVersion: 'v0.1.0.experimental.6',
    },
  ],
};

export default APPS_CONFIG;
