"""
Enhanced Training Pipeline with Threshold Optimization and Optuna
Improves precision, recall, and F1 scores
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple, List
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve,
    precision_recall_curve
)
from sklearn.model_selection import StratifiedKFold
import xgboost as xgb
import optuna

from src.utils import get_data_dir, get_models_dir, get_logs_dir, save_pickle
from src.mlflow_config import MLflowManager, MLFLOW_EXPERIMENT_RISK, MODEL_RISK_NAME
from src.pipelines.feature_eng_pipeline import load_risk_dataset, clean_risk_dataset, RiskDataPreprocessor


def find_optimal_threshold(y_true, y_proba):
    """
    Find optimal classification threshold using F1 score
    
    Args:
        y_true: True labels
        y_proba: Predicted probabilities
        
    Returns:
        optimal_threshold, metrics at that threshold
    """
    precisions, recalls, thresholds = precision_recall_curve(y_true, y_proba)
    
    # Calculate F1 scores for each threshold
    f1_scores = 2 * (precisions[:-1] * recalls[:-1]) / (precisions[:-1] + recalls[:-1] + 1e-10)
    
    # Find threshold with best F1
    best_idx = np.argmax(f1_scores)
    optimal_threshold = thresholds[best_idx]
    
    # Get metrics at optimal threshold
    y_pred_optimal = (y_proba >= optimal_threshold).astype(int)
    
    metrics = {
        'threshold': optimal_threshold,
        'precision': precision_score(y_true, y_pred_optimal, zero_division=0),
        'recall': recall_score(y_true, y_pred_optimal, zero_division=0),
        'f1': f1_score(y_true, y_pred_optimal, zero_division=0),
        'accuracy': accuracy_score(y_true, y_pred_optimal)
    }
    
    return optimal_threshold, metrics


def train_with_optuna(n_trials=100):
    """
    Train model using Optuna for hyperparameter optimization
    
    Args:
        n_trials: Number of Optuna trials
        
    Returns:
        best_model, best_threshold, cv_results
    """
    print("\n" + "="*70)
    print(f"OPTUNA HYPERPARAMETER OPTIMIZATION + THRESHOLD TUNING")
    print("="*70)
    
    # Load data
    data_dir = get_data_dir()
    df = load_risk_dataset(data_dir)
    df = clean_risk_dataset(df)
    
    target_column = 'Biopsy'
    y = df[target_column].values
    X_raw = df.drop(columns=[target_column])
    
    print(f"\n📊 Dataset: {len(df)} samples")
    print(f"   Class distribution: {np.bincount(y)} (negative / positive)")
    print(f"   Class imbalance: {np.sum(y==0) / np.sum(y==1):.2f}:1")
    
    # Create Optuna study
    def objective(trial):
        # Suggest hyperparameters with wider search space
        params = {
            'max_depth': trial.suggest_int('max_depth', 2, 10),
            'learning_rate': trial.suggest_float('learning_rate', 0.001, 0.3, log=True),
            'n_estimators': trial.suggest_int('n_estimators', 50, 500),
            'min_child_weight': trial.suggest_int('min_child_weight', 1, 10),
            'gamma': trial.suggest_float('gamma', 0, 1),
            'subsample': trial.suggest_float('subsample', 0.6, 1.0),
            'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
            'scale_pos_weight': trial.suggest_float('scale_pos_weight', 10, 20),
            'reg_alpha': trial.suggest_float('reg_alpha', 0, 1),
            'reg_lambda': trial.suggest_float('reg_lambda', 0, 1),
            'random_state': 42,
            'eval_metric': 'logloss'
        }
        
        # 5-fold cross-validation
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        f1_scores = []
        
        for train_idx, val_idx in skf.split(X_raw, y):
            # Split data
            X_train_raw = X_raw.iloc[train_idx]
            X_val_raw = X_raw.iloc[val_idx]
            y_train = y[train_idx]
            y_val = y[val_idx]
            
            # Preprocess
            preprocessor = RiskDataPreprocessor()
            train_df = X_train_raw.copy()
            train_df[target_column] = y_train
            X_train = preprocessor.fit_transform(train_df, target_column=target_column)
            
            val_df = X_val_raw.copy()
            val_df[target_column] = y_val
            X_val = preprocessor.transform(val_df)
            
            # Train model
            model = xgb.XGBClassifier(**params)
            model.fit(X_train, y_train, verbose=False)
            
            # Get probabilities and find optimal threshold
            y_proba = model.predict_proba(X_val)[:, 1]
            optimal_threshold, metrics = find_optimal_threshold(y_val, y_proba)
            
            f1_scores.append(metrics['f1'])
        
        return np.mean(f1_scores)
    
    # Run Optuna optimization
    print(f"\n🔍 Starting Optuna optimization ({n_trials} trials)...")
    print("   This may take 15-30 minutes...")
    
    study = optuna.create_study(
        direction='maximize',
        study_name='risk_model_optuna',
        pruner=optuna.pruners.MedianPruner(n_startup_trials=5, n_warmup_steps=2)
    )
    
    study.optimize(objective, n_trials=n_trials, show_progress_bar=True)
    
    # Print results
    print(f"\n✅ Optimization complete!")
    print(f"   Best F1 score: {study.best_value:.4f}")
    print(f"\n📊 Best hyperparameters:")
    for key, value in study.best_params.items():
        print(f"   {key}: {value}")
    
    # Train final model with best parameters on all data
    print(f"\n{'='*70}")
    print("TRAINING FINAL MODEL WITH BEST PARAMETERS")
    print(f"{'='*70}")
    
    preprocessor = RiskDataPreprocessor()
    X_full = preprocessor.fit_transform(df, target_column=target_column)
    y_full = y
    
    best_params = study.best_params.copy()
    best_params['random_state'] = 42
    best_params['eval_metric'] = 'logloss'
    
    final_model = xgb.XGBClassifier(**best_params)
    final_model.fit(X_full, y_full)
    
    # Find optimal threshold on full dataset (using out-of-fold predictions)
    print(f"\n🎯 Finding optimal classification threshold...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    all_y_true = []
    all_y_proba = []
    
    for train_idx, val_idx in skf.split(X_full, y_full):
        temp_model = xgb.XGBClassifier(**best_params)
        temp_model.fit(X_full[train_idx], y_full[train_idx], verbose=False)
        y_proba = temp_model.predict_proba(X_full[val_idx])[:, 1]
        all_y_true.extend(y_full[val_idx])
        all_y_proba.extend(y_proba)
    
    optimal_threshold, threshold_metrics = find_optimal_threshold(
        np.array(all_y_true), 
        np.array(all_y_proba)
    )
    
    print(f"\n✓ Optimal threshold: {optimal_threshold:.4f} (default: 0.5000)")
    print(f"   Precision: {threshold_metrics['precision']:.4f}")
    print(f"   Recall:    {threshold_metrics['recall']:.4f}")
    print(f"   F1 Score:  {threshold_metrics['f1']:.4f}")
    print(f"   Accuracy:  {threshold_metrics['accuracy']:.4f}")
    
    # Save model and threshold
    model_path = get_models_dir() / "risk_model_optuna.pkl"
    save_pickle(final_model, model_path)
    
    threshold_path = get_models_dir() / "optimal_threshold.pkl"
    save_pickle({'threshold': optimal_threshold, 'metrics': threshold_metrics}, threshold_path)
    
    preprocessor_path = get_models_dir() / "risk_preprocessor.pkl"
    preprocessor.save(preprocessor_path)
    
    print(f"\n✓ Model saved: {model_path}")
    print(f"✓ Threshold saved: {threshold_path}")
    print(f"✓ Preprocessor saved: {preprocessor_path}")
    
    return final_model, optimal_threshold, study


if __name__ == "__main__":
    from src.mlflow_config import setup_mlflow_experiments
    setup_mlflow_experiments()
    
    # Train with Optuna (50 trials for faster results, increase to 100-200 for best performance)
    model, threshold, study = train_with_optuna(n_trials=50)
    
    print(f"\n{'='*70}")
    print("🎉 TRAINING COMPLETE WITH IMPROVEMENTS!")
    print(f"{'='*70}")
    print(f"\nTo use the model with optimal threshold:")
    print(f"  y_proba = model.predict_proba(X)[:, 1]")
    print(f"  y_pred = (y_proba >= {threshold:.4f}).astype(int)")
