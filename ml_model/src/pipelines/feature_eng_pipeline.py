"""
Feature Engineering Pipeline for CervCareAI
Handles preprocessing for both risk prediction and image classification
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, Dict, Any
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer
import pickle


class RiskDataPreprocessor:
    """Preprocessor for cervical cancer risk prediction data"""
    
    def __init__(self):
        self.numerical_imputer = SimpleImputer(strategy='median')
        self.categorical_imputer = SimpleImputer(strategy='most_frequent')
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = None
        self.target_column = None
        
    def fit(self, df: pd.DataFrame, target_column: str = 'Biopsy'):
        """
        Fit preprocessor on training data
        
        Args:
            df: Input dataframe
            target_column: Name of the target column
        """
        self.target_column = target_column
        
        # Separate features and target
        X = df.drop(columns=[target_column])
        self.feature_names = X.columns.tolist()
        
        # Identify numerical and categorical columns
        numerical_cols = X.select_dtypes(include=['int64', 'float64']).columns
        categorical_cols = X.select_dtypes(include=['object']).columns
        
        # Fit imputers
        if len(numerical_cols) > 0:
            self.numerical_imputer.fit(X[numerical_cols])
        
        if len(categorical_cols) > 0:
            self.categorical_imputer.fit(X[categorical_cols])
            
            # Fit label encoders for categorical columns
            for col in categorical_cols:
                le = LabelEncoder()
                # Fill NaN temporarily for fitting
                temp_data = X[col].fillna('missing')
                le.fit(temp_data)
                self.label_encoders[col] = le
        
        # Fit scaler on imputed numerical data
        X_processed = self._transform_features(X)
        self.scaler.fit(X_processed)
        
        return self
    
    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Transform data using fitted preprocessor
        
        Args:
            df: Input dataframe
            
        Returns:
            Preprocessed feature array
        """
        # Remove target if present
        if self.target_column in df.columns:
            X = df.drop(columns=[self.target_column])
        else:
            X = df.copy()
        
        # Transform features
        X_processed = self._transform_features(X)
        
        # Scale
        X_scaled = self.scaler.transform(X_processed)
        
        return X_scaled
    
    def fit_transform(self, df: pd.DataFrame, target_column: str = 'Biopsy') -> np.ndarray:
        """Fit and transform in one step"""
        self.fit(df, target_column)
        return self.transform(df)
    
    def _transform_features(self, X: pd.DataFrame) -> np.ndarray:
        """Internal method to transform features"""
        X = X.copy()
        
        # Identify column types
        numerical_cols = X.select_dtypes(include=['int64', 'float64']).columns
        categorical_cols = X.select_dtypes(include=['object']).columns
        
        # Impute numerical columns
        if len(numerical_cols) > 0:
            X[numerical_cols] = self.numerical_imputer.transform(X[numerical_cols])
        
        # Impute and encode categorical columns
        if len(categorical_cols) > 0:
            X[categorical_cols] = self.categorical_imputer.transform(X[categorical_cols])
            
            for col in categorical_cols:
                # Handle unseen categories
                X[col] = X[col].apply(
                    lambda x: x if x in self.label_encoders[col].classes_ else 'missing'
                )
                X[col] = self.label_encoders[col].transform(X[col])
        
        return X.values
    
    def get_target(self, df: pd.DataFrame) -> np.ndarray:
        """Extract and encode target variable"""
        if self.target_column not in df.columns:
            raise ValueError(f"Target column '{self.target_column}' not found in dataframe")
        
        return df[self.target_column].values
    
    def save(self, filepath: Path):
        """Save preprocessor to file"""
        with open(filepath, 'wb') as f:
            pickle.dump(self, f)
        print(f"✓ Preprocessor saved to {filepath}")
    
    @staticmethod
    def load(filepath: Path) -> 'RiskDataPreprocessor':
        """Load preprocessor from file"""
        with open(filepath, 'rb') as f:
            return pickle.load(f)


class ImagePreprocessor:
    """Preprocessor for cervical cell images"""
    
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        """
        Initialize image preprocessor
        
        Args:
            target_size: Target image size (height, width)
        """
        self.target_size = target_size
        
    def preprocess_image(self, image_path: Path) -> np.ndarray:
        """
        Preprocess a single image
        
        Args:
            image_path: Path to image file
            
        Returns:
            Preprocessed image array
        """
        from PIL import Image
        
        # Load image
        img = Image.open(image_path)
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize
        img = img.resize(self.target_size, Image.Resampling.LANCZOS)
        
        # Convert to array and normalize
        img_array = np.array(img, dtype=np.float32)
        img_array = img_array / 255.0  # Normalize to [0, 1]
        
        return img_array
    
    def preprocess_batch(self, image_paths: list) -> np.ndarray:
        """
        Preprocess a batch of images
        
        Args:
            image_paths: List of image paths
            
        Returns:
            Batch of preprocessed images
        """
        images = [self.preprocess_image(path) for path in image_paths]
        return np.array(images)


def load_risk_dataset(data_dir: Path) -> pd.DataFrame:
    """
    Load the Kaggle cervical cancer risk dataset
    
    Args:
        data_dir: Directory containing the dataset
        
    Returns:
        Loaded dataframe
    """
    # Look for CSV files in the kaggle_risk directory
    kaggle_dir = data_dir / "raw" / "kaggle_risk"
    
    csv_files = list(kaggle_dir.glob("*.csv"))
    
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {kaggle_dir}")
    
    # Load the first CSV file (should be the risk dataset)
    df = pd.read_csv(csv_files[0])
    
    print(f"✓ Loaded risk dataset: {csv_files[0].name}")
    print(f"  Shape: {df.shape}")
    print(f"  Columns: {len(df.columns)}")
    
    return df


def clean_risk_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and prepare risk dataset
    
    Args:
        df: Raw dataframe
        
    Returns:
        Cleaned dataframe
    """
    df = df.copy()
    
    # Replace '?' with NaN
    df = df.replace('?', np.nan)
    
    # Convert numeric columns
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                df[col] = pd.to_numeric(df[col])
            except ValueError:
                pass  # Keep as object if conversion fails
    
    print(f"✓ Dataset cleaned")
    print(f"  Missing values: {df.isnull().sum().sum()}")
    
    return df


if __name__ == "__main__":
    # Test the preprocessor
    from src.utils import get_data_dir
    
    try:
        # Load and clean data
        data_dir = get_data_dir()
        df = load_risk_dataset(data_dir)
        df = clean_risk_dataset(df)
        
        # Test preprocessor
        preprocessor = RiskDataPreprocessor()
        X = preprocessor.fit_transform(df, target_column='Biopsy')
        y = preprocessor.get_target(df)
        
        print(f"\n✓ Preprocessing successful")
        print(f"  X shape: {X.shape}")
        print(f"  y shape: {y.shape}")
        
    except Exception as e:
        print(f"✗ Error: {e}")
