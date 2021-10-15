# DeepLT

A simple translation extension for Firefox powered by DeepL

## Development

```bash
npm i
```

**Chrome**

```bash
npm run app:chrome-dev
```

**Edge**

```bash
npm run app:edge-dev
```

**Firefox**

```bash
npm run app:firefox-dev
```

## Production

```bash
npm i
```

```bash
npm run app:chrome
```

**Edge**

```bash
npm run app:edge
```

**Firefox**

```bash
npm run app:firefox
```

## Load package to browsers

**Chrome**

1. Go to the browser's URL address bar
2. Enter `chrome://extensions/`
3. Switch to "**Developer mode**"
4. Load extension by clicking "**Load unpacked**"
5. Browse to `dist/` in source code
6. Done!

Check here for more detail: [https://developer.chrome.com/extensions/getstarted](https://developer.chrome.com/extensions/getstarted)

**Edge**

1. Go to the browser's URL address bar
2. Enter `edge://extensions/`
3. Turn on `Developer mode`
4. Load extension by clicking "**Load unpacked**"
5. Browse to `dist/` in source code
6. Done!

**Firefox**

1. Go to the browser's URL address bar
2. Enter `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on...**
4. Browse to your `manifest.json` & click **Open**
5. Done!