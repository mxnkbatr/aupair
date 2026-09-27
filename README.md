# Mongolian Au Pair

Au Pair зуучлалын веб + Capacitor (iOS, Android) апп — React + Vite + Express.

## Local (web)

```bash
npm install
npm run dev
```

- Web: http://localhost:5173  
- API: http://localhost:3001  

`MONGODB_URI` тохируулаагүй үед өгөгдөл `server/data/*.json` файлд хадгалагдана.

## Production (Vercel)

`main` branch руу push хийхэд Vercel автоматаар deploy хийнэ → https://aupair-app.vercel.app

- Frontend: `vite build` → `dist`
- API: `api/index.js` (Express, `server/app.js`) — `vercel.json`-д `/api/*` rewrite

Vercel environment variables:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB холболт (production-д заавал) |
| `MONGODB_DB` | Database нэр (default `mongolian_aupair`) |
| `ADMIN_KEY` | `/admin` нууц үг (тохируулаагүй бол админ хаалттай) |
| `AUTH_SECRET` | Нэвтрэх token-ы түлхүүр (заавал биш — байхгүй бол MongoDB-д үүсгэж хадгална) |

Local-д нэмэлтээр: `DATA_DIR` (JSON файлын хавтас), `PORT` (default `3001`).

## Capacitor (iOS, Android)

- `appId`: `mn.aupair.app`, `appName`: Au Pair Mongolia
- Апп `server.url`-аар https://aupair-app.vercel.app-г ачаалдаг. Тиймээс вэб deploy хийгдэхэд апп шинэ build-гүйгээр шинэчлэгдэнэ.
- Шинэ native build зөвхөн plugin, icon, splash, хувилбар өөрчлөгдөхөд хэрэгтэй.

```bash
npm run build:app   # vite build + cap sync (ios, android)
npm run cap:open    # Android Studio
```

iOS build: Ionic Appflow (signing: manual, team `78XCG6RMZS`, profile `aupair`) эсвэл Mac дээр `npx cap open ios`.
Build бүрт `ios/App/App.xcodeproj/project.pbxproj`-ийн `CURRENT_PROJECT_VERSION`, `android/app/build.gradle`-ийн `versionCode`-ийг нэмэгдүүлнэ.

Icon/splash дахин үүсгэх: `assets/` доторх зургийг солиод `npx @capacitor/assets generate --ios --android`.
