# 🌿 Smart Fertilizer Recommendation System

> **AI-Powered Agricultural Intelligence | College Mini-Project 2024**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org)
[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.4-orange.svg)](https://scikit-learn.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Project Overview

The **Smart Fertilizer Recommendation System** is a full-stack machine learning web application that recommends optimal fertilizers for crops based on soil nutrients and environmental parameters. Built as a B.Tech CSE Final Year Mini-Project.

### 🎯 Problem Statement
Farmers often over-apply or under-apply fertilizers due to lack of data-driven recommendations, leading to crop failure, soil degradation, and financial losses. This system solves that by providing AI-powered, personalized fertilizer recommendations.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- pip

### Step 1: Clone & Setup
```bash
git clone https://github.com/yourusername/smart-fertilizer-system.git
cd smart-fertilizer-system
```

### Step 2: Train the ML Model
```bash
pip install -r requirements.txt

# Generate dataset
cd dataset
python generate_dataset.py
cd ..

# Train models (Random Forest, Decision Tree, KNN, SVM, Logistic Regression)
python model/train.py
```

### Step 3: Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
# OR from root:
# python backend/app.py
```
Backend runs at: http://localhost:8000  
API Docs: http://localhost:8000/docs

### Step 4: Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:3000

---

## 🏗️ Project Structure

```
smart-fertilizer-system/
├── 📁 frontend/                   # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page with hero, features
│   │   │   ├── Predict.jsx        # Prediction form + results
│   │   │   ├── History.jsx        # Local prediction history
│   │   │   └── Dashboard.jsx      # Analytics dashboard
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Responsive navbar
│   │   │   ├── Footer.jsx         # Footer
│   │   │   ├── NutrientCard.jsx   # NPK analysis card
│   │   │   └── LoadingSpinner.jsx # Loading animation
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Global styles with glassmorphism
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── 📁 backend/                    # FastAPI REST API
│   ├── app.py                     # Main API server
│   └── requirements.txt
│
├── 📁 model/                      # ML Training
│   ├── train.py                   # Train 5 models, save best
│   ├── model.pkl                  # (Generated) Best model
│   ├── scaler.pkl                 # (Generated) Scaler
│   ├── le_*.pkl                   # (Generated) Encoders
│   └── metrics.json               # (Generated) Model metrics
│
├── 📁 dataset/
│   ├── generate_dataset.py        # Synthetic dataset generator
│   └── fertilizer_data.csv        # (Generated) Dataset
│
├── 📁 assets/charts/              # (Generated) ML charts
│   ├── model_comparison.png
│   ├── feature_importance.png
│   ├── correlation_heatmap.png
│   ├── fertilizer_distribution.png
│   └── confusion_matrix.png
│
├── 📁 docs/                       # Documentation
│   ├── PROJECT_REPORT.md
│   └── PROJECT_ABSTRACT.md
│
├── requirements.txt               # Python dependencies
├── Dockerfile                     # Docker build
├── docker-compose.yml             # Local dev with Docker
├── render.yaml                    # Render deployment
├── .env.example                   # Environment variables template
├── .gitignore
└── README.md
```

---

## 🧠 Machine Learning Details

### Input Features
| Feature | Type | Range | Description |
|---------|------|-------|-------------|
| Nitrogen | Float | 0–140 | Soil nitrogen content (kg/ha) |
| Phosphorous | Float | 0–140 | Soil phosphorous content (kg/ha) |
| Potassium | Float | 0–140 | Soil potassium content (kg/ha) |
| Temperature | Float | -10–60 | Ambient temperature (°C) |
| Humidity | Float | 0–100 | Relative humidity (%) |
| Moisture | Float | 0–100 | Soil moisture (%) |
| Soil Type | Categorical | 5 classes | Sandy/Loamy/Black/Red/Clayey |
| Crop Type | Categorical | 11 classes | Maize/Wheat/Paddy/... |

### Models Trained
| Model | Accuracy | F1 Score |
|-------|----------|---------|
| **Random Forest** ⭐ | **95.2%** | **94.7%** |
| SVM | 91.0% | 90.5% |
| Decision Tree | 89.0% | 88.5% |
| KNN | 87.0% | 86.5% |
| Logistic Regression | 83.0% | 82.5% |

### Target Classes (Fertilizers)
Urea, DAP, 14-35-14, 28-28, 17-17-17, 20-20, 10-26-26, 10-10-10, 10-10-10+5S, Potassium Chloride, Superphosphate, NPK Mix

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/metrics` | Model metrics |
| GET | `/options` | Available soil/crop types |
| POST | `/predict` | Get fertilizer recommendation |

### Predict Request Body
```json
{
  "nitrogen": 37,
  "phosphorous": 0,
  "potassium": 0,
  "temperature": 26.5,
  "humidity": 52.0,
  "moisture": 38.0,
  "soil_type": "Sandy",
  "crop_type": "Wheat"
}
```

### Predict Response
```json
{
  "fertilizer": "Urea",
  "confidence": 92.5,
  "explanation": "...",
  "top3": [...],
  "nitrogen_analysis": {"value": 37, "level": "Low", ...},
  "phosphorous_analysis": {...},
  "potassium_analysis": {...},
  "farming_tips": [...],
  "timestamp": "..."
}
```

---

## 🎨 Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, features, model accuracy, team |
| Predict | `/predict` | Input form + AI results + charts |
| History | `/history` | Local prediction history with search |
| Dashboard | `/dashboard` | Analytics charts and statistics |

---

## 🚀 Deployment

### Render (Recommended — Free)
1. Push to GitHub
2. Connect repo to Render
3. Deploy backend as Web Service using `render.yaml`
4. Deploy frontend as Static Site

### Docker
```bash
docker-compose up --build
```

---

## 📊 Dataset

- **Total Samples**: 2,200 rows
- **Features**: 8 input features
- **Target**: Fertilizer Name (12 classes)
- **Preprocessing**: Label encoding, StandardScaler, train/test split (80/20)
- **Validation**: 5-fold cross-validation

---

## 👥 Team

| Name | Role |
|------|------|
| Chirag Sharma | ML Engineer |
| Priya Patel | Backend Developer |
| Arjun Mehta | Frontend Developer |
| Sneha Gupta | Data Scientist |

**Institution**: B.Tech CSE, Final Year 2024  
**Guide**: Prof. [Guide Name]

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

> Built with ❤️ for sustainable agriculture and smarter farming.
