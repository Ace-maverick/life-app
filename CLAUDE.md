# Life — React Native / Expo App

## Stack
- **Expo** ~54.0 (SDK 54, New Architecture enabled)
- **React Native** 0.81.5 with **React** 19
- **TypeScript** ~5.9 (strict mode)
- Entry point: `index.ts` → `App.tsx`

## Project Structure
```
Life/
├── App.tsx          # Root component
├── index.ts         # Expo entry point
├── app.json         # Expo config (name, icons, splash, platform settings)
├── assets/          # Static images (icon, splash, adaptive-icon, favicon)
├── tsconfig.json    # Extends expo/tsconfig.base, strict: true
└── package.json
```

## Dev Commands
```bash
npm start            # Start Expo dev server (Expo Go / dev client)
npm run android      # Launch on Android emulator/device
npm run ios          # Launch on iOS simulator (macOS only)
npm run web          # Launch in browser
```

> Scan the QR code with **Expo Go** on your phone to preview instantly.

## Key Notes
- New Architecture (`newArchEnabled: true`) is on — use Fabric/JSI-compatible libraries
- Orientation locked to **portrait**
- Android: edge-to-edge enabled; predictive back gesture disabled
- iOS: tablet support enabled
- Web: favicon configured

## Reference Docs
- Expo SDK 54: https://docs.expo.dev/versions/v54.0.0/
- React Native: https://reactnative.dev/docs/getting-started
- Expo Router (if added later): https://docs.expo.dev/router/introduction/

@AGENTS.md
