"""
MLflow Configuration and Utilities for CervCareAI
Handles experiment tracking, model logging, and model registry
Compatible with MLflow 3.x and Python 3.11+
"""

import os
from pathlib import Path
from typing import Any, Dict, Optional
import mlflow
from mlflow.tracking import MlflowClient


# MLflow Configuration
# Windows requires absolute file:/// URI (not relative paths)
MLRUNS_DIR = Path(__file__).parent.parent / "mlruns"
MLRUNS_DIR.mkdir(exist_ok=True)

# Use proper file:/// URI format for Windows compatibility
MLFLOW_TRACKING_URI = os.getenv(
    "MLFLOW_TRACKING_URI",
    f"file:///{MLRUNS_DIR.as_posix()}"  # Converts Windows path to URI
)
MLFLOW_EXPERIMENT_RISK = "risk-prediction"
MLFLOW_EXPERIMENT_IMAGE = "image-classification"

# Model Registry Names
MODEL_RISK_NAME = "cervical-risk-predictor"
MODEL_IMAGE_NAME = "cervical-image-classifier"


class MLflowManager:
    """Manager class for MLflow operations"""
    
    def __init__(self, tracking_uri: str = MLFLOW_TRACKING_URI):
        """
        Initialize MLflow manager
        
        Args:
            tracking_uri: MLflow tracking server URI
        """
        mlflow.set_tracking_uri(tracking_uri)
        self.client = MlflowClient(tracking_uri)
        
    def create_experiment(self, experiment_name: str) -> str:
        """
        Create or get existing experiment
        
        Args:
            experiment_name: Name of the experiment
            
        Returns:
            Experiment ID
        """
        try:
            experiment_id = mlflow.create_experiment(experiment_name)
            print(f"✓ Created experiment: {experiment_name} (ID: {experiment_id})")
        except Exception:
            experiment = mlflow.get_experiment_by_name(experiment_name)
            experiment_id = experiment.experiment_id
            print(f"✓ Using existing experiment: {experiment_name} (ID: {experiment_id})")
        
        return experiment_id
    
    def start_run(self, experiment_name: str, run_name: Optional[str] = None):
        """
        Start an MLflow run
        
        Args:
            experiment_name: Name of the experiment
            run_name: Optional name for the run
            
        Returns:
            MLflow run context manager
        """
        mlflow.set_experiment(experiment_name)
        return mlflow.start_run(run_name=run_name)
    
    def log_params(self, params: Dict[str, Any]):
        """Log parameters to MLflow"""
        mlflow.log_params(params)
    
    def log_metrics(self, metrics: Dict[str, float], step: Optional[int] = None):
        """Log metrics to MLflow"""
        mlflow.log_metrics(metrics, step=step)
    
    def log_metric(self, key: str, value: float, step: Optional[int] = None):
        """Log a single metric"""
        mlflow.log_metric(key, value, step=step)
    
    def log_artifact(self, local_path: str, artifact_path: Optional[str] = None):
        """Log an artifact (file) to MLflow"""
        mlflow.log_artifact(local_path, artifact_path)
    
    def log_figure(self, figure, artifact_file: str):
        """Log a matplotlib/plotly figure"""
        mlflow.log_figure(figure, artifact_file)
    
    def log_model(
        self,
        model,
        artifact_path: str,
        registered_model_name: Optional[str] = None,
        **kwargs
    ):
        """
        Log a model to MLflow
        
        Args:
            model: Model object to log
            artifact_path: Path in the artifact store
            registered_model_name: Name for model registry
            **kwargs: Additional arguments for specific model flavors
        """
        # Automatically detect model type and log appropriately
        if hasattr(model, 'predict') and 'sklearn' in str(type(model).__module__):
            mlflow.sklearn.log_model(
                model,
                artifact_path,
                registered_model_name=registered_model_name,
                **kwargs
            )
        elif hasattr(model, 'state_dict'):  # PyTorch model
            mlflow.pytorch.log_model(
                model,
                artifact_path,
                registered_model_name=registered_model_name,
                **kwargs
            )
        else:
            # Generic Python function model
            mlflow.pyfunc.log_model(
                artifact_path,
                python_model=model,
                registered_model_name=registered_model_name,
                **kwargs
            )
    
    def register_model(self, model_uri: str, name: str) -> Any:
        """
        Register a model in the MLflow Model Registry
        
        Args:
            model_uri: URI of the model (e.g., "runs:/<run_id>/model")
            name: Name for the registered model
            
        Returns:
            ModelVersion object
        """
        return mlflow.register_model(model_uri, name)
    
    def transition_model_stage(
        self,
        name: str,
        version: int,
        stage: str
    ):
        """
        Transition a model to a different stage
        
        Args:
            name: Registered model name
            version: Model version number
            stage: Target stage ("Staging", "Production", "Archived")
        """
        self.client.transition_model_version_stage(
            name=name,
            version=version,
            stage=stage
        )
        print(f"✓ Model {name} v{version} transitioned to {stage}")
    
    def get_latest_model_version(self, name: str, stage: Optional[str] = None) -> Any:
        """
        Get the latest version of a registered model
        
        Args:
            name: Registered model name
            stage: Optional stage filter ("Staging", "Production")
            
        Returns:
            Latest model version
        """
        versions = self.client.get_latest_versions(name, stages=[stage] if stage else None)
        return versions[0] if versions else None
    
    def load_model(self, model_uri: str):
        """
        Load a model from MLflow
        
        Args:
            model_uri: URI of the model
            
        Returns:
            Loaded model
        """
        return mlflow.pyfunc.load_model(model_uri)


def setup_mlflow_experiments():
    """Initialize MLflow experiments for CervCareAI"""
    manager = MLflowManager()
    
    # Create experiments
    manager.create_experiment(MLFLOW_EXPERIMENT_RISK)
    manager.create_experiment(MLFLOW_EXPERIMENT_IMAGE)
    
    print("\n✓ MLflow experiments initialized successfully")
    print(f"  - Tracking URI: {MLFLOW_TRACKING_URI}")
    print(f"  - Risk Prediction: {MLFLOW_EXPERIMENT_RISK}")
    print(f"  - Image Classification: {MLFLOW_EXPERIMENT_IMAGE}")
    print("\nStart MLflow UI with: mlflow ui")


if __name__ == "__main__":
    setup_mlflow_experiments()
