# ХАНЗ Академи

Хятад хэлний академийн веб апп — React + Vite + Express.

## Local

```bash
npm install
npm run dev
```

- Web: http://localhost:5173  
- API: http://localhost:3001  

## Production (deploy)

```bash
npm install
npm run build
npm start
```

`npm start` нь `dist` (frontend) + `/api` (backend)-ийг нэг порт дээр ажиллуулна.

### Render / Railway / Fly.io

| Setting | Value |
|--------|--------|
| Build | `npm install && npm run build` |
| Start | `npm start` |
| Node | 20+ |

Орчны хувьсагч (заавал биш):

- `PORT` — серверийн порт  
- `ADMIN_KEY` — админ API түлхүүр  

Repo: https://github.com/mxnkbatr/khanz
