"""
Training Pipeline for CervCareAI ML Models
Handles training for both risk prediction and image classification
Uses Stratified K-Fold Cross-Validation for reliable metrics
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple, List
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve
)
from sklearn.model_selection import GridSearchCV, StratifiedKFold
import xgboost as xgb

from src.utils import (
    get_data_dir, get_models_dir, get_logs_dir,
    create_train_val_test_split, print_data_split_info,
    save_pickle
)
from src.mlflow_config import MLflowManager, MLFLOW_EXPERIMENT_RISK, MODEL_RISK_NAME
from src.pipelines.feature_eng_pipeline import (
    load_risk_dataset, clean_risk_dataset, RiskDataPreprocessor
)


class RiskModelTrainer:
    """Trainer for cervical cancer risk prediction model"""
    
    def __init__(self, experiment_name: str = MLFLOW_EXPERIMENT_RISK):
        """
        Initialize risk model trainer
        
        Args:
            experiment_name: MLflow experiment name
        """
        self.experiment_name = experiment_name
        self.mlflow = MLflowManager()
        self.model = None
        self.preprocessor = None
        self.best_params = None
        
    def load_and_prepare_data(
        self,
        target_column: str = 'Biopsy'
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Load and prepare data for training
        CRITICAL: Splits RAW data FIRST to prevent data leakage
        
        Args:
            target_column: Name of target column
            
        Returns:
            X_train, X_val, X_test, y_train, y_val, y_test
        """
        print("\n" + "="*70)
        print("LOADING AND PREPARING RISK PREDICTION DATA (NO LEAKAGE)")
        print("="*70)
        
        # Load dataset
        data_dir = get_data_dir()
        df = load_risk_dataset(data_dir)
        df = clean_risk_dataset(df)
        
        # Separate features and target from RAW data
        y = df[target_column].values
        X_raw = df.drop(columns=[target_column])
        
        print(f"\n📊 Dataset: {len(df)} samples, {len(X_raw.columns)} features")
        print(f"   Target distribution: {np.bincount(y)} (class 0 / class 1)")
        
        # STEP 1: Split RAW data FIRST (critical for preventing leakage)
        from sklearn.model_selection import train_test_split
        
        # First split: train vs (val + test)
        X_train_raw, X_temp_raw, y_train, y_temp = train_test_split(
            X_raw, y,
            test_size=0.30,
            random_state=42,
            stratify=y
        )
        
        # Second split: val vs test
        X_val_raw, X_test_raw, y_val, y_test = train_test_split(
            X_temp_raw, y_temp,
            test_size=0.50,
            random_state=42,
            stratify=y_temp
        )
        
        print(f"\n✓ Split RAW data (stratified):")
        print(f"   Train: {len(X_train_raw)} ({len(X_train_raw)/len(df)*100:.1f}%)")
        print(f"   Val:   {len(X_val_raw)} ({len(X_val_raw)/len(df)*100:.1f}%)")
        print(f"   Test:  {len(X_test_raw)} ({len(X_test_raw)/len(df)*100:.1f}%)")
        
        # STEP 2: Initialize and FIT preprocessor ONLY on training data
        print(f"\n🔧 Fitting preprocessor on TRAINING data only...")
        self.preprocessor = RiskDataPreprocessor()
        
        # Create temp DataFrame for training with target for preprocessor compatibility
        train_df = X_train_raw.copy()
        train_df[target_column] = y_train
        
        # Fit and transform training data
        X_train = self.preprocessor.fit_transform(train_df, target_column=target_column)
        
        # STEP 3: TRANSFORM (not fit_transform!) validation and test using training statistics
        print(f"   Transforming validation data using training statistics...")
        val_df = X_val_raw.copy()
        val_df[target_column] = y_val
        X_val = self.preprocessor.transform(val_df)
        
        print(f"   Transforming test data using training statistics...")
        test_df = X_test_raw.copy()
        test_df[target_column] = y_test
        X_test = self.preprocessor.transform(test_df)
        
        print(f"\n✅ Preprocessing complete (no data leakage)")
        print(f"   Feature dimension: {X_train.shape[1]}")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        hyperparameter_tuning: bool = True
    ) -> xgb.XGBClassifier:
        """
        Train XGBoost risk prediction model
        
        Args:
            X_train: Training features
            y_train: Training labels
            X_val: Validation features
            y_val: Validation labels
            hyperparameter_tuning: Whether to perform hyperparameter tuning
            
        Returns:
            Trained model
        """
        print("\n" + "="*70)
        print("TRAINING RISK PREDICTION MODEL")
        print("="*70)
        
        # Start MLflow run
        with self.mlflow.start_run(self.experiment_name, run_name="xgboost_risk_model"):
            
            if hyperparameter_tuning:
                print("\n🔎 Performing hyperparameter tuning...")
                print("   Optimizing for RECALL (minimize false negatives for cancer detection)")
                
                # Calculate class imbalance ratio
                neg_count = np.sum(y_train == 0)
                pos_count = np.sum(y_train == 1)
                scale_pos_weight_ratio = neg_count / pos_count
                print(f"   Class imbalance: {neg_count} negatives / {pos_count} positives")
                print(f"   scale_pos_weight ratio: {scale_pos_weight_ratio:.2f}")
                
                # Parameter grid with scale_pos_weight for class imbalance
                param_grid = {
                    'max_depth': [3, 6, 9],
                    'learning_rate': [0.01, 0.1, 0.3],
                    'n_estimators': [50, 100, 200],
                    'subsample': [0.8, 1.0],
                    'colsample_bytree': [0.8, 1.0],
                    'scale_pos_weight': [1, scale_pos_weight_ratio, scale_pos_weight_ratio * 1.5],  # Handle imbalance
                }
                
                # Base model
                base_model = xgb.XGBClassifier(
                    random_state=42,
                    eval_metric='logloss'
                )
                
                # Grid search - optimize for RECALL to minimize missing cancer cases
                grid_search = GridSearchCV(
                    base_model,
                    param_grid,
                    cv=5,
                    scoring='recall',  # Prioritize recall over accuracy for cancer detection
                    n_jobs=-1,
                    verbose=1
                )
                
                grid_search.fit(X_train, y_train)
                
                # Get best model and params
                self.model = grid_search.best_estimator_
                self.best_params = grid_search.best_params_
                
                print(f"\n✓ Best parameters: {self.best_params}")
                
                # Log parameters
                self.mlflow.log_params(self.best_params)
                self.mlflow.log_params({
                    'model_type': 'XGBoost',
                    'hyperparameter_tuning': True,
                    'cv_folds': 5
                })
                
            else:
                # Use default parameters
                self.model = xgb.XGBClassifier(
                    max_depth=6,
                    learning_rate=0.1,
                    n_estimators=100,
                    subsample=0.8,
                    colsample_bytree=0.8,
                    random_state=42,
                    eval_metric='logloss'
                )
                
                self.model.fit(X_train, y_train)
                
                # Log parameters
                self.mlflow.log_params(self.model.get_params())
            
            # Evaluate on training and validation sets
            train_metrics = self.evaluate(X_train, y_train, "Training")
            val_metrics = self.evaluate(X_val, y_val, "Validation")
            
            # Log metrics to MLflow
            for key, value in train_metrics.items():
                self.mlflow.log_metric(f"train_{key}", value)
            
            for key, value in val_metrics.items():
                self.mlflow.log_metric(f"val_{key}", value)
            
            # Plot and log feature importance
            self._plot_feature_importance()
            
            # Plot and log confusion matrix
            self._plot_confusion_matrix(X_val, y_val, "Validation Set")
            
            # Save model locally
            model_path = get_models_dir() / "risk_model.pkl"
            save_pickle(self.model, model_path)
            
            # Save preprocessor
            preprocessor_path = get_models_dir() / "risk_preprocessor.pkl"
            self.preprocessor.save(preprocessor_path)
            
            # Log model to MLflow
            self.mlflow.log_model(
                self.model,
                "model",
                registered_model_name=MODEL_RISK_NAME
            )
            
            # Log artifacts
            self.mlflow.log_artifact(str(model_path))
            self.mlflow.log_artifact(str(preprocessor_path))
            
            print(f"\n✓ Model training complete!")
            print(f"  Model saved to: {model_path}")
            print(f"  Registered in MLflow as: {MODEL_RISK_NAME}")
        
        return self.model
    
    def evaluate(
        self,
        X: np.ndarray,
        y: np.ndarray,
        dataset_name: str = "Test"
    ) -> Dict[str, float]:
        """
        Evaluate model performance
        
        Args:
            X: Features
            y: True labels
            dataset_name: Name of dataset for logging
            
        Returns:
            Dictionary of metrics
        """
        y_pred = self.model.predict(X)
        y_pred_proba = self.model.predict_proba(X)[:, 1]
        
        metrics = {
            'accuracy': accuracy_score(y, y_pred),
            'precision': precision_score(y, y_pred, zero_division=0),
            'recall': recall_score(y, y_pred, zero_division=0),
            'f1': f1_score(y, y_pred, zero_division=0),
            'roc_auc': roc_auc_score(y, y_pred_proba) if len(np.unique(y)) > 1 else 0.0
        }
        
        print(f"\n{dataset_name} Metrics:")
        print(f"  Accuracy:  {metrics['accuracy']:.4f}")
        print(f"  Precision: {metrics['precision']:.4f}")
        print(f"  Recall:    {metrics['recall']:.4f}")
        print(f"  F1 Score:  {metrics['f1']:.4f}")
        print(f"  ROC AUC:   {metrics['roc_auc']:.4f}")
        
        return metrics
    
    def _plot_feature_importance(self):
        """Plot and log feature importance"""
        if self.preprocessor is None or self.preprocessor.feature_names is None:
            return
        
        importance = self.model.feature_importances_
        feature_names = self.preprocessor.feature_names
        
        # Create dataframe for plotting
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False).head(20)
        
        # Plot
        plt.figure(figsize=(10, 8))
        sns.barplot(data=importance_df, y='feature', x='importance')
        plt.title('Top 20 Feature Importances')
        plt.xlabel('Importance')
        plt.ylabel('Feature')
        plt.tight_layout()
        
        # Save and log
        plot_path = get_logs_dir() / "risk_feature_importance.png"
        plt.savefig(plot_path, dpi=150)
        self.mlflow.log_artifact(str(plot_path))
        plt.close()
        
        print(f"\n✓ Feature importance plot saved and logged")
    
    def _plot_confusion_matrix(self, X: np.ndarray, y: np.ndarray, title: str):
        """Plot and log confusion matrix"""
        y_pred = self.model.predict(X)
        cm = confusion_matrix(y, y_pred)
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title(f'Confusion Matrix - {title}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        
        # Save and log
        plot_path = get_logs_dir() / f"risk_confusion_matrix_{title.lower().replace(' ', '_')}.png"
        plt.savefig(plot_path, dpi=150)
        self.mlflow.log_artifact(str(plot_path))
        plt.close()
        
        print(f"✓ Confusion matrix saved and logged")


def train_risk_model_cv(n_folds: int = 5):
    """
    Train risk prediction model with Stratified K-Fold Cross-Validation
    
    Args:
        n_folds: Number of folds for cross-validation
        
    Returns:
        Final model trained on all data, trainer instance, CV results
    """
    print("\n" + "="*70)
    print(f"STRATIFIED {n_folds}-FOLD CROSS-VALIDATION")
    print("="*70)
    print("This provides more reliable metrics for small datasets")
    
    trainer = RiskModelTrainer()
    
    # Load raw data (no splitting yet)
    data_dir = get_data_dir()
    from src.pipelines.feature_eng_pipeline import load_risk_dataset, clean_risk_dataset
    df = load_risk_dataset(data_dir)
    df = clean_risk_dataset(df)
    
    target_column = 'Biopsy'
    y = df[target_column].values
    X_raw = df.drop(columns=[target_column])
    
    print(f"\n📊 Full Dataset: {len(df)} samples, {len(X_raw.columns)} features")
    print(f"   Target distribution: {np.bincount(y)} (class 0 / class 1)")
    print(f"   Class imbalance ratio: {np.sum(y==0) / np.sum(y==1):.2f}:1")
    
    # Initialize stratified k-fold
    skf = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=42)
    
    # Storage for CV results
    cv_results = {
        'accuracy': [],
        'precision': [],
        'recall': [],
        'f1': [],
        'roc_auc': []
    }
    
    fold_models = []
    
    # Start MLflow run for CV
    with trainer.mlflow.start_run(trainer.experiment_name, run_name=f"xgboost_cv_{n_folds}fold"):
        
        # Perform cross-validation
        for fold, (train_idx, test_idx) in enumerate(skf.split(X_raw, y), 1):
            print(f"\n{'='*70}")
            print(f"FOLD {fold}/{n_folds}")
            print(f"{'='*70}")
            
            # Split data for this fold
            X_train_raw = X_raw.iloc[train_idx]
            X_test_raw = X_raw.iloc[test_idx]
            y_train = y[train_idx]
            y_test = y[test_idx]
            
            print(f"   Train: {len(train_idx)} samples ({np.sum(y_train==1)} positive)")
            print(f"   Test:  {len(test_idx)} samples ({np.sum(y_test==1)} positive)")
            
            # Fit preprocessor on training data only
            preprocessor = RiskDataPreprocessor()
            train_df = X_train_raw.copy()
            train_df[target_column] = y_train
            X_train = preprocessor.fit_transform(train_df, target_column=target_column)
            
            # Transform test data
            test_df = X_test_raw.copy()
            test_df[target_column] = y_test
            X_test = preprocessor.transform(test_df)
            
            # Train model for this fold
            neg_count = np.sum(y_train == 0)
            pos_count = np.sum(y_train == 1)
            scale_pos_weight_ratio = neg_count / pos_count
            
            model = xgb.XGBClassifier(
                max_depth=3,
                learning_rate=0.1,
                n_estimators=50,
                subsample=1.0,
                colsample_bytree=0.8,
                scale_pos_weight=scale_pos_weight_ratio,
                random_state=42,
                eval_metric='logloss'
            )
            
            model.fit(X_train, y_train)
            fold_models.append(model)
            
            # Evaluate on test fold
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test)[:, 1]
            
            fold_metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, zero_division=0),
                'recall': recall_score(y_test, y_pred, zero_division=0),
                'f1': f1_score(y_test, y_pred, zero_division=0),
                'roc_auc': roc_auc_score(y_test, y_pred_proba) if len(np.unique(y_test)) > 1 else 0.0
            }
            
            # Store results
            for metric, value in fold_metrics.items():
                cv_results[metric].append(value)
            
            # Log fold metrics to MLflow
            for metric, value in fold_metrics.items():
                trainer.mlflow.log_metric(f"fold{fold}_{metric}", value)
            
            # Print fold results
            print(f"\n   Fold {fold} Results:")
            print(f"      Accuracy:  {fold_metrics['accuracy']:.4f}")
            print(f"      Precision: {fold_metrics['precision']:.4f}")
            print(f"      Recall:    {fold_metrics['recall']:.4f}")
            print(f"      F1 Score:  {fold_metrics['f1']:.4f}")
            print(f"      ROC AUC:   {fold_metrics['roc_auc']:.4f}")
        
        # Calculate mean and std across folds
        print(f"\n{'='*70}")
        print(f"CROSS-VALIDATION SUMMARY ({n_folds} FOLDS)")
        print(f"{'='*70}")
        
        for metric in cv_results:
            mean_val = np.mean(cv_results[metric])
            std_val = np.std(cv_results[metric])
            print(f"\n{metric.upper()}:")
            print(f"   Mean:  {mean_val:.4f} ± {std_val:.4f}")
            print(f"   Range: [{np.min(cv_results[metric]):.4f}, {np.max(cv_results[metric]):.4f}]")
            
            # Log mean and std to MLflow
            trainer.mlflow.log_metric(f"cv_mean_{metric}", mean_val)
            trainer.mlflow.log_metric(f"cv_std_{metric}", std_val)
        
        # Check if meets target
        mean_accuracy = np.mean(cv_results['accuracy'])
        mean_recall = np.mean(cv_results['recall'])
        
        print(f"\n{'='*70}")
        if mean_accuracy >= 0.90 and mean_recall >= 0.85:
            print("✅ SUCCESS! Model meets performance targets")
            print(f"   Accuracy: {mean_accuracy:.2%} (target: >90%)")
            print(f"   Recall:   {mean_recall:.2%} (target: >85%)")
        else:
            print("⚠️  Model performance below targets")
            if mean_accuracy < 0.90:
                print(f"   Accuracy: {mean_accuracy:.2%} < 90%")
            if mean_recall < 0.85:
                print(f"   Recall: {mean_recall:.2%} < 85%")
        print(f"{'='*70}")
        
        # Train final model on ALL data with best parameters
        print(f"\n{'='*70}")
        print("TRAINING FINAL MODEL ON ALL DATA")
        print(f"{'='*70}")
        
        trainer.preprocessor = RiskDataPreprocessor()
        full_df = df.copy()
        X_full = trainer.preprocessor.fit_transform(full_df, target_column=target_column)
        y_full = y
        
        final_model = xgb.XGBClassifier(
            max_depth=3,
            learning_rate=0.1,
            n_estimators=50,
            subsample=1.0,
            colsample_bytree=0.8,
            scale_pos_weight=np.sum(y_full==0) / np.sum(y_full==1),
            random_state=42,
            eval_metric='logloss'
        )
        
        final_model.fit(X_full, y_full)
        trainer.model = final_model
        
        # Save model and preprocessor
        model_path = get_models_dir() / "risk_model.pkl"
        save_pickle(final_model, model_path)
        
        preprocessor_path = get_models_dir() / "risk_preprocessor.pkl"
        trainer.preprocessor.save(preprocessor_path)
        
        # Log to MLflow
        trainer.mlflow.log_model(
            final_model,
            "model",
            registered_model_name=MODEL_RISK_NAME
        )
        trainer.mlflow.log_artifact(str(model_path))
        trainer.mlflow.log_artifact(str(preprocessor_path))
        
        # Log final parameters
        trainer.mlflow.log_params({
            'cv_folds': n_folds,
            'final_model': 'trained_on_all_data',
            'scale_pos_weight': np.sum(y_full==0) / np.sum(y_full==1)
        })
        
        print(f"\n✓ Final model saved: {model_path}")
        print(f"✓ Registered in MLflow: {MODEL_RISK_NAME}")
    
    return final_model, trainer, cv_results


if __name__ == "__main__":
    # Initialize MLflow experiments
    from src.mlflow_config import setup_mlflow_experiments
    setup_mlflow_experiments()
    
    # Train model with 5-fold CV
    model, trainer, cv_results = train_risk_model_cv(n_folds=5)
