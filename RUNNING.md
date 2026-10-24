# Running locally

Backend (terminal 1):
  cd backend
  python3 -m venv .venv && source .venv/bin/activate
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
  (local mode: reports in backend/local_data/sightings.json, photos in backend/local_data/uploads)

Frontend (terminal 2):
  cd frontend
  npm install
  npm run dev
  open http://localhost:5173/report   (Vite proxies /api and /uploads to localhost:8000)

Backend tests:  cd backend && python -m pytest -q

Supabase mode: run supabase/schema.sql, create a public bucket "dog-photos", then set DB_MODE=supabase,
STORAGE_MODE=supabase, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env (never in the frontend).
