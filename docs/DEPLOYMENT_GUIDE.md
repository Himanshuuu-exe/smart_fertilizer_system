# Deployment Guide — Smart Fertilizer Recommendation System

## Option 1: Local Development (Recommended for Testing)

### Prerequisites
- Python 3.11+
- Node.js 18+
- pip

### Step-by-Step

#### 1. Setup Python Environment
```bash
cd smart-fertilizer-system
pip install -r requirements.txt
```

#### 2. Generate Dataset & Train Model
```bash
# Generate dataset
cd dataset
python generate_dataset.py
cd ..

# Train ML models (takes ~2 minutes)
python model/train.py
```
This creates: `model/model.pkl`, `model/scaler.pkl`, `model/le_*.pkl`, `model/metrics.json`
And charts in: `assets/charts/`

#### 3. Start Backend
```bash
cd backend
uvicorn app:app --reload --port 8000
```
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### 4. Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
- App: http://localhost:3000

---

## Option 2: Docker Compose (Full Stack)

```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## Option 3: Deploy to Render (Free Hosting)

### Backend Deployment
1. Push project to GitHub
2. Go to render.com → New Web Service
3. Connect your GitHub repository
4. Settings:
   - **Build Command**: `pip install -r requirements.txt && cd dataset && python generate_dataset.py && cd .. && python model/train.py`
   - **Start Command**: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.11
5. Deploy!

### Frontend Deployment
1. In Render → New Static Site
2. Connect GitHub repository
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-name.onrender.com`
5. Deploy!

---

## Environment Variables

Copy `.env.example` to `.env` and update:
```env
# Backend
PORT=8000

# Frontend
VITE_API_URL=http://localhost:8000  # Change for production
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `model.pkl not found` | Run `python model/train.py` first |
| `uvicorn not found` | Run `pip install uvicorn` |
| CORS error | Check backend is running on port 8000 |
| `npm: command not found` | Install Node.js 18+ |
| Dataset not found | Run `python dataset/generate_dataset.py` |
| Port 8000 in use | Use `uvicorn app:app --port 8001` |
