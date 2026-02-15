# Interactive Secure Messaging App

This is a code bundle for Interactive Secure Messaging App. The original project is available at https://www.figma.com/design/5PG3lvHl2FDXkCB6K0TKjz/Interactive-Secure-Messaging-App.

## Running the code

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

## Build Android (Capacitor)

From the project root:

```bash
npm install
npx cap sync android
npm run build:android
```

(`npm run build:android` runs `vite build` then `npx cap sync android`; use it after code changes. Run `npx cap sync android` alone when you only need to sync without rebuilding.)

Then open the Android project in Android Studio or run:

```bash
npx cap open android
```

To build the APK from the command line:

```bash
cd android && ./gradlew assembleDebug
```

The debug APK is generated in `android/app/build/outputs/apk/debug/`.

## Git hygiene

Generated and local files are ignored via `.gitignore` (e.g. `node_modules/`, `dist/`, `android/.gradle/`, `android/**/build/`, `*.apk`, `*.log`). To stop tracking them without deleting files on disk, run from the repo root:

```bash
git rm -r --cached node_modules 2>/dev/null; true
git rm -r --cached dist 2>/dev/null; true
git rm -r --cached .idea 2>/dev/null; true
git rm --cached .DS_Store 2>/dev/null; true
git rm -r --cached android/.gradle 2>/dev/null; true
git rm -r --cached android/app/build 2>/dev/null; true
git rm -r --cached android/build 2>/dev/null; true
git rm --cached local.properties 2>/dev/null; true
git ls-files | grep -E '\.(log|apk|aab|zip|jks|keystore)$' | while read f; do git rm --cached "$f"; done 2>/dev/null; true
```

Then commit: `git add .gitignore && git commit -m "chore: stop tracking generated and local files"`.
