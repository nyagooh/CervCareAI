"""
Combined Image Dataset Loader for CervCareAI
Merges SIPaKMeD and Mendeley LBC datasets with class mapping
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, List, Dict
from sklearn.model_selection import train_test_split
from PIL import Image
import torch
from torch.utils.data import Dataset
from torchvision import transforms
import albumentations as A
from albumentations.pytorch import ToTensorV2


class CombinedCervicalDataset(Dataset):
    """Combined dataset from SIPaKMeD and Mendeley LBC"""
    
    # Unified class mapping to Bethesda system
    CLASS_MAPPING = {
        # SIPaKMeD classes
        'im_Dyskeratotic': 'Abnormal',
        'im_Koilocytotic': 'Abnormal',
        'im_Metaplastic': 'Normal',
        'im_Parabasal': 'Normal',
        'im_Superficial-Intermediate': 'Normal',
        
        # Mendeley LBC classes
        'Negative for Intraepithelial malignancy': 'Normal',
        'Low squamous intra-epithelial lesion': 'Abnormal',
        'High squamous intra-epithelial lesion': 'Abnormal',
        'Squamous cell carcinoma': 'Abnormal',
    }
    
    # Binary classification
    CLASS_TO_IDX = {'Normal': 0, 'Abnormal': 1}
    IDX_TO_CLASS = {0: 'Normal', 1: 'Abnormal'}
    
    def __init__(
        self,
        image_paths: List[Path],
        labels: List[int],
        transform=None,
        augment_factor: int = 1
    ):
        """
        Initialize combined dataset
        
        Args:
            image_paths: List of image file paths
            labels: List of class labels (0=Normal, 1=Abnormal)
            transform: Albumentations transforms
            augment_factor: Number of augmented copies per image (1=no augmentation)
        """
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
        self.augment_factor = augment_factor
        
    def __len__(self):
        return len(self.image_paths) * self.augment_factor
    
    def __getitem__(self, idx):
        # Map augmented index to original image
        original_idx = idx % len(self.image_paths)
        
        # Load image
        image_path = self.image_paths[original_idx]
        image = Image.open(image_path).convert('RGB')
        image = np.array(image)
        
        # Apply transforms
        if self.transform:
            augmented = self.transform(image=image)
            image = augmented['image']
        else:
            # Default: just convert to tensor
            image = torch.from_numpy(image).permute(2, 0, 1).float() / 255.0
        
        label = self.labels[original_idx]
        
        return image, label


def load_combined_dataset(
    data_dir: Path,
    test_size: float = 0.15,
    val_size: float = 0.15,
    random_state: int = 42
) -> Tuple[List[Path], List[Path], List[Path], List[int], List[int], List[int]]:
    """
    Load and combine SIPaKMeD and Mendeley LBC datasets
    
    Args:
        data_dir: Base data directory
        test_size: Test split proportion
        val_size: Validation split proportion
        random_state: Random seed
        
    Returns:
        train_paths, val_paths, test_paths, train_labels, val_labels, test_labels
    """
    all_image_paths = []
    all_labels = []
    
    print("\n" + "="*70)
    print("LOADING COMBINED DATASET")
    print("="*70)
    
    # Load SIPaKMeD
    sipakmed_dir = data_dir / "raw" / "sipakmed"
    if sipakmed_dir.exists():
        print("\n📁 Loading SIPaKMeD dataset...")
        for class_dir in sipakmed_dir.iterdir():
            if class_dir.is_dir():
                class_name = class_dir.name
                if class_name in CombinedCervicalDataset.CLASS_MAPPING:
                    mapped_class = CombinedCervicalDataset.CLASS_MAPPING[class_name]
                    label = CombinedCervicalDataset.CLASS_TO_IDX[mapped_class]
                    
                    # Get all images
                    images = list(class_dir.glob('*.bmp')) + \
                             list(class_dir.glob('*.jpg')) + \
                             list(class_dir.glob('*.png'))
                    
                    all_image_paths.extend(images)
                    all_labels.extend([label] * len(images))
                    
                    print(f"  {class_name}: {len(images)} images → {mapped_class}")
    
    # Load Mendeley LBC
    mendeley_dir = data_dir / "raw" / "mendeley_lbc" / "mendeley_lbc"
    if mendeley_dir.exists():
        print("\n📁 Loading Mendeley LBC dataset...")
        for class_dir in mendeley_dir.iterdir():
            if class_dir.is_dir():
                class_name = class_dir.name
                if class_name in CombinedCervicalDataset.CLASS_MAPPING:
                    mapped_class = CombinedCervicalDataset.CLASS_MAPPING[class_name]
                    label = CombinedCervicalDataset.CLASS_TO_IDX[mapped_class]
                    
                    # Get all images
                    images = list(class_dir.rglob('*.jpg')) + \
                             list(class_dir.rglob('*.png')) + \
                             list(class_dir.rglob('*.bmp'))
                    
                    all_image_paths.extend(images)
                    all_labels.extend([label] * len(images))
                    
                    print(f"  {class_name}: {len(images)} images → {mapped_class}")
    
    print(f"\n✓ Total images loaded: {len(all_image_paths)}")
    
    # Convert to numpy arrays
    all_image_paths = np.array(all_image_paths)
    all_labels = np.array(all_labels)
    
    # Count class distribution
    unique, counts = np.unique(all_labels, return_counts=True)
    print(f"\n📊 Class distribution:")
    for label, count in zip(unique, counts):
        class_name = CombinedCervicalDataset.IDX_TO_CLASS[label]
        print(f"  {class_name} ({label}): {count} images ({count/len(all_labels)*100:.1f}%)")
    
    # Stratified split: train vs (val + test)
    train_paths, temp_paths, train_labels, temp_labels = train_test_split(
        all_image_paths,
        all_labels,
        test_size=(val_size + test_size),
        random_state=random_state,
        stratify=all_labels
    )
    
    # Stratified split: val vs test
    val_ratio = val_size / (val_size + test_size)
    val_paths, test_paths, val_labels, test_labels = train_test_split(
        temp_paths,
        temp_labels,
        test_size=(1 - val_ratio),
        random_state=random_state,
        stratify=temp_labels
    )
    
    print(f"\n📈 Stratified splits:")
    print(f"  Training:   {len(train_paths):,} images ({len(train_paths)/len(all_image_paths)*100:.1f}%)")
    print(f"  Validation: {len(val_paths):,} images ({len(val_paths)/len(all_image_paths)*100:.1f}%)")
    print(f"  Test:       {len(test_paths):,} images ({len(test_paths)/len(all_image_paths)*100:.1f}%)")
    print("="*70 + "\n")
    
    return (
        train_paths.tolist(),
        val_paths.tolist(),
        test_paths.tolist(),
        train_labels.tolist(),
        val_labels.tolist(),
        test_labels.tolist()
    )


def get_heavy_augmentation_transform(image_size: int = 224) -> A.Compose:
    """
    Heavy augmentation pipeline for 3x effective dataset size
    
    Args:
        image_size: Target image size
        
    Returns:
        Albumentations transform pipeline
    """
    return A.Compose([
        # Resize
        A.Resize(image_size, image_size),
        
        # Geometric transforms
        A.RandomRotate90(p=0.5),
        A.Flip(p=0.5),
        A.ShiftScaleRotate(
            shift_limit=0.1,
            scale_limit=0.2,
            rotate_limit=30,
            p=0.7
        ),
        
        # Optical distortions
        A.OpticalDistortion(distort_limit=0.1, p=0.3),
        A.GridDistortion(p=0.3),
        A.ElasticTransform(alpha=1, sigma=50, p=0.3),
        
        # Color/brightness augmentations
        A.OneOf([
            A.RandomBrightnessContrast(
                brightness_limit=0.3,
                contrast_limit=0.3,
                p=1.0
            ),
            A.HueSaturationValue(
                hue_shift_limit=20,
                sat_shift_limit=30,
                val_shift_limit=20,
                p=1.0
            ),
            A.RandomGamma(gamma_limit=(80, 120), p=1.0),
        ], p=0.8),
        
        # Blur and noise
        A.OneOf([
            A.GaussianBlur(blur_limit=3, p=1.0),
            A.MedianBlur(blur_limit=3, p=1.0),
            A.MotionBlur(blur_limit=3, p=1.0),
        ], p=0.3),
        
        A.GaussNoise(var_limit=(10.0, 50.0), p=0.3),
        
        # CLAHE for contrast enhancement (important for medical images)
        A.CLAHE(clip_limit=4.0, tile_grid_size=(8, 8), p=0.5),
        
        # Normalize
        A.Normalize(
            mean=[0.485, 0.456, 0.406],  # ImageNet stats
            std=[0.229, 0.224, 0.225]
        ),
        
        # Convert to tensor
        ToTensorV2()
    ])


def get_validation_transform(image_size: int = 224) -> A.Compose:
    """
    Validation/test transform (no augmentation)
    
    Args:
        image_size: Target image size
        
    Returns:
        Albumentations transform pipeline
    """
    return A.Compose([
        A.Resize(image_size, image_size),
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2()
    ])


# Example usage
if __name__ == "__main__":
    from src.utils import get_data_dir
    
    # Load combined dataset
    data_dir = get_data_dir()
    train_paths, val_paths, test_paths, train_labels, val_labels, test_labels = \
        load_combined_dataset(data_dir)
    
    # Create datasets
    train_transform = get_heavy_augmentation_transform()
    val_transform = get_validation_transform()
    
    # With 3x augmentation
    train_dataset = CombinedCervicalDataset(
        train_paths,
        train_labels,
        transform=train_transform,
        augment_factor=3  # 3x dataset size
    )
    
    val_dataset = CombinedCervicalDataset(
        val_paths,
        val_labels,
        transform=val_transform,
        augment_factor=1  # No augmentation for validation
    )
    
    print(f"\n✓ Training dataset: {len(train_dataset):,} samples (with augmentation)")
    print(f"✓ Validation dataset: {len(val_dataset):,} samples")
