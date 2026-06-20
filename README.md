# Sneaker Drop — Real-Time Inventory System

## Quick Start

```bash
git clone <repo>
cd sneaker-drop
cp .env.example .env
docker-compose up --build
# In another terminal, after containers are up:
docker exec -it sneaker_drop_backend npx prisma migrate dev --name init
```

App runs at: http://localhost:3000
API runs at: http://localhost:4000
API docs (Swagger UI) at: http://localhost:4000/api/docs
Raw OpenAPI spec at: http://localhost:4000/api/openapi.json

## Seed Data

```bash
# Create a test user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"bashir","email":"bashir@test.com"}'

# Create a drop
curl -X POST http://localhost:4000/api/drops \
  -H "Content-Type: application/json" \
  -d '{"name":"Air Jordan 1","totalStock":5,"price":180,"startsAt":"2025-07-01T00:00:00Z"}'
```

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://high-traffic-inventory-frontend.vercel.app |
| **Backend API** | https://high-traffic-inventory-production.up.railway.app |
| **API Docs** | https://high-traffic-inventory-production.up.railway.app/api/docs |



## Architecture Decisions

### How 60-Second Expiration Works
Reservation expiry uses a **DB polling approach** (not in-memory setTimeout).
A background service runs every 5 seconds, querying `Reservation WHERE status='PENDING' AND expiresAt < NOW()`.
Found records are atomically marked EXPIRED and their stock is returned to the drop in a single Prisma transaction.
This approach survives server restarts and scales to multiple instances.

### How Overselling Is Prevented
All stock decrements use an atomic SQL UPDATE:
`UPDATE "Drop" SET stock = stock - 1 WHERE id = ? AND stock > 0 RETURNING id, stock`
If this returns 0 rows, the last item was already taken. The app returns HTTP 409 with code OUT_OF_STOCK.
This relies on PostgreSQL's row-level locking — no application mutex or Redis lock needed.

A partial unique index (`one_pending_per_user_drop`) further enforces that a user can only
hold one PENDING reservation per drop at a time.

### WebSocket Architecture
Socket.io is attached to the HTTP server (not Express). The `io` instance is injected into Express requests via middleware.
All events are server→client only. Clients connect on page load and receive live stock/purchase/expiry events.

## Running Tests Manually

```bash
# Concurrency test: fire many simultaneous reservations at a 1-stock drop
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:4000/api/reservations \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"<user-id>\",\"dropId\":\"<drop-id>\"}" &
done; wait
# Expect exactly one 201 and the rest 409 OUT_OF_STOCK
```
