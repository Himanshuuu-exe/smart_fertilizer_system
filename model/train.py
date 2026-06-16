"""
ML Training Script — Smart Fertilizer Recommendation System
Trains 5 models, selects best, saves model + encoders + metrics
"""
import os
import sys
import json
import warnings
import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report
)

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "..", "dataset", "fertilizer_data.csv")
ASSETS_DIR = os.path.join(BASE_DIR, "..", "assets", "charts")
MODEL_DIR = BASE_DIR

os.makedirs(ASSETS_DIR, exist_ok=True)

print("=" * 60)
print("  Smart Fertilizer Recommendation System — ML Training")
print("=" * 60)

# ── 1. Load Dataset ──────────────────────────────────────────
print("\n[1/7] Loading dataset...")
if not os.path.exists(DATASET_PATH):
    print("Dataset not found. Generating...")
    sys.path.insert(0, os.path.join(BASE_DIR, "..", "dataset"))
    import subprocess
    subprocess.run([sys.executable, os.path.join(BASE_DIR, "..", "dataset", "generate_dataset.py")],
                   cwd=os.path.join(BASE_DIR, "..", "dataset"))

df = pd.read_csv(DATASET_PATH)
print(f"  Loaded {len(df)} samples, {df.shape[1]} columns")
print(f"  Target classes: {df['Fertilizer Name'].nunique()}")

# ── 2. Preprocessing ─────────────────────────────────────────
print("\n[2/7] Preprocessing...")
df.dropna(inplace=True)
df.drop_duplicates(inplace=True)

le_soil = LabelEncoder()
le_crop = LabelEncoder()
le_fert = LabelEncoder()

df["Soil Type Enc"] = le_soil.fit_transform(df["Soil Type"])
df["Crop Type Enc"] = le_crop.fit_transform(df["Crop Type"])
df["Fertilizer Enc"] = le_fert.fit_transform(df["Fertilizer Name"])

FEATURES = ["Temperature", "Humidity", "Moisture", "Soil Type Enc",
            "Crop Type Enc", "Nitrogen", "Potassium", "Phosphorous"]
TARGET = "Fertilizer Enc"

X = df[FEATURES].values
y = df[TARGET].values

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)
print(f"  Train: {len(X_train)} | Test: {len(X_test)}")

# ── 3. Train Models ───────────────────────────────────────────
print("\n[3/7] Training models...")

models = {
    "Random Forest": RandomForestClassifier(n_estimators=150, random_state=42, n_jobs=-1),
    "Decision Tree": DecisionTreeClassifier(random_state=42, max_depth=15),
    "KNN": KNeighborsClassifier(n_neighbors=7),
    "SVM": SVC(kernel="rbf", C=10, probability=True, random_state=42),
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42)
}

results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cv = cross_val_score(model, X_scaled, y, cv=5, scoring="accuracy").mean()

    results[name] = {
        "accuracy": round(acc * 100, 2),
        "precision": round(prec * 100, 2),
        "recall": round(rec * 100, 2),
        "f1": round(f1 * 100, 2),
        "cv_accuracy": round(cv * 100, 2),
        "model": model
    }
    print(f"  {name:25s} Acc={acc*100:.2f}%  F1={f1*100:.2f}%  CV={cv*100:.2f}%")

# ── 4. Select Best Model ──────────────────────────────────────
print("\n[4/7] Selecting best model...")
best_name = max(results, key=lambda k: results[k]["accuracy"])
best = results[best_name]
print(f"  Best: {best_name} (Accuracy: {best['accuracy']}%)")

# ── 5. Save Model & Encoders ──────────────────────────────────
print("\n[5/7] Saving model & encoders...")
joblib.dump(best["model"], os.path.join(MODEL_DIR, "model.pkl"))
joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
joblib.dump(le_soil, os.path.join(MODEL_DIR, "le_soil.pkl"))
joblib.dump(le_crop, os.path.join(MODEL_DIR, "le_crop.pkl"))
joblib.dump(le_fert, os.path.join(MODEL_DIR, "le_fert.pkl"))

metrics_data = {
    "best_model": best_name,
    "accuracy": best["accuracy"],
    "precision": best["precision"],
    "recall": best["recall"],
    "f1": best["f1"],
    "cv_accuracy": best["cv_accuracy"],
    "all_models": {
        k: {m: v for m, v in v.items() if m != "model"}
        for k, v in results.items()
    },
    "classes": list(le_fert.classes_),
    "soil_types": list(le_soil.classes_),
    "crop_types": list(le_crop.classes_),
    "features": FEATURES
}
with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
    json.dump(metrics_data, f, indent=2)
print("  Saved: model.pkl, scaler.pkl, le_*.pkl, metrics.json")

# ── 6. Confusion Matrix ───────────────────────────────────────
print("\n[6/7] Generating confusion matrix...")
best_model = best["model"]
y_pred_best = best_model.predict(X_test)
cm = confusion_matrix(y_test, y_pred_best)
class_names = le_fert.classes_

plt.figure(figsize=(14, 10))
sns.heatmap(cm, annot=True, fmt="d", cmap="YlOrRd",
            xticklabels=class_names, yticklabels=class_names,
            linewidths=0.5)
plt.title(f"Confusion Matrix — {best_name}", fontsize=16, fontweight="bold", pad=20)
plt.ylabel("Actual", fontsize=12)
plt.xlabel("Predicted", fontsize=12)
plt.xticks(rotation=45, ha="right")
plt.yticks(rotation=0)
plt.tight_layout()
plt.savefig(os.path.join(ASSETS_DIR, "confusion_matrix.png"), dpi=150, bbox_inches="tight")
plt.close()

# ── 7. Charts ─────────────────────────────────────────────────
print("\n[7/7] Generating charts...")

# Chart 1: Model Accuracy Comparison
plt.figure(figsize=(12, 6))
model_names = list(results.keys())
accuracies = [results[m]["accuracy"] for m in model_names]
f1_scores = [results[m]["f1"] for m in model_names]
x = np.arange(len(model_names))
width = 0.35
bars1 = plt.bar(x - width/2, accuracies, width, label="Accuracy", color="#4CAF50", alpha=0.85)
bars2 = plt.bar(x + width/2, f1_scores, width, label="F1 Score", color="#2196F3", alpha=0.85)
plt.xlabel("Model", fontsize=12)
plt.ylabel("Score (%)", fontsize=12)
plt.title("Model Comparison — Accuracy vs F1 Score", fontsize=14, fontweight="bold")
plt.xticks(x, model_names, rotation=20, ha="right")
plt.ylim(0, 110)
plt.legend()
for bar in bars1:
    plt.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.5,
             f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=9)
for bar in bars2:
    plt.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.5,
             f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=9)
plt.tight_layout()
plt.savefig(os.path.join(ASSETS_DIR, "model_comparison.png"), dpi=150, bbox_inches="tight")
plt.close()

# Chart 2: Feature Importance (Random Forest)
rf = models["Random Forest"]
importances = rf.feature_importances_
feat_labels = ["Temperature", "Humidity", "Moisture", "Soil Type",
               "Crop Type", "Nitrogen", "Potassium", "Phosphorous"]
sorted_idx = np.argsort(importances)[::-1]
plt.figure(figsize=(10, 6))
colors = plt.cm.viridis(np.linspace(0.2, 0.8, len(feat_labels)))
bars = plt.bar(range(len(feat_labels)), importances[sorted_idx], color=colors, alpha=0.9)
plt.xticks(range(len(feat_labels)), [feat_labels[i] for i in sorted_idx], rotation=30, ha="right")
plt.xlabel("Feature", fontsize=12)
plt.ylabel("Importance Score", fontsize=12)
plt.title("Feature Importance — Random Forest", fontsize=14, fontweight="bold")
for bar, val in zip(bars, importances[sorted_idx]):
    plt.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.001,
             f'{val:.3f}', ha='center', va='bottom', fontsize=9)
plt.tight_layout()
plt.savefig(os.path.join(ASSETS_DIR, "feature_importance.png"), dpi=150, bbox_inches="tight")
plt.close()

# Chart 3: Correlation Heatmap
num_cols = ["Temperature", "Humidity", "Moisture", "Nitrogen", "Potassium", "Phosphorous"]
corr = df[num_cols].corr()
plt.figure(figsize=(9, 7))
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm",
            mask=mask, square=True, linewidths=0.5,
            cbar_kws={"shrink": 0.8})
plt.title("Feature Correlation Heatmap", fontsize=14, fontweight="bold", pad=15)
plt.tight_layout()
plt.savefig(os.path.join(ASSETS_DIR, "correlation_heatmap.png"), dpi=150, bbox_inches="tight")
plt.close()

# Chart 4: Fertilizer Distribution
plt.figure(figsize=(12, 6))
fert_counts = df["Fertilizer Name"].value_counts()
colors_bar = plt.cm.Set3(np.linspace(0, 1, len(fert_counts)))
bars = plt.bar(fert_counts.index, fert_counts.values, color=colors_bar, alpha=0.9, edgecolor="white")
plt.xlabel("Fertilizer", fontsize=12)
plt.ylabel("Count", fontsize=12)
plt.title("Fertilizer Distribution in Dataset", fontsize=14, fontweight="bold")
plt.xticks(rotation=30, ha="right")
for bar in bars:
    plt.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 5,
             str(int(bar.get_height())), ha='center', va='bottom', fontsize=9)
plt.tight_layout()
plt.savefig(os.path.join(ASSETS_DIR, "fertilizer_distribution.png"), dpi=150, bbox_inches="tight")
plt.close()

# Chart 5: Crop Type Distribution
plt.figure(figsize=(10, 6))
crop_counts = df["Crop Type"].value_counts()
wedge_props = dict(width=0.5, edgecolor='white', linewidth=2)
plt.pie(crop_counts.values, labels=crop_counts.index, autopct='%1.1f%%',
        colors=plt.cm.Pastel1(np.linspace(0, 1, len(crop_counts))),
        wedgeprops=wedge_props, startangle=90)
plt.title("Crop Type Distribution", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig(os.path.join(ASSETS_DIR, "crop_distribution.png"), dpi=150, bbox_inches="tight")
plt.close()

print("  Saved all charts to assets/charts/")

print("\n" + "=" * 60)
print(f"  Training Complete!")
print(f"  Best Model  : {best_name}")
print(f"  Accuracy    : {best['accuracy']}%")
print(f"  Precision   : {best['precision']}%")
print(f"  Recall      : {best['recall']}%")
print(f"  F1 Score    : {best['f1']}%")
print("=" * 60)
