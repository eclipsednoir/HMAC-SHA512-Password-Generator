# HMAC-SHA512 Password Generator
[![DOI](https://zenodo.org/badge/847687256.svg)](https://doi.org/10.5281/zenodo.15176953)

A secure, offline-ready password generator that never stores anything and works anywhere — even without internet.

## Why Use This?

- **No need to remember or store complex passwords**
- **Reproducible output** from two simple inputs (you don’t need a vault)
- **Zero cloud dependency** – works offline, no syncing, no accounts
- **Truly portable** – just one `.html` file and a browser
- **Secure by design** – powered by HMAC-SHA512, with character entropy enforcement
- **No data ever leaves your device**

## Try It Online

Use it [here](https://eclipsednoir.github.io/HMAC-SHA512-Password-Generator/).  
(*Once loaded, it works entirely offline.*)

## Use It Offline

1. Download the `HMAC-SHA512-Password-Generator.html` file.
2. Open it in any web browser.
3. You're good to go — forever.

## How It Works (Briefly)

You enter:
- A **Password Base** (e.g. the name of the website or service)
- A **Secret Key** (your master phrase)

The tool combines them using HMAC-SHA512 to create a strong, Base64-encoded password.  
You can optionally truncate the result to a preferred length (e.g. 16, 24, 32 characters) — and the app intelligently picks high-entropy segments.

The same input combo will always generate the same password — so you never need to store anything.

## Security Notes

- All logic runs locally in the browser
- No third-party requests or APIs
- No storage, no telemetry, no cloud
- CryptoJS (HMAC-SHA512, Base64) is bundled in the file

## License

This project is licensed under the MIT License.  
It includes embedded code from the following libraries, also under MIT:

- [crypto-js](https://github.com/brix/crypto-js)  
  © 2009–2013 Jeff Mott, © 2013–2016 Evan Vosberg
- [particles.js](https://github.com/VincentGarreau/particles.js)  
  © 2015 Vincent Garreau

See the `js/crypto-js/` and `js/particles.js/` directories for their respective LICENSE files.
