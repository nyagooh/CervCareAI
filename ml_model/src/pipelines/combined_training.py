"""
Stage 2: Combined Dataset Training with Optuna
Combines Kaggle + Kenya datasets for improved model performance
"""

import numpy as np
import pandas as pd
from pathlib import Path
import pickle
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, precision_recall_curve
)
import xgboost as xgb
import optuna

from src.utils import get_data_dir, get_models_dir, save_pickle
from src.pipelines.feature_eng_pipeline import load_risk_dataset, clean_risk_dataset, RiskDataPreprocessor


def find_optimal_threshold(y_true, y_proba):
    """Find optimal classification threshold using F1 score"""
    precisions, recalls, thresholds = precision_recall_curve(y_true, y_proba)
    f1_scores = 2 * (precisions[:-1] * recalls[:-1]) / (precisions[:-1] + recalls[:-1] + 1e-10)
    best_idx = np.argmax(f1_scores)
    optimal_threshold = thresholds[best_idx]
    
    y_pred_optimal = (y_proba >= optimal_threshold).astype(int)
    metrics = {
        'threshold': optimal_threshold,
        'precision': precision_score(y_true, y_pred_optimal, zero_division=0),
        'recall': recall_score(y_true, y_pred_optimal, zero_division=0),
        'f1': f1_score(y_true, y_pred_optimal, zero_division=0),
        'accuracy': accuracy_score(y_true, y_pred_optimal)
    }
    
    return optimal_threshold, metrics


def load_and_combine_datasets():
    """
    Load and combine Kaggle and Kenya datasets
    
    Returns:
        Combined DataFrame or None if Kenya data not available
    """
    print("\n" + "="*70)   
    print("LOADING AND COMBINING DATASETS")
    print("="*70)
    
    # Load Kaggle dataset
    data_dir = get_data_dir()
    kaggle_df = load_risk_dataset(data_dir)
    kaggle_df = clean_risk_dataset(kaggle_df)
    kaggle_df['source'] = 'kaggle'
    
    print(f"\n✓ Kaggle dataset: {len(kaggle_df)} samples")
    print(f"   Features: {len(kaggle_df.columns) - 2}")  # -2 for target and source
    
    # Try to load Kenya dataset
    kenya_path = data_dir / "raw" / "dryad_kenya" / "kenya_dataset.csv"
    
    if not kenya_path.exists():
        print(f"\n⚠️  Kenya dataset not found at: {kenya_path}")
        print(f"   Proceeding with Kaggle data only")
        return kaggle_df
    
    try:
        kenya_df = pd.read_csv(kenya_path)
        print(f"✓ Kenya dataset: {len(kenya_df)} samples")
        
        # Align features
        target_col = 'Biopsy'
        if target_col not in kenya_df.columns:
            # Try to find target column
            for col in ['Biopsy', 'target', 'label', 'diagnosis']:
                if col in kenya_df.columns:
                    kenya_df = kenya_df.rename(columns={col: target_col})
                    break
        
        # Get common features
        kaggle_features = set(kaggle_df.columns) - {'source'}
        kenya_features = set(kenya_df.columns)
        common_features = list(kaggle_features & kenya_features)
        
        print(f"   Common features: {len(common_features)}")
        
        if len(common_features) < len(kaggle_features) * 0.8:
            print(f"   ⚠️  Insufficient overlap, using Kaggle only")
            return kaggle_df
        
        # Align Kenya dataframe
        kenya_aligned = kenya_df[common_features].copy()
        kenya_aligned['source'] = 'kenya'
        
        # Fill missing features in Kenya with 0
        for feat in kaggle_df.columns:
            if feat not in kenya_aligned.columns and feat != 'source':
                kenya_aligned[feat] = 0
        
        # Combine datasets
        combined_df = pd.concat([kaggle_df, kenya_aligned], ignore_index=True)
        
        print(f"\n✓ Combined dataset: {len(combined_df)} samples")
        print(f"   Kaggle: {len(kaggle_df)} ({len(kaggle_df)/len(combined_df)*100:.1f}%)")
        print(f"   Kenya:  {len(kenya_aligned)} ({len(kenya_aligned)/len(combined_df)*100:.1f}%)")
        
        target_col = 'Biopsy'
        if target_col in combined_df.columns:
            print(f"\n   Overall class distribution: {np.bincount(combined_df[target_col].values)}")
        
        return combined_df
        
    except Exception as e:
        print(f"\n❌ Error loading Kenya dataset: {e}")
        print(f"   Proceeding with Kaggle data only")
        return kaggle_df


def train_combined_model(n_trials=50):
    """
    Train model with Optuna on combined dataset
    
    Args:
        n_trials: Number of Optuna trials
        
    Returns:
        Final model, optimal threshold, study
    """
    print("\n" + "="*70)
    print("STAGE 2: TRAINING ON COMBINED DATASET")
    print("="*70)
    
    # Load and combine datasets
    df = load_and_combine_datasets()
    
    target_column = 'Biopsy'
    y = df[target_column].values
    X_raw = df.drop(columns=[target_column, 'source'])
    
    print(f"\n📊 Training Dataset:")
    print(f"   Total samples: {len(df)}")
    print(f"   Features: {len(X_raw.columns)}")
    print(f"   Class distribution: {np.bincount(y)} (negative / positive)")
    print(f"   Class imbalance: {np.sum(y==0) / np.sum(y==1):.2f}:1")
    
    # Optuna objective function
    def objective(trial):
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
        
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        f1_scores = []
        
        for train_idx, val_idx in skf.split(X_raw, y):
            X_train_raw = X_raw.iloc[train_idx]
            X_val_raw = X_raw.iloc[val_idx]
            y_train = y[train_idx]
            y_val = y[val_idx]
            
            preprocessor = RiskDataPreprocessor()
            train_df = X_train_raw.copy()
            train_df[target_column] = y_train
            X_train = preprocessor.fit_transform(train_df, target_column=target_column)
            
            val_df = X_val_raw.copy()
            val_df[target_column] = y_val
            X_val = preprocessor.transform(val_df)
            
            model = xgb.XGBClassifier(**params)
            model.fit(X_train, y_train, verbose=False)
            
            y_proba = model.predict_proba(X_val)[:, 1]
            optimal_threshold, metrics = find_optimal_threshold(y_val, y_proba)
            f1_scores.append(metrics['f1'])
        
        return np.mean(f1_scores)
    
    # Run Optuna
    print(f"\n🔍 Starting Optuna optimization ({n_trials} trials)...")
    print("   This will take 10-20 minutes for combined dataset...")
    
    study = optuna.create_study(
        direction='maximize',
        study_name='combined_dataset_optuna',
        pruner=optuna.pruners.MedianPruner(n_startup_trials=5, n_warmup_steps=2)
    )
    
    study.optimize(objective, n_trials=n_trials, show_progress_bar=True)
    
    print(f"\n✅ Optimization complete!")
    print(f"   Best F1 score: {study.best_value:.4f}")
    print(f"\n📊 Best hyperparameters:")
    for key, value in study.best_params.items():
        print(f"   {key}: {value}")
    
    # Train final model on all data
    print(f"\n{'='*70}")
    print("TRAINING FINAL MODEL ON ALL COMBINED DATA")
    print(f"{'='*70}")
    
    preprocessor = RiskDataPreprocessor()
    X_full = preprocessor.fit_transform(df, target_column=target_column)
    y_full = y
    
    best_params = study.best_params.copy()
    best_params['random_state'] = 42
    best_params['eval_metric'] = 'logloss'
    
    final_model = xgb.XGBClassifier(**best_params)
    final_model.fit(X_full, y_full)
    
    # Find optimal threshold
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
    
    print(f"\n✓ Optimal threshold: {optimal_threshold:.4f}")
    print(f"   Precision: {threshold_metrics['precision']:.4f}")
    print(f"   Recall:    {threshold_metrics['recall']:.4f}")
    print(f"   F1 Score:  {threshold_metrics['f1']:.4f}")
    print(f"   Accuracy:  {threshold_metrics['accuracy']:.4f}")
    
    # Save models
    model_path = get_models_dir() / "risk_model_combined.pkl"
    save_pickle(final_model, model_path)
    
    threshold_path = get_models_dir() / "optimal_threshold_combined.pkl"
    save_pickle({'threshold': optimal_threshold, 'metrics': threshold_metrics}, threshold_path)
    
    preprocessor_path = get_models_dir() / "risk_preprocessor_combined.pkl"
    preprocessor.save(preprocessor_path)
    
    print(f"\n✓ Model saved: {model_path}")
    print(f"✓ Threshold saved: {threshold_path}")
    print(f"✓ Preprocessor saved: {preprocessor_path}")
    
    return final_model, optimal_threshold, study


if __name__ == "__main__":
    from src.mlflow_config import setup_mlflow_experiments
    setup_mlflow_experiments()
    
    # Train on combined dataset
    model, threshold, study = train_combined_model(n_trials=50)
    
    print(f"\n{'='*70}")
    print("🎉 STAGE 2 COMPLETE: Combined Model Training Done!")
    print(f"{'='*70}")
    print(f"\nUse combined model with threshold: {threshold:.4f}")
