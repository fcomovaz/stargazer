# 🔭 Stargazer — Personal Astronomy Assistant

A **fully static** astronomy web app that tells you exactly what's visible in your sky right now — planets, stars, and deep-sky objects — with azimuth and altitude coordinates.

**No server, no backend, no Python.** Runs entirely in the browser using vanilla JS.

## ✨ Features

- 📍 GPS location detection
- 🌙 Real-time calculations for planets (Moon → Neptune)
- ⭐ 23+ bright stars and deep-sky objects (Messier catalog)
- 👁️ Naked-eye mode (mag ≤ 6.0) and Telescope mode (mag ≤ 10.0)
- 🧭 Device compass integration (mobile)
- 💡 Easy Find guide with fist-width altitude hints
- 🌗 Dark/Light theme with persistence
- 📱 Fully responsive

## 🚀 Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to `main` branch, folder `/ (root)`
4. Your app will be live at `https://YOUR_USERNAME.github.io/REPO_NAME/`

## 🧮 How it works

Astronomy calculations are done entirely in JS using:
- **[astronomy-engine](https://github.com/cosinekitty/astronomy)** — for solar system bodies (precise ephemerides)
- **Spherical trigonometry** (GMST → LST → Hour Angle → Alt/Az) — for fixed stars and DSOs

No API calls, no backend, works offline after first load.
