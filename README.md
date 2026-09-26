# Mongolian Au Pair

Au Pair зуучлалын веб + Capacitor (Android) апп — React + Vite + Express.

## Local (web)

```bash
npm install
npm run dev
```

- Web: http://localhost:5173  
- API: http://localhost:3001  

## Capacitor (Android)

```bash
npm install
npm run build:app
npm run cap:open
```

Android Studio-оос Run.

Шууд device/emulator дээр асаах:

```bash
npm run cap:run
```

### Native API

Capacitor апп дээр `/api` proxy байхгүй. Deploy хийсэн серверийн URL-ийг build-ээс өмнө тохируулна:

```bash
# Windows PowerShell
$env:VITE_API_URL="https://your-deployed-server.com"
npm run build:app
```

API тохируулаагүй үед UI локал fallback өгөгдлөөр ажиллана (элсэлт илгээхэд сервер хэрэгтэй).

### App ID

- `appId`: `mn.mongolianaupair.app`
- `appName`: Mongolian Au Pair

iOS нэмэх (Mac шаардлагатай):

```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
```

## Production (web deploy)

```bash
npm install
npm run build
npm start
```

Repo: https://github.com/mxnkbatr/aupair
