"""
Quick setup script — generates dataset and trains the model.
Run this once before starting the backend.
"""
import subprocess
import sys
import os

BASE = os.path.dirname(os.path.abspath(__file__))

def run(cmd, cwd=None):
    print(f"\n>>> {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd or BASE)
    if result.returncode != 0:
        print(f"ERROR: Command failed with exit code {result.returncode}")
        sys.exit(1)

print("=" * 55)
print("  AgriSmart AI — Setup Script")
print("=" * 55)

print("\n[1/2] Generating dataset...")
run([sys.executable, "generate_dataset.py"], cwd=os.path.join(BASE, "dataset"))

print("\n[2/2] Training ML models...")
run([sys.executable, "train.py"], cwd=os.path.join(BASE, "model"))

print("\n" + "=" * 55)
print("  ✅ Setup complete!")
print("  Run backend: uvicorn backend.app:app --reload --port 8000")
print("  Run frontend: cd frontend && npm run dev")
print("=" * 55)
