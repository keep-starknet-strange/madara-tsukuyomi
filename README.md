# madara-tsukuyomi
Madara Desktop Application 

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