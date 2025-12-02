"""
Two-Stage Training Approach: External Validation + Combined Training
Stage 1: Validate current model on Kenya dataset
Stage 2: Combine datasets and retrain for improved performance
"""

import numpy as np
import pandas as pd
from pathlib import Path
import pickle
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, classification_report
)
import matplotlib.pyplot as plt
import seaborn as sns

from src.utils import get_data_dir, get_models_dir
from src.pipelines.feature_eng_pipeline import RiskDataPreprocessor


def load_kenya_dataset():
    """Load Kenya dataset from Dryad"""
    data_dir = get_data_dir()
    kenya_path = data_dir / "raw" / "dryad_kenya" / "kenya_dataset.csv"
    
    if not kenya_path.exists():
        print(f"❌ Kenya dataset not found at: {kenya_path}")
        print("   Please ensure the dataset is downloaded")
        return None
    
    df = pd.read_csv(kenya_path)
    print(f"✓ Loaded Kenya dataset: {len(df)} samples")
    return df


def align_features(kenya_df, kaggle_feature_names):
    """
    Align Kenya dataset features with Kaggle dataset
    
    Args:
        kenya_df: Kenya dataset
        kaggle_feature_names: List of feature names from Kaggle dataset
        
    Returns:
        Aligned Kenya dataset or None if incompatible
    """
    kenya_features = set(kenya_df.columns)
    kaggle_features = set(kaggle_feature_names)
    
    missing_in_kenya = kaggle_features - kenya_features
    extra_in_kenya = kenya_features - kaggle_features
    
    print("\n📊 Feature Alignment Analysis:")
    print(f"   Kaggle features: {len(kaggle_features)}")
    print(f"   Kenya features: {len(kenya_features)}")
    print(f"   Common features: {len(kaggle_features & kenya_features)}")
    
    if missing_in_kenya:
        print(f"\n⚠️  Missing in Kenya ({len(missing_in_kenya)}): {list(missing_in_kenya)[:5]}...")
    
    if extra_in_kenya:
        print(f"   Extra in Kenya ({len(extra_in_kenya)}): {list(extra_in_kenya)[:5]}...")
    
    # Try to align features
    common_features = list(kaggle_features & kenya_features)
    
    if len(common_features) < len(kaggle_features) * 0.8:
        print(f"\n❌ Insufficient feature overlap ({len(common_features)}/{len(kaggle_features)})")
        print("   Cannot perform external validation")
        return None
    
    # Reorder Kenya features to match Kaggle
    try:
        aligned_df = kenya_df[kaggle_feature_names]
        print(f"\n✓ Successfully aligned features")
        return aligned_df
    except KeyError as e:
        print(f"\n⚠️  Feature alignment issue: {e}")
        # Fill missing features with 0 or median
        aligned_df = pd.DataFrame()
        for feat in kaggle_feature_names:
            if feat in kenya_df.columns:
                aligned_df[feat] = kenya_df[feat]
            else:
                aligned_df[feat] = 0  # or np.nan
                print(f"   Filled missing feature '{feat}' with 0")
        
        return aligned_df


def external_validation(model_path, preprocessor_path, threshold_path):
    """
    Stage 1: Validate current model on Kenya dataset
    
    Args:
        model_path: Path to trained model
        preprocessor_path: Path to preprocessor
        threshold_path: Path to optimal threshold
        
    Returns:
        Kenya test metrics
    """
    print("\n" + "="*70)
    print("STAGE 1: EXTERNAL VALIDATION ON KENYA DATASET")
    print("="*70)
    
    # Load model and preprocessor
    print("\n📦 Loading optimized model...")
    model = pickle.load(open(model_path, 'rb'))
    threshold_data = pickle.load(open(threshold_path, 'rb'))
    optimal_threshold = threshold_data['threshold']
    
    print(f"   Model: {model_path.name}")
    print(f"   Optimal threshold: {optimal_threshold:.4f}")
    
    # Load Kenya dataset
    kenya_df = load_kenya_dataset()
    if kenya_df is None:
        return None
    
    # Check for target column
    target_column = 'Biopsy'
    if target_column not in kenya_df.columns:
        print(f"\n⚠️  Looking for alternative target column...")
        possible_targets = ['Biopsy', 'target', 'label', 'diagnosis']
        for col in possible_targets:
            if col in kenya_df.columns:
                target_column = col
                print(f"   Found: '{target_column}'")
                break
        else:
            print(f"❌ No target column found in Kenya dataset")
            print(f"   Available columns: {kenya_df.columns.tolist()}")
            return None
    
    # Separate features and target
    y_kenya = kenya_df[target_column].values
    X_kenya_raw = kenya_df.drop(columns=[target_column])
    
    print(f"\n📊 Kenya Dataset:")
    print(f"   Total samples: {len(kenya_df)}")
    print(f"   Class distribution: {np.bincount(y_kenya)} (negative / positive)")
    print(f"   Class imbalance: {np.sum(y_kenya==0) / max(np.sum(y_kenya==1), 1):.2f}:1")
    
    # Load preprocessor and get expected features
    preprocessor = pickle.load(open(preprocessor_path, 'rb'))
    
    # Get feature names from preprocessor (if available)
    # Otherwise load from Kaggle dataset
    from src.pipelines.feature_eng_pipeline import load_risk_dataset, clean_risk_dataset
    kaggle_df = load_risk_dataset(get_data_dir())
    kaggle_df = clean_risk_dataset(kaggle_df)
    kaggle_feature_names = kaggle_df.drop(columns=[target_column]).columns.tolist()
    
    # Align features
    X_kenya_aligned = align_features(X_kenya_raw, kaggle_feature_names)
    if X_kenya_aligned is None:
        return None
    
    # Preprocess Kenya data
    print(f"\n🔧 Preprocessing Kenya data...")
    kenya_df_with_target = X_kenya_aligned.copy()
    kenya_df_with_target[target_column] = y_kenya
    
    try:
        X_kenya_processed = preprocessor.transform(kenya_df_with_target)
        print(f"   ✓ Preprocessing successful")
    except Exception as e:
        print(f"   ❌ Preprocessing failed: {e}")
        return None
    
    # Make predictions
    print(f"\n🎯 Making predictions on Kenya dataset...")
    y_proba_kenya = model.predict_proba(X_kenya_processed)[:, 1]
    
    # Use default threshold (0.5)
    y_pred_default = (y_proba_kenya >= 0.5).astype(int)
    
    # Use optimal threshold
    y_pred_optimal = (y_proba_kenya >= optimal_threshold).astype(int)
    
    # Calculate metrics with both thresholds
    print(f"\n📈 EXTERNAL VALIDATION RESULTS:")
    print(f"\n{'='*70}")
    print(f"WITH DEFAULT THRESHOLD (0.5):")
    print(f"{'='*70}")
    
    metrics_default = {
        'accuracy': accuracy_score(y_kenya, y_pred_default),
        'precision': precision_score(y_kenya, y_pred_default, zero_division=0),
        'recall': recall_score(y_kenya, y_pred_default, zero_division=0),
        'f1': f1_score(y_kenya, y_pred_default, zero_division=0),
        'roc_auc': roc_auc_score(y_kenya, y_proba_kenya) if len(np.unique(y_kenya)) > 1 else 0.0
    }
    
    for metric, value in metrics_default.items():
        print(f"   {metric.capitalize():12}: {value:.4f} ({value*100:.2f}%)")
    
    print(f"\n{'='*70}")
    print(f"WITH OPTIMAL THRESHOLD ({optimal_threshold:.4f}):")
    print(f"{'='*70}")
    
    metrics_optimal = {
        'accuracy': accuracy_score(y_kenya, y_pred_optimal),
        'precision': precision_score(y_kenya, y_pred_optimal, zero_division=0),
        'recall': recall_score(y_kenya, y_pred_optimal, zero_division=0),
        'f1': f1_score(y_kenya, y_pred_optimal, zero_division=0),
        'roc_auc': roc_auc_score(y_kenya, y_proba_kenya) if len(np.unique(y_kenya)) > 1 else 0.0
    }
    
    for metric, value in metrics_optimal.items():
        print(f"   {metric.capitalize():12}: {value:.4f} ({value*100:.2f}%)")
    
    # Compare with Kaggle (internal) performance
    print(f"\n📊 COMPARISON: Kaggle (Internal) vs Kenya (External)")
    print(f"{'='*70}")
    kaggle_metrics = threshold_data['metrics']
    
    print(f"   Metric      | Kaggle   | Kenya    | Difference")
    print(f"   ------------|----------|----------|------------")
    for metric in ['accuracy', 'precision', 'recall', 'f1']:
        kaggle_val = kaggle_metrics[metric]
        kenya_val = metrics_optimal[metric]
        diff = kenya_val - kaggle_val
        print(f"   {metric.capitalize():12}| {kaggle_val:.4f}   | {kenya_val:.4f}   | {diff:+.4f}")
    
    # Interpretation
    print(f"\n💡 INTERPRETATION:")
    avg_diff = np.mean([
        metrics_optimal['accuracy'] - kaggle_metrics['accuracy'],
        metrics_optimal['precision'] - kaggle_metrics['precision'],
        metrics_optimal['recall'] - kaggle_metrics['recall'],
        metrics_optimal['f1'] - kaggle_metrics['f1']
    ])
    
    if avg_diff > -0.05:
        print(f"   ✅ EXCELLENT: Model generalizes well to Kenya population!")
        print(f"   ✅ Performance drop < 5% - Ready for Kenya deployment")
    elif avg_diff > -0.10:
        print(f"   ✓ GOOD: Acceptable generalization (5-10% drop)")
        print(f"   ✓ Combining datasets will improve performance")
    elif avg_diff > -0.15:
        print(f"   ⚠️  MODERATE: Some distribution shift (10-15% drop)")
        print(f"   ⚠️  Should combine datasets and retrain")
    else:
        print(f"   ❌ SIGNIFICANT: Large distribution shift (>15% drop)")
        print(f"   ❌ Must combine datasets and retrain")
    
    # Confusion matrix
    print(f"\n📊 Confusion Matrix (Kenya Test Set):")
    cm = confusion_matrix(y_kenya, y_pred_optimal)
    print(cm)
    
    return {
        'default_threshold': metrics_default,
        'optimal_threshold': metrics_optimal,
        'kenya_size': len(kenya_df),
        'performance_drop': avg_diff
    }


if __name__ == "__main__":
    # Paths
    model_path = get_models_dir() / "risk_model_optuna.pkl"
    preprocessor_path = get_models_dir() / "risk_preprocessor.pkl"
    threshold_path = get_models_dir() / "optimal_threshold.pkl"
    
    # Run external validation
    result = external_validation(model_path, preprocessor_path, threshold_path)
    
    if result:
        print(f"\n{'='*70}")
        print("✅ STAGE 1 COMPLETE: External Validation Done")
        print(f"{'='*70}")
        print(f"\nNext: Run Stage 2 to combine datasets and retrain")
    else:
        print(f"\n❌ External validation could not be completed")
        print(f"   Check Kenya dataset availability and format")
