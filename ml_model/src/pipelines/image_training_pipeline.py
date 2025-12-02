"""
Image Model Training Pipeline with Optuna Support
Trains cervical cell image classification model
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from pathlib import Path
from typing import Dict, Any, Optional
import time
from tqdm import tqdm
import optuna
from optuna.integration.mlflow import MLflowCallback

from src.utils import get_data_dir, get_models_dir, get_logs_dir
from src.mlflow_config import MLflowManager, MLFLOW_EXPERIMENT_IMAGE, MODEL_IMAGE_NAME
from src.data.combined_dataset import (
    load_combined_dataset,
    CombinedCervicalDataset,
    get_heavy_augmentation_transform,
    get_validation_transform
)
from src.models.image_classifier import create_model


class ImageModelTrainer:
    """Trainer for cervical cell image classification"""
    
    def __init__(
        self,
        experiment_name: str = MLFLOW_EXPERIMENT_IMAGE,
        device: str = None
    ):
        """
        Initialize image model trainer
        
        Args:
            experiment_name: MLflow experiment name
            device: Device to use ('cuda' or 'cpu'), auto-detects if None
        """
        self.experiment_name = experiment_name
        self.mlflow = MLflowManager()
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"✓ Using device: {self.device}")
        
    def train_with_optuna(
        self,
        n_trials: int = 50,
        timeout_hours: Optional[float] = None
    ):
        """
        Train model with Optuna hyperparameter optimization
        
        Args:
            n_trials: Number of optimization trials
            timeout_hours: Maximum optimization time in hours
        """
        print("\n" + "="*70)
        print("OPTUNA HYPERPARAMETER OPTIMIZATION")
        print("="*70)
        
        # Create Optuna study
        study = optuna.create_study(
            direction="maximize",  # Maximize validation accuracy
            study_name="cervcareai-image-classification",
            pruner=optuna.pruners.MedianPruner(
                n_startup_trials=5,
                n_warmup_steps=3
            )
        )
        
        # MLflow callback for Optuna
        mlflc = MLflowCallback(
            tracking_uri=self.mlflow.client.tracking_uri,
            metric_name="val_accuracy"
        )
        
        # Run optimization
        timeout_seconds = timeout_hours * 3600 if timeout_hours else None
        
        study.optimize(
            self._objective,
            n_trials=n_trials,
            timeout=timeout_seconds,
            callbacks=[mlflc],
            show_progress_bar=True
        )
        
        # Print results
        print("\n" + "="*70)
        print("OPTIMIZATION COMPLETE")
        print("="*70)
        print(f"Best trial: {study.best_trial.number}")
        print(f"Best validation accuracy: {study.best_value:.4f}")
        print(f"\nBest hyperparameters:")
        for key, value in study.best_params.items():
            print(f"  {key}: {value}")
        
        # Train final model with best hyperparameters
        print("\n" + "="*70)
        print("TRAINING FINAL MODEL WITH BEST HYPERPARAMETERS")
        print("="*70)
        
        best_model = self._train_model(study.best_params, is_final=True)
        
        return best_model, study
    
    def _objective(self, trial: optuna.Trial) -> float:
        """
        Optuna objective function
        
        Args:
            trial: Optuna trial
            
        Returns:
            Validation accuracy
        """
        # Suggest hyperparameters
        params = {
            'learning_rate': trial.suggest_float('learning_rate', 1e-5, 1e-2, log=True),
            'batch_size': trial.suggest_categorical('batch_size', [16, 32, 64]),
            'optimizer': trial.suggest_categorical('optimizer', ['adam', 'adamw', 'sgd']),
            'weight_decay': trial.suggest_float('weight_decay', 1e-6, 1e-3, log=True),
            'dropout': trial.suggest_float('dropout', 0.1, 0.5),
            'augment_factor': trial.suggest_int('augment_factor', 2, 4),
            'model_type': trial.suggest_categorical('model_type', ['resnet50', 'efficientnet_b3']),
        }
        
        # Train model
        val_accuracy = self._train_model(params, trial=trial)
        
        return val_accuracy
    
    def _train_model(
        self,
        params: Dict[str, Any],
        trial: Optional[optuna.Trial] = None,
        is_final: bool = False
    ) -> float:
        """
        Train model with given hyperparameters
        
        Args:
            params: Hyperparameters
            trial: Optuna trial for pruning
            is_final: Whether this is the final model training
            
        Returns:
            Validation accuracy
        """
        # Load data
        data_dir = get_data_dir()
        train_paths, val_paths, test_paths, train_labels, val_labels, test_labels = \
            load_combined_dataset(data_dir)
        
        # Create datasets
        train_transform = get_heavy_augmentation_transform()
        val_transform = get_validation_transform()
        
        train_dataset = CombinedCervicalDataset(
            train_paths,
            train_labels,
            transform=train_transform,
            augment_factor=params['augment_factor']
        )
        
        val_dataset = CombinedCervicalDataset(
            val_paths,
            val_labels,
            transform=val_transform,
            augment_factor=1
        )
        
        # Create data loaders
        train_loader = DataLoader(
            train_dataset,
            batch_size=params['batch_size'],
            shuffle=True,
            num_workers=4,
            pin_memory=True if self.device == 'cuda' else False
        )
        
        val_loader = DataLoader(
            val_dataset,
            batch_size=params['batch_size'],
            shuffle=False,
            num_workers=4,
            pin_memory=True if self.device == 'cuda' else False
        )
        
        # Create model
        model = create_model(
            model_type=params['model_type'],
            num_classes=2,  # Binary classification
            dropout=params['dropout']
        ).to(self.device)
        
        # Loss and optimizer
        criterion = nn.CrossEntropyLoss()
        
        if params['optimizer'] == 'adam':
            optimizer = optim.Adam(
                model.parameters(),
                lr=params['learning_rate'],
                weight_decay=params['weight_decay']
            )
        elif params['optimizer'] == 'adamw':
            optimizer = optim.AdamW(
                model.parameters(),
                lr=params['learning_rate'],
                weight_decay=params['weight_decay']
            )
        else:  # sgd
            optimizer = optim.SGD(
                model.parameters(),
                lr=params['learning_rate'],
                momentum=0.9,
                weight_decay=params['weight_decay']
            )
        
        # Learning rate scheduler
        scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            optimizer,
            mode='max',
            factor=0.5,
            patience=3,
            verbose=True
        )
        
        # Training loop
        num_epochs = 20 if not is_final else 50
        best_val_acc = 0.0
        
        for epoch in range(num_epochs):
            # Train
            model.train()
            train_loss = 0.0
            train_correct = 0
            train_total = 0
            
            with tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs} [Train]") as pbar:
                for images, labels in pbar:
                    images, labels = images.to(self.device), labels.to(self.device)
                    
                    optimizer.zero_grad()
                    outputs = model(images)
                    loss = criterion(outputs, labels)
                    loss.backward()
                    optimizer.step()
                    
                    train_loss += loss.item()
                    _, predicted = outputs.max(1)
                    train_total += labels.size(0)
                    train_correct += predicted.eq(labels).sum().item()
                    
                    pbar.set_postfix({
                        'loss': f'{loss.item():.4f}',
                        'acc': f'{100.*train_correct/train_total:.2f}%'
                    })
            
            train_acc = train_correct / train_total
            
            # Validate
            model.eval()
            val_loss = 0.0
            val_correct = 0
            val_total = 0
            
            with torch.no_grad():
                for images, labels in val_loader:
                    images, labels = images.to(self.device), labels.to(self.device)
                    outputs = model(images)
                    loss = criterion(outputs, labels)
                    
                    val_loss += loss.item()
                    _, predicted = outputs.max(1)
                    val_total += labels.size(0)
                    val_correct += predicted.eq(labels).sum().item()
            
            val_acc = val_correct / val_total
            
            print(f"Epoch {epoch+1}: Train Acc={train_acc:.4f}, Val Acc={val_acc:.4f}")
            
            # Update scheduler
            scheduler.step(val_acc)
            
            # Optuna pruning
            if trial is not None:
                trial.report(val_acc, epoch)
                if trial.should_prune():
                    print(f"Trial pruned at epoch {epoch+1}")
                    raise optuna.TrialPruned()
            
            # Save best model
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                if is_final:
                    model_path = get_models_dir() / "image_classifier_best.pth"
                    torch.save(model.state_dict(), model_path)
                    print(f"✓ Saved best model: {model_path}")
        
        return best_val_acc


# Example usage
if __name__ == "__main__":
    from src.mlflow_config import setup_mlflow_experiments
    setup_mlflow_experiments()
    
    trainer = ImageModelTrainer()
    model, study = trainer.train_with_optuna(n_trials=20, timeout_hours=6)
