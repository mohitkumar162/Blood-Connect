🩸 BloodConnect - Blood Donor Finder App

A real-time blood donor finder built with React + Spring Boot.

----

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+ → https://nodejs.org
- Java 17+ → https://adoptium.net
- Maven 3.9+ → https://maven.apache.org
- Docker Desktop → https://docker.com

### Step 1 — Start Database & Redis (Docker)

```bash
docker run -d --name blooddonor-postgres \
  -e POSTGRES_DB=blooddonor \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16-alpine

docker run -d --name blooddonor-redis \
  -p 6379:6379 redis:7-alpine
```
or(manually)

connect with the local postgres server and make a blooddonor database

### Step 2 — Run Frontend(open new terminal)

```bash
cd 'Blood Connect'
cd frontend
cp .env.example .env
npm install or npm install --legacy-peer-deps (if ignore the strict version conflict warnings)
npm run dev
```
Frontend → http://localhost:5173

### Step 3 — Run Backend(open new terminal)

```bash
cd 'Blood Connect'
cd backend
mvn spring-boot:run
```
Backend → http://localhost:8080

----

### Step 4 — Next time (containers already exist)

```bash
docker start blooddonor-postgres blooddonor-redis
```

## 🐳 Run Everything with Docker Compose

```bash
docker compose up --build
```

| Service   | URL                   |
|-----------|-----------------------|
| Frontend  | http://localhost:5173 |
| Backend   | http://localhost:8080 |

## 🌐 Deploy to Production

| Service    | Platform        |
|------------|-----------------|
| Frontend   | Vercel          |
| Backend    | Render          |
| Database   | Neon (PostgreSQL)|
| Cache      | Upstash (Redis) |

### Required Environment Variables for Backend (Render)

| Variable | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | Neon connection string |
| `SPRING_DATASOURCE_USERNAME` | Neon username |
| `SPRING_DATASOURCE_PASSWORD` | Neon password |
| `SPRING_DATA_REDIS_HOST` | Upstash endpoint |
| `SPRING_DATA_REDIS_PASSWORD` | Upstash password |
| `JWT_SECRET` | Random 256-bit string |
| `MAIL_USERNAME` | Gmail address |
| `MAIL_PASSWORD` | Gmail app password |
| `APP_FRONTEND_URL` | Your Vercel URL |

### Required Environment Variables for Frontend (Vercel)

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | Your Render backend URL |
| `VITE_WS_URL` | Your Render backend URL + /ws |

## 🔑 Optional Services

- **Google Maps** — Add `VITE_GOOGLE_MAPS_API_KEY` in frontend `.env` for live map
- **Firebase** — Replace `backend/src/main/resources/firebase-service-account.json` for push notifications
- **Twilio** — Add Twilio env vars for SMS notifications

----

## 📁 Project Structure

```
blood-donor-app/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── components/# Reusable components
│   │   ├── services/  # API calls
│   │   ├── store/     # Zustand auth store
│   │   └── hooks/     # WebSocket, Geolocation
│   └── .env.example
├── backend/           # Spring Boot + PostgreSQL
│   └── src/main/java/com/blooddonor/
│       ├── controller/ # REST endpoints
│       ├── service/    # Business logic
│       ├── model/      # Entities & DTOs
│       ├── repository/ # Database queries
│       ├── security/   # JWT auth
│       └── config/     # Spring configs
└── docker-compose.yml
```
