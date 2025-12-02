"""
Utility functions for CervCareAI ML pipelines
"""

import os
import json
import pickle
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


def get_project_root() -> Path:
    """Get the project root directory"""
    return Path(__file__).parent.parent


def get_data_dir() -> Path:
    """Get the data directory"""
    return get_project_root() / "cervcareai_data"


def get_models_dir() -> Path:
    """Get the models directory"""
    models_dir = get_project_root() / "models"
    models_dir.mkdir(exist_ok=True)
    return models_dir


def get_logs_dir() -> Path:
    """Get the logs directory"""
    logs_dir = get_project_root() / "logs"
    logs_dir.mkdir(exist_ok=True)
    return logs_dir


def save_pickle(obj: Any, filepath: Path):
    """Save object to pickle file"""
    with open(filepath, 'wb') as f:
        pickle.dump(obj, f)
    print(f"✓ Saved to {filepath}")


def load_pickle(filepath: Path) -> Any:
    """Load object from pickle file"""
    with open(filepath, 'rb') as f:
        return pickle.load(f)


def save_json(data: Dict, filepath: Path):
    """Save dictionary to JSON file"""
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✓ Saved to {filepath}")


def load_json(filepath: Path) -> Dict:
    """Load dictionary from JSON file"""
    with open(filepath, 'r') as f:
        return json.load(f)


def create_train_val_test_split(
    X: np.ndarray,
    y: np.ndarray,
    train_size: float = 0.7,
    val_size: float = 0.15,
    test_size: float = 0.15,
    random_state: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Create train/validation/test splits
    
    Args:
        X: Features
        y: Labels
        train_size: Training set proportion
        val_size: Validation set proportion
        test_size: Test set proportion
        random_state: Random seed
        
    Returns:
        X_train, X_val, X_test, y_train, y_val, y_test
    """
    assert abs(train_size + val_size + test_size - 1.0) < 1e-6, "Splits must sum to 1.0"
    
    # First split: train vs (val + test)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y,
        test_size=(val_size + test_size),
        random_state=random_state,
        stratify=y if len(np.unique(y)) > 1 else None
    )
    
    # Second split: val vs test
    val_ratio = val_size / (val_size + test_size)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp,
        test_size=(1 - val_ratio),
        random_state=random_state,
        stratify=y_temp if len(np.unique(y_temp)) > 1 else None
    )
    
    return X_train, X_val, X_test, y_train, y_val, y_test


def print_data_split_info(X_train, X_val, X_test, y_train, y_val, y_test):
    """Print information about data splits"""
    print("\n" + "="*50)
    print("DATA SPLIT INFORMATION")
    print("="*50)
    print(f"Training set:   {len(X_train):,} samples ({len(X_train)/(len(X_train)+len(X_val)+len(X_test))*100:.1f}%)")
    print(f"Validation set: {len(X_val):,} samples ({len(X_val)/(len(X_train)+len(X_val)+len(X_test))*100:.1f}%)")
    print(f"Test set:       {len(X_test):,} samples ({len(X_test)/(len(X_train)+len(X_val)+len(X_test))*100:.1f}%)")
    print(f"Total:          {len(X_train)+len(X_val)+len(X_test):,} samples")
    
    # Class distribution
    if hasattr(y_train, 'value_counts'):  # Pandas Series
        print("\nClass distribution (training set):")
        print(y_train.value_counts().sort_index())
    elif len(np.unique(y_train)) < 20:  # NumPy array with few classes
        print("\nClass distribution (training set):")
        unique, counts = np.unique(y_train, return_counts=True)
        for label, count in zip(unique, counts):
            print(f"  Class {label}: {count} ({count/len(y_train)*100:.1f}%)")
    print("="*50 + "\n")


def ensure_directory_exists(directory: Path):
    """Create directory if it doesn't exist"""
    directory.mkdir(parents=True, exist_ok=True)
