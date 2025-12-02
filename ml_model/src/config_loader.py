"""
Configuration Loader for CervCareAI
Loads YAML configuration files based on environment
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any


def load_config(env: str = None) -> Dict[str, Any]:
    """
    Load configuration from YAML file
    
    Args:
        env: Environment name ('dev', 'prod'). 
             If None, uses CERVCAREAI_ENV environment variable or defaults to 'dev'
    
    Returns:
        Configuration dictionary
    """
    # Determine environment
    if env is None:
        env = os.getenv('CERVCAREAI_ENV', 'dev')
    
    # Get config file path
    config_dir = Path(__file__).parent.parent / 'config'
    config_file = config_dir / f'{env}.yaml'
    
    if not config_file.exists():
        raise FileNotFoundError(
            f"Configuration file not found: {config_file}\n"
            f"Available configs: dev.yaml, prod.yaml"
        )
    
    # Load YAML
    with open(config_file, 'r') as f:
        config = yaml.safe_load(f)
    
    print(f"✓ Loaded configuration: {env}.yaml")
    return config


def get_mlflow_config(config: Dict[str, Any]) -> Dict[str, str]:
    """Extract MLflow configuration"""
    return config.get('mlflow', {})


def get_model_config(config: Dict[str, Any], model_type: str) -> Dict[str, Any]:
    """
    Get model-specific configuration
    
    Args:
        config: Full configuration dictionary
        model_type: 'risk' or 'image'
    
    Returns:
        Model configuration
    """
    key = f'{model_type}_model'
    if key not in config:
        raise KeyError(f"Model configuration '{key}' not found")
    
    return config[key]


def get_api_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Extract API configuration"""
    return config.get('api', {})


def get_data_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data configuration"""
    return config.get('data', {})


# Example usage
if __name__ == "__main__":
    # Load dev config
    config = load_config('dev')
    
    print("\n" + "="*50)
    print("CONFIGURATION SUMMARY")
    print("="*50)
    
    print(f"\nMLflow Tracking URI: {config['mlflow']['tracking_uri']}")
    print(f"Risk Model Target Accuracy: {config['risk_model']['performance']['target_accuracy']}")
    print(f"Image Model Type: {config['image_model']['model_type']}")
    print(f"API Port: {config['api']['port']}")
    print(f"Environment: {config['deployment']['environment']}")
    
    print("\n✓ Configuration loaded successfully")
