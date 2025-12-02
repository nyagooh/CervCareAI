# CervCareAI ML Model - Quick Start Guide

## What Has Been Built

### ✅ Phase 1: Infrastructure (COMPLETE)
- **Requirements**: `requirements-prod.txt` with all ML/DL dependencies
- **MLflow Config**: `src/mlflow_config.py` for experiment tracking and model registry
- **Utils**: `src/utils.py` with helper functions for paths, data splits, serialization
- **Feature Engineering**: `src/pipelines/feature_eng_pipeline.py` with `RiskDataPreprocessor` and `ImagePreprocessor`
- **Training Pipeline**: `src/pipelines/training_pipeline.py` with `RiskModelTrainer`
- **Reference Repos**: Cloned to `reference/` for code adaptation

### 🔄 Phase 2: Risk Prediction Model (IN PROGRESS)
- Data loading and preprocessing: ✅ Complete
- Training pipeline with MLflow: ✅ Complete
- Ready to train: ⏳ Waiting for you to run

## Quick Start

### Step 1: Install Dependencies

```bash
cd ml_model

# Create virtual environment (recommended)
python -m venv venv
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements-prod.txt
```

### Step 2: Initialize MLflow

```bash
# Initialize MLflow experiments
python src/mlflow_config.py
```

You should see:
```
✓ Created experiment: risk-prediction (ID: ...)
✓ Created experiment: image-classification (ID: ...)
✓ MLflow experiments initialized successfully
```

### Step 3: Train Risk Prediction Model

```bash
# Train the XGBoost risk prediction model
python src/pipelines/training_pipeline.py
```

This will:
- Load the Kaggle risk dataset (858 patient records)
- Preprocess data (impute missing values, encode categoricals, scale features)
- Perform hyperparameter tuning with GridSearchCV
- Train XGBoost model
- Log everything to MLflow
- Save model to `models/risk_model.pkl`
- Target: >95% accuracy

**Expected Training Time:** 2-5 minutes on CPU

### Step 4: View Results in MLflow UI

```bash
# In a separate terminal
cd ml_model
mlflow ui
```

Then open: http://localhost:5000

You'll see:
- All metrics (accuracy, precision, recall, F1, ROC AUC)
- Hyperparameters used
- Feature importance plot
- Confusion matrix
- Registered model in Model Registry

## What's Next

### After Risk Model Training:
1. ✅ Review metrics in MLflow UI
2. ⏳ Build inference pipeline (`src/pipelines/inference_pipeline.py`)
3. ⏳ Create FastAPI endpoints (`src/api/main.py`)
4. ⏳ Test prediction with sample data

### When SIPaKMeD Download Completes:
1. Preprocess images (BMP → JPG, resize to 224x224)
2. Create train/val/test splits
3. Train image classification model (ResNet50/EfficientNet)
4. Add image classification endpoint to API

## Current Dataset Status

✅ **Kaggle Risk Dataset**: Ready (`cervcareai_data/raw/kaggle_risk/cervical-cancer_csv.csv`)
⏳ **SIPaKMeD**: Currently downloading (~800MB)
✅ **Dryad Kenya**: Available (`cervcareai_data/raw/dryad_kenya/Data.xlsx`)

## Project Structure

```
ml_model/
├── src/
│   ├── mlflow_config.py          # MLflow setup
│   ├── utils.py                  # Helper functions
│   ├── pipelines/
│   │   ├── feature_eng_pipeline.py    # Data preprocessing
│   │   ├── training_pipeline.py       # Model training
│   │   └── inference_pipeline.py      # TODO: Inference
│   └── api/                      # TODO: FastAPI backend
├── models/                       # Saved models (created after training)
├── logs/                         # Training logs and plots
├── mlruns/                       # MLflow tracking (created after init)
├── reference/                    # Cloned reference repos
│   ├── cervical_api/            # FastAPI reference
│   ├── risk_prediction/         # XGBoost reference
│   └── cervical_screening/      # Image classification reference
├── cervcareai_data/             # Datasets
└── requirements-prod.txt        # Python dependencies
```

## Troubleshooting

### If training fails with "No CSV files found":
Make sure you've run the data download script:
```bash
cd cervcareai_data
.\download_all_data.ps1  # or .sh on Linux
```

### If MLflow UI shows no experiments:
Run the initialization script:
```bash
python src/mlflow_config.py
```

### If you get import errors:
Make sure you're in the correct directory and dependencies are installed:
```bash
cd ml_model
pip install -r requirements-prod.txt
```

## Next Implementation Steps

1. **Inference Pipeline** - Load trained models and make predictions
2. **FastAPI Backend** - REST API with two endpoints:
   - `POST /api/v1/predict-risk` - Risk prediction from clinical data
   - `POST /api/v1/classify-image` - Image classification (after SIPaKMeD)
3. **Docker Setup** - Containerize ML backend + MLflow
4. **Frontend Integration** - Connect Next.js to ML API

## Questions?

Check the detailed implementation plan: `implementation_plan.md`
