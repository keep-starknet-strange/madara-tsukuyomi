
<div align="center">
  <img src="docs/assets/sharingan_eye.png" height="250">
</div>

<div align="center">
<br />

[![Project license](https://img.shields.io/github/license/keep-starknet-strange/madara.svg?style=flat-square)](LICENSE)
[![Pull Requests welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg?style=flat-square)](https://github.com/keep-starknet-strange/madara/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
<a href="https://twitter.com/MadaraStarknet">
<img src="https://img.shields.io/twitter/follow/MadaraStarknet?style=social"/>
</a> <a href="https://github.com/keep-starknet-strange/madara-tsukuyomi">
<img src="https://img.shields.io/github/stars/keep-starknet-strange/madara-tsukuyomi?style=social"/>
</a>
</div>

# Madara Tsukuyomi

Madara Tsukuyomi is a one click desktop application that allows anyone (even your grandmother) to start a Madara node with just a click.

## Features

1. Enter your name and deploy a node! An identity is all you need to start running your Madara node
2. Connect to [sharingan](https://github.com/keep-starknet-strange/madara/blob/main/docs/sharingan-starter-pack.md#what-is-sharingan) and configure other settings of the node
3. See the logs of the node in realtime
4. Install dockerized/binary apps that allow you to interact with your node.

## Running Tsukuyomi

Tsukuyomi is an electron app. You can start it as follows

```bash
npm install
npm run start
```

## Demo

You can watch a demo of what we built till the Starknet Hacker House in Paris over [here](https://www.youtube.com/live/skyYpU0xjdc?feature=share&t=19640). However, keep in mind that this video will get outdated with time as we keep adding new features.

## Contribution Guide

If you wish to contribute to Tsukuyomi, feel free to comment on any unassigned issues. We will assign them to you ASAP. Please do not start any work until the issue is assigned. We will try to release a more detailed doc about the structure of the project for all new comers. However, till then, feel free to reach out to us on Telegram for any doubts and discussion.

Telegram - https://t.me/+y1tlUAphfbVjOTFk

## Sign & Notarize Setup

***generate keys***
- `Xcode` -> `Settings...` -> `Accounts` -> `Manage Certificates...` -> `+ Developer ID Application`
- generate app store connect [API key](https://appstoreconnect.apple.com/access/api)
- download API key to `~/.appstoreconnect/private_keys/`

***store keys***
```sh
xcrun notarytool store-credentials kss
```

***sign app***
```sh
DEBUG=electron-osx-sign* CI=true npm run package
```

## Contributors ✨

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/abdelhamidbakhta"><img src="https://avatars.githubusercontent.com/u/45264458?v=4?s=100" width="100px;" alt="Abdel @ StarkWare "/><br /><sub><b>Abdel @ StarkWare </b></sub></a><br /><a href="https://github.com/keep-starknet-strange/madara/commits?author=abdelhamidbakhta" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/apoorvsadana"><img src="https://avatars.githubusercontent.com/u/95699312?v=4?s=100" width="100px;" alt="apoorvsadana"/><br /><sub><b>apoorvsadana</b></sub></a><br /><a href="https://github.com/keep-starknet-strange/madara/commits?author=apoorvsadana" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ayushtom"><img src="https://avatars.githubusercontent.com/u/41674634?v=4" width="100px;" alt="ayushtom"/><br /><sub><b>ayushtom</b></sub></a><br /><a href="https://github.com/keep-starknet-strange/madara/commits?author=ayushtom" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://droak.sh/"><img src="https://avatars.githubusercontent.com/u/5263301?v=4?s=100" width="100px;" alt="Oak"/><br /><sub><b>Oak</b></sub></a><br /><a href="https://github.com/keep-starknet-strange/madara/commits?author=d-roak" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/rkdud007"><img src="https://avatars.githubusercontent.com/u/76558220?v=4?s=100" width="100px;" alt="Pia"/><br /><sub><b>Pia</b></sub></a><br /><a href="https://github.com/keep-starknet-strange/madara/commits?author=rkdud007" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/drspacemn"><img src="https://avatars.githubusercontent.com/u/16685321?v=4?s=100" width="100px;" alt="drspacemn"/><br /><sub><b>drspacemn</b></sub></a><br /><a href="https://github.com/keep-starknet-strange/madara/commits?author=drspacemn" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!
