# TEATO – Deployment Guide

## Options

1. **Vercel (frontend) + Railway/Render (backend + MongoDB)**  
2. **AWS (EC2/ECS + RDS or DocumentDB / Atlas)**  
3. **Docker (single host or compose)**

---

## Environment (production)

- `NODE_ENV=production`
- `MONGODB_URI` – e.g. MongoDB Atlas URI
- `JWT_SECRET` – strong random secret
- `CLIENT_URL` – frontend origin (e.g. `https://teato.vercel.app`)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` if using Razorpay
- Optional: `GOOGLE_MAPS_API_KEY`

---

## Vercel (frontend)

1. Connect repo to Vercel, set root to `client`.
2. Build command: `npm run build`, output directory: `build`.
3. Add env: `REACT_APP_API_URL=https://your-api.com` (no trailing slash).
4. Deploy. Set backend `CLIENT_URL` to your Vercel URL.

---

## Backend (Node) on Railway / Render / EC2

1. Set root to `server` (or deploy only `server` folder).
2. Set start script: `npm start` (runs `node server.js`).
3. Add env vars as above.
4. Ensure `uploads` directory exists or set `UPLOAD_PATH` to a persistent volume.
5. For file uploads at scale, replace local storage with S3/Cloudinary and serve via URL.

---

## Docker

### Build and run with Docker Compose

From project root:

```bash
docker-compose up -d
```

Requires:

- `docker-compose.yml` at root (see below).
- `server/Dockerfile` and optionally `client/Dockerfile` or static serve from backend.

Example `docker-compose.yml`:

```yaml
version: '3.8'
services:
  api:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/teato
      - JWT_SECRET=${JWT_SECRET}
      - CLIENT_URL=${CLIENT_URL}
    depends_on:
      - mongo
    volumes:
      - uploads_data:/app/uploads
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
  uploads_data:
```

Example `server/Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploads
EXPOSE 5000
CMD ["node", "server.js"]
```

---

## Security checklist

- Use HTTPS only.
- Strong `JWT_SECRET`, never commit.
- Rate limiting enabled (default in server).
- CORS restricted to `CLIENT_URL`.
- Input validation and sanitization (already in place).
- Keep dependencies updated (`npm audit`).

---

## Post-deploy

1. Run seed once: `npm run seed` (or create admin manually).
2. Change default admin password.
3. Configure Razorpay webhook (if needed) to your `/api/payments/razorpay/verify` or dedicated webhook route.
4. Optional: set up PWA and push notifications (service worker already prepared via manifest).
