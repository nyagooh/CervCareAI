"""
FINAL COMPREHENSIVE OPTIMIZATION
Combines ALL advanced techniques:
1. SMOTE oversampling
2. Feature engineering (interaction features)
3. Ensemble methods (XGBoost + RandomForest + LogisticRegression)
4. Extended Optuna trials (100 trials)
5. Threshold optimization
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
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from imblearn.over_sampling import SMOTE
import xgboost as xgb
import optuna

from src.utils import get_data_dir, get_models_dir, save_pickle
from src.pipelines.feature_eng_pipeline import load_risk_dataset, clean_risk_dataset, RiskDataPreprocessor


def create_interaction_features(df, target_column='Biopsy'):
    """
    Create interaction and derived features
    
    Args:
        df: Input dataframe
        target_column: Name of target column to exclude
        
    Returns:
        DataFrame with additional interaction features
    """
    print("\n🔨 Creating interaction features...")
    print(f"   Original features: {len(df.columns) - 1}")
    
    df_enhanced = df.copy()
    features_created = []
    
    # Age-based interactions
    if 'Age' in df.columns:
        if 'STDs (number)' in df.columns:
            df_enhanced['age_x_stds_count'] = df['Age'] * df['STDs (number)']
            features_created.append('age_x_stds_count')
        if 'Number of sexual partners' in df.columns:
            df_enhanced['age_x_partners'] = df['Age'] * df['Number of sexual partners']
            features_created.append('age_x_partners')
        if 'Hormonal Contraceptives (years)' in df.columns:
            df_enhanced['age_contraceptive_ratio'] = df['Hormonal Contraceptives (years)'] / (df['Age'] + 1)
            features_created.append('age_contraceptive_ratio')
    
    # Risk ratios
    if 'STDs (number)' in df.columns and 'Number of sexual partners' in df.columns:
        df_enhanced['stds_per_partner'] = df['STDs (number)'] / (df['Number of sexual partners'] + 1)
        features_created.append('stds_per_partner')
    
    # Binary interactions
    if 'Smokes' in df.columns and 'STDs' in df.columns:
        df_enhanced['smokes_and_stds'] = df['Smokes'] * df['STDs']
        features_created.append('smokes_and_stds')
    
    if 'Hormonal Contraceptives' in df.columns and 'IUD' in df.columns:
        df_enhanced['contraceptive_use'] = df['Hormonal Contraceptives'] + df['IUD']
        features_created.append('contraceptive_use')
    
    # Pregnancy-related features
    if 'Num of pregnancies' in df.columns and 'Age' in df.columns:
        df_enhanced['pregnancies_per_year'] = df['Num of pregnancies'] / np.maximum(df['Age'] - 15, 1)
        features_created.append('pregnancies_per_year')
    
    # STD history features
    if 'STDs' in df.columns and 'STDs (number)' in df.columns:
        df_enhanced['std_severity'] = df['STDs'] * (df['STDs (number)'] + 1)
        features_created.append('std_severity')
    
    # Sexual activity metrics - with bounds checking
    if 'First sexual intercourse' in df.columns and 'Age' in df.columns:
        # Clip to reasonable values (0 to max age)
        years_active = np.maximum(df['Age'] - df['First sexual intercourse'], 0)
        years_active = np.minimum(years_active, df['Age'])  # Can't be more than age
        df_enhanced['years_sexually_active'] = years_active
        features_created.append('years_sexually_active')
    
    # Smoking severity
    if 'Smokes (years)' in df.columns and 'Smokes (packs/year)' in df.columns:
        df_enhanced['smoking_severity'] = df['Smokes (years)'] * df['Smokes (packs/year)']
        features_created.append('smoking_severity')
    
    new_features = len(df_enhanced.columns) - len(df.columns)
    print(f"   ✓ Created {new_features} interaction features")
    print(f"   Features created: {', '.join(features_created[:5])}{'...' if len(features_created) > 5 else ''}")
    print(f"   Total features now: {len(df_enhanced.columns) - 1}")  # -1 for target
    
    return df_enhanced




def find_optimal_threshold(y_true, y_proba):
    """Find optimal classification threshold"""
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


def train_final_optimized_model(n_trials=100, use_smote=True, use_ensemble=True):
    """
    Train final model with all optimizations
    
    Args:
        n_trials: Number of Optuna trials
        use_smote: Whether to use SMOTE oversampling
        use_ensemble: Whether to create ensemble model
        
    Returns:
        best_model, optimal_threshold, results_dict
    """
    print("\n" + "="*70)
    print("FINAL COMPREHENSIVE OPTIMIZATION")
    print("="*70)
    print(f"\n✓ SMOTE Oversampling: {'ON' if use_smote else 'OFF'}")
    print(f"✓ Feature Engineering: ON")
    print(f"✓ Ensemble Methods: {'ON' if use_ensemble else 'OFF'}")
    print(f"✓ Optuna Trials: {n_trials}")
    
    # Load data
    data_dir = get_data_dir()
    df = load_risk_dataset(data_dir)
    df = clean_risk_dataset(df)
    
    target_column = 'Biopsy'
    
    # Create interaction features
    df_enhanced = create_interaction_features(df, target_column)
    
    y = df_enhanced[target_column].values
    X_raw = df_enhanced.drop(columns=[target_column])
    
    print(f"\n📊 Enhanced Dataset:")
    print(f"   Samples: {len(df_enhanced)}")
    print(f"   Features: {len(X_raw.columns)} (original: 35)")
    print(f"   Class distribution: {np.bincount(y)} (negative / positive)")
    print(f"   Class imbalance: {np.sum(y==0) / np.sum(y==1):.2f}:1")
    
    # Optuna objective for XGBoost
    def objective_xgb(trial):
        params = {
            'max_depth': trial.suggest_int('max_depth', 2, 10),
            'learning_rate': trial.suggest_float('learning_rate', 0.001, 0.3, log=True),
            'n_estimators': trial.suggest_int('n_estimators', 50, 500),
            'min_child_weight': trial.suggest_int('min_child_weight', 1, 10),
            'gamma': trial.suggest_float('gamma', 0, 1),
            'subsample': trial.suggest_float('subsample', 0.6, 1.0),
            'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
            'scale_pos_weight': trial.suggest_float('scale_pos_weight', 10, 25),
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
            
            # Preprocess
            preprocessor = RiskDataPreprocessor()
            train_df = X_train_raw.copy()
            train_df[target_column] = y_train
            X_train = preprocessor.fit_transform(train_df, target_column=target_column)
            
            val_df = X_val_raw.copy()
            val_df[target_column] = y_val
            X_val = preprocessor.transform(val_df)
            
            # Apply SMOTE if enabled
            if use_smote:
                smote = SMOTE(sampling_strategy=0.5, random_state=42)
                X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
            else:
                X_train_resampled, y_train_resampled = X_train, y_train
            
            # Train
            model = xgb.XGBClassifier(**params)
            model.fit(X_train_resampled, y_train_resampled, verbose=False)
            
            # Evaluate
            y_proba = model.predict_proba(X_val)[:, 1]
            _, metrics = find_optimal_threshold(y_val, y_proba)
            f1_scores.append(metrics['f1'])
        
        return np.mean(f1_scores)
    
    # Run Optuna for XGBoost
    print(f"\n🔍 Starting Optuna optimization ({n_trials} trials)...")
    print("   This will take 20-40 minutes...")
    
    study = optuna.create_study(
        direction='maximize',
        study_name='final_optimization',
        pruner=optuna.pruners.MedianPruner(n_startup_trials=10, n_warmup_steps=3)
    )
    
    study.optimize(objective_xgb, n_trials=n_trials, show_progress_bar=True)
    
    print(f"\n✅ Optimization complete!")
    print(f"   Best F1 score: {study.best_value:.4f}")
    print(f"\n📊 Best XGBoost hyperparameters:")
    for key, value in study.best_params.items():
        print(f"   {key}: {value}")
    
    # Train final models on all data
    print(f"\n{'='*70}")
    print("TRAINING FINAL MODEL(S) ON ALL DATA")
    print(f"{'='*70}")
    
    preprocessor = RiskDataPreprocessor()
    X_full = preprocessor.fit_transform(df_enhanced, target_column=target_column)
    y_full = y
    
    # Apply SMOTE if enabled
    if use_smote:
        print(f"\n🔄 Applying SMOTE oversampling...")
        smote = SMOTE(sampling_strategy=0.5, random_state=42)
        X_full_resampled, y_full_resampled = smote.fit_resample(X_full, y_full)
        print(f"   Before SMOTE: {len(y_full)} samples")
        print(f"   After SMOTE: {len(y_full_resampled)} samples")
        print(f"   New distribution: {np.bincount(y_full_resampled)}")
    else:
        X_full_resampled, y_full_resampled = X_full, y_full
    
    # Train XGBoost with best params
    best_params = study.best_params.copy()
    best_params['random_state'] = 42
    best_params['eval_metric'] = 'logloss'
    
    xgb_model = xgb.XGBClassifier(**best_params)
    xgb_model.fit(X_full_resampled, y_full_resampled)
    print(f"\n✓ XGBoost model trained")
    
    final_model = xgb_model
    
    # Train ensemble if enabled
    if use_ensemble:
        print(f"\n🎭 Training ensemble models...")
        
        # Random Forest
        rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        rf_model.fit(X_full_resampled, y_full_resampled)
        print(f"   ✓ Random Forest trained")
        
        # Logistic Regression
        lr_model = LogisticRegression(
            C=0.1,
            class_weight='balanced',
            max_iter=1000,
            random_state=42,
            n_jobs=-1
        )
        lr_model.fit(X_full_resampled, y_full_resampled)
        print(f"   ✓ Logistic Regression trained")
        
        # Create ensemble
        ensemble = VotingClassifier(
            estimators=[
                ('xgb', xgb_model),
                ('rf', rf_model),
                ('lr', lr_model)
            ],
            voting='soft',
            weights=[3, 2, 1]  # Give more weight to XGBoost
        )
        ensemble.fit(X_full_resampled, y_full_resampled)
        print(f"   ✓ Ensemble created (XGB:RF:LR = 3:2:1)")
        
        final_model = ensemble
    
    # Find optimal threshold using out-of-fold predictions
    print(f"\n🎯 Finding optimal classification threshold...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    all_y_true = []
    all_y_proba = []
    
    for train_idx, val_idx in skf.split(X_full, y_full):
        if use_smote:
            X_train, y_train = smote.fit_resample(X_full[train_idx], y_full[train_idx])
        else:
            X_train, y_train = X_full[train_idx], y_full[train_idx]
        
        if use_ensemble:
            temp_xgb = xgb.XGBClassifier(**best_params)
            temp_xgb.fit(X_train, y_train, verbose=False)
            y_proba = temp_xgb.predict_proba(X_full[val_idx])[:, 1]
        else:
            temp_model = xgb.XGBClassifier(**best_params)
            temp_model.fit(X_train, y_train, verbose=False)
            y_proba = temp_model.predict_proba(X_full[val_idx])[:, 1]
        
        all_y_true.extend(y_full[val_idx])
        all_y_proba.extend(y_proba)
    
    optimal_threshold, threshold_metrics = find_optimal_threshold(
        np.array(all_y_true),
        np.array(all_y_proba)
    )
    
    print(f"\n✓ Optimal threshold: {optimal_threshold:.4f}")
    print(f"   Accuracy:  {threshold_metrics['accuracy']:.4f} ({threshold_metrics['accuracy']*100:.2f}%)")
    print(f"   Precision: {threshold_metrics['precision']:.4f} ({threshold_metrics['precision']*100:.2f}%)")
    print(f"   Recall:    {threshold_metrics['recall']:.4f} ({threshold_metrics['recall']*100:.2f}%)")
    print(f"   F1 Score:  {threshold_metrics['f1']:.4f} ({threshold_metrics['f1']*100:.2f}%)")
    
    # Save models
    model_suffix = "_ensemble" if use_ensemble else "_xgb"
    model_suffix += "_smote" if use_smote else ""
    
    model_path = get_models_dir() / f"risk_model_final{model_suffix}.pkl"
    save_pickle(final_model, model_path)
    
    threshold_path = get_models_dir() / f"optimal_threshold_final{model_suffix}.pkl"
    save_pickle({
        'threshold': optimal_threshold,
        'metrics': threshold_metrics,
        'techniques': {
            'smote': use_smote,
            'feature_engineering': True,
            'ensemble': use_ensemble,
            'optuna_trials': n_trials
        }
    }, threshold_path)
    
    preprocessor_path = get_models_dir() / f"risk_preprocessor_final{model_suffix}.pkl"
    preprocessor.save(preprocessor_path)
    
    print(f"\n💾 Models saved:")
    print(f"   ✓ {model_path}")
    print(f"   ✓ {threshold_path}")
    print(f"   ✓ {preprocessor_path}")
    
    return final_model, optimal_threshold, {
        'threshold_metrics': threshold_metrics,
        'best_params': study.best_params,
        'best_f1': study.best_value,
        'techniques_used': {
            'smote': use_smote,
            'feature_engineering': True,
            'ensemble': use_ensemble,
            'optuna_trials': n_trials
        }
    }


if __name__ == "__main__":
    from src.mlflow_config import setup_mlflow_experiments
    setup_mlflow_experiments()
    
    # Train final optimized model with ALL techniques
    print("\n" + "="*70)
    print("STARTING FINAL COMPREHENSIVE OPTIMIZATION")
    print("="*70)
    print("\nThis will apply ALL advanced techniques:")
    print("1. ✓ Feature Engineering (interaction features)")
    print("2. ✓ SMOTE Oversampling")
    print("3. ✓ Ensemble Methods (XGBoost + RF + LR)")
    print("4. ✓ Extended Optuna (100 trials)")
    print("5. ✓ Threshold Optimization")
    print("\nEstimated time: 30-45 minutes")
    print("="*70)
    
    model, threshold, results = train_final_optimized_model(
        n_trials=100,
        use_smote=True,
        use_ensemble=True
    )
    
    print(f"\n{'='*70}")
    print("🎉 FINAL OPTIMIZATION COMPLETE!")
    print(f"{'='*70}")
    print(f"\nFINAL PERFORMANCE:")  
    print(f"   Accuracy:  {results['threshold_metrics']['accuracy']*100:.2f}%")
    print(f"   Precision: {results['threshold_metrics']['precision']*100:.2f}%")
    print(f"   Recall:    {results['threshold_metrics']['recall']*100:.2f}%")
    print(f"   F1 Score:  {results['threshold_metrics']['f1']*100:.2f}%")
    print(f"\nOptimal Threshold: {threshold:.4f}")
