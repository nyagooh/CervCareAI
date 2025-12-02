"""
Image Classification Models for CervCareAI
Supports ResNet50 and EfficientNet-B3 with transfer learning
"""

import torch
import torch.nn as nn
from torchvision import models
from typing import Literal


def create_model(
    model_type: Literal['resnet50', 'efficientnet_b3'] = 'resnet50',
    num_classes: int = 2,
    pretrained: bool = True,
    dropout: float = 0.3
) -> nn.Module:
    """
    Create image classification model with transfer learning
    
    Args:
        model_type: Type of model architecture
        num_classes: Number of output classes
        pretrained: Whether to use ImageNet pretrained weights
        dropout: Dropout rate for regularization
        
    Returns:
        PyTorch model
    """
    print(f"\n🏗️  Creating {model_type} model...")
    
    if model_type == 'resnet50':
        # Load pretrained ResNet50
        model = models.resnet50(pretrained=pretrained)
        
        # Freeze early layers (will unfreeze later for fine-tuning)
        for param in model.parameters():
            param.requires_grad = False
        
        # Replace final fully connected layer
        num_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(512, num_classes)
        )
        
        print(f"✓ ResNet50 loaded (pretrained={pretrained})")
        print(f"  - Modified FC layer: {num_features} → 512 → {num_classes}")
        print(f"  - Dropout: {dropout}")
        
    elif model_type == 'efficientnet_b3':
        # Load pretrained EfficientNet-B3
        model = models.efficientnet_b3(pretrained=pretrained)
        
        # Freeze early layers
        for param in model.parameters():
            param.requires_grad = False
        
        # Replace classifier
        num_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(512, num_classes)
        )
        
        print(f"✓ EfficientNet-B3 loaded (pretrained={pretrained})")
        print(f"  - Modified classifier: {num_features} → 512 → {num_classes}")
        print(f"  - Dropout: {dropout}")
    
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    print(f"  - Total parameters: {total_params:,}")
    print(f"  - Trainable parameters: {trainable_params:,}")
    
    return model


def unfreeze_model(model: nn.Module, unfreeze_percentage: float = 0.2):
    """
    Unfreeze last N% of model layers for fine-tuning
    
    Args:
        model: PyTorch model
        unfreeze_percentage: Percentage of layers to unfreeze (0.0 to 1.0)
    """
    # Get all parameters
    all_params = list(model.parameters())
    num_to_unfreeze = int(len(all_params) * unfreeze_percentage)
    
    # Unfreeze last N% of parameters
    for param in all_params[-num_to_unfreeze:]:
        param.requires_grad = True
    
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    
    print(f"\n🔓 Unfroze {unfreeze_percentage*100:.0f}% of layers")
    print(f"  - Trainable parameters: {trainable_params:,} / {total_params:,}")


class CervicalClassifier(nn.Module):
    """
    Wrapper class for cervical cancer classification
    """
    
    def __init__(
        self,
        model_type: str = 'resnet50',
        num_classes: int = 2,
        dropout: float = 0.3
    ):
        super().__init__()
        self.model = create_model(model_type, num_classes, pretrained=True, dropout=dropout)
        self.model_type = model_type
        self.num_classes = num_classes
        
    def forward(self, x):
        return self.model(x)
    
    def unfreeze_for_finetuning(self, percentage: float = 0.2):
        """Unfreeze layers for fine-tuning"""
        unfreeze_model(self.model, percentage)


# Example usage
if __name__ == "__main__":
    # Test model creation
    model = create_model('resnet50', num_classes=2, dropout=0.3)
    
    # Test forward pass
    dummy_input = torch.randn(4, 3, 224, 224)
    output = model(dummy_input)
    print(f"\n✓ Model output shape: {output.shape}")
    
    # Test unfreezing
    unfreeze_model(model, unfreeze_percentage=0.2)
