"""
Inference Pipeline for CervCareAI ML Models
Handles prediction for both risk assessment and image classification
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Union
from PIL import Image

from src.utils import get_models_dir, load_pickle
from src.pipelines.feature_eng_pipeline import RiskDataPreprocessor, ImagePreprocessor


class RiskInference:
    """Inference engine for cervical cancer risk prediction"""
    
    def __init__(self, model_path: Path = None, preprocessor_path: Path = None):
        """
        Initialize risk inference engine
        
        Args:
            model_path: Path to trained risk model
            preprocessor_path: Path to fitted preprocessor
        """
        models_dir = get_models_dir()
        
        # Default paths
        if model_path is None:
            model_path = models_dir / "risk_model.pkl"
        if preprocessor_path is None:
            preprocessor_path = models_dir / "risk_preprocessor.pkl"
        
        # Load model and preprocessor
        try:
            self.model = load_pickle(model_path)
            self.preprocessor = RiskDataPreprocessor.load(preprocessor_path)
            print(f"✓ Risk model loaded from {model_path}")
            print(f"✓ Preprocessor loaded from {preprocessor_path}")
        except FileNotFoundError as e:
            raise FileNotFoundError(
                f"Model or preprocessor not found. Please train the model first.\n"
                f"Run: python src/pipelines/training_pipeline.py\n"
                f"Error: {e}"
            )
    
    def predict(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict cervical cancer risk for a patient
        
        Args:
            patient_data: Dictionary of patient features
            
        Returns:
            Dictionary containing risk score, category, and contributing factors
        """
        # Convert to dataframe
        df = pd.DataFrame([patient_data])
        
        # Preprocess
        X = self.preprocessor.transform(df)
        
        # Predict
        risk_prob = self.model.predict_proba(X)[0, 1]  # Probability of positive class
        risk_class = self.model.predict(X)[0]
        
        # Determine risk category
        if risk_prob < 0.3:
            category = "Low"
            recommendation = "Regular screening recommended. Next screening in 3 years."
        elif risk_prob < 0.7:
            category = "Medium"
            recommendation = "Increased monitoring recommended. Next screening in 1-2 years."
        else:
            category = "High"
            recommendation = "Immediate further investigation recommended. Consult with specialist."
        
        # Get feature importance for this prediction
        contributing_factors = self._get_contributing_factors(patient_data)
        
        return {
            "risk_score": float(risk_prob),
            "risk_percentage": float(risk_prob * 100),
            "risk_category": category,
            "risk_class": int(risk_class),
            "recommendation": recommendation,
            "contributing_factors": contributing_factors
        }
    
    def predict_batch(self, patient_data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Predict risk for multiple patients
        
        Args:
            patient_data_list: List of patient data dictionaries
            
        Returns:
            List of prediction dictionaries
        """
        return [self.predict(data) for data in patient_data_list]
    
    def _get_contributing_factors(self, patient_data: Dict[str, Any], top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Get top contributing factors for the prediction
        
        Args:
            patient_data: Patient data dictionary
            top_n: Number of top factors to return
            
        Returns:
            List of contributing factors with importance scores
        """
        # Get feature importances from model
        feature_importance = self.model.feature_importances_
        feature_names = self.preprocessor.feature_names
        
        # Create importance dataframe
        importance_df = pd.DataFrame({
            'factor': feature_names,
            'importance': feature_importance
        }).sort_values('importance', ascending=False).head(top_n)
        
        # Format for response
        factors = []
        for _, row in importance_df.iterrows():
            factor_name = row['factor']
            importance = float(row['importance'])
            
            # Get patient's value for this factor if available
            patient_value = patient_data.get(factor_name, "N/A")
            
            factors.append({
                "factor": factor_name,
                "importance": importance,
                "patient_value": patient_value
            })
        
        return factors


class ImageInference:
    """Inference engine for cervical cell image classification"""
    
    def __init__(self, model_path: Path = None):
        """
        Initialize image inference engine
        
        Args:
            model_path: Path to trained image classification model
        """
        models_dir = get_models_dir()
        
        # Default path
        if model_path is None:
            model_path = models_dir / "image_classifier.pth"
        
        # Initialize preprocessor
        self.preprocessor = ImagePreprocessor(target_size=(224, 224))
        
        # Load model (PyTorch)
        try:
            import torch
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model = torch.load(model_path, map_location=self.device)
            self.model.eval()
            print(f"✓ Image model loaded from {model_path}")
            print(f"  Device: {self.device}")
        except FileNotFoundError:
            raise FileNotFoundError(
                f"Image model not found at {model_path}. "
                f"Please train the model first after SIPaKMeD dataset is downloaded."
            )
        except ImportError:
            raise ImportError(
                "PyTorch not installed. Install with: pip install torch torchvision"
            )
        
        # Class names (from SIPaKMeD dataset)
        self.class_names = [
            "Dyskeratotic",
            "Koilocytotic",
            "Metaplastic",
            "Parabasal",
            "Superficial-Intermediate"
        ]
        
        # Bethesda system mapping
        self.bethesda_mapping = {
            "Dyskeratotic": "ASC-US/LSIL",
            "Koilocytotic": "LSIL",
            "Metaplastic": "Benign",
            "Parabasal": "Normal",
            "Superficial-Intermediate": "Normal"
        }
    
    def predict(self, image_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Classify a cervical cell image
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary containing classification results
        """
        import torch
        
        # Preprocess image
        img_array = self.preprocessor.preprocess_image(Path(image_path))
        
        # Add batch dimension and convert to tensor
        img_tensor = torch.from_numpy(img_array).permute(2, 0, 1).unsqueeze(0)
        img_tensor = img_tensor.to(self.device)
        
        # Predict
        with torch.no_grad():
            outputs = self.model(img_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0]
            predicted_class = torch.argmax(probabilities).item()
            confidence = probabilities[predicted_class].item()
        
        # Get class name
        class_name = self.class_names[predicted_class]
        bethesda_category = self.bethesda_mapping[class_name]
        
        # Create probability dictionary
        probs_dict = {
            name: float(prob)
            for name, prob in zip(self.class_names, probabilities.cpu().numpy())
        }
        
        # Determine recommendation
        if class_name in ["Dyskeratotic", "Koilocytotic"]:
            recommendation = "Abnormal cells detected. Further investigation recommended."
        elif class_name == "Metaplastic":
            recommendation = "Benign cells detected. Continue regular screening."
        else:
            recommendation = "Normal cells. Continue regular screening schedule."
        
        return {
            "class": class_name,
            "confidence": confidence,
            "probabilities": probs_dict,
            "bethesda_category": bethesda_category,
            "recommendation": recommendation
        }
    
    def predict_from_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Classify an image from bytes (useful for API)
        
        Args:
            image_bytes: Image as bytes
            
        Returns:
            Dictionary containing classification results
        """
        import io
        from PIL import Image
        
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Save temporarily and predict
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            image.save(tmp.name)
            result = self.predict(tmp.name)
        
        return result


# Example usage
if __name__ == "__main__":
    print("="*70)
    print("TESTING RISK INFERENCE")
    print("="*70)
    
    try:
        # Initialize risk inference
        risk_engine = RiskInference()
        
        # Sample patient data
        sample_patient = {
            "Age": 35,
            "Number of sexual partners": 2,
            "First sexual intercourse": 18,
            "Num of pregnancies": 2,
            "Smokes": 0,
            "Smokes (years)": 0,
            "Smokes (packs/year)": 0,
            "Hormonal Contraceptives": 1,
            "Hormonal Contraceptives (years)": 5,
            "IUD": 0,
            "IUD (years)": 0,
            "STDs": 0,
            # Add more features as needed...
        }
        
        # Predict
        result = risk_engine.predict(sample_patient)
        
        print("\n✓ Risk Prediction Result:")
        print(f"  Risk Score: {result['risk_percentage']:.1f}%")
        print(f"  Category: {result['risk_category']}")
        print(f"  Recommendation: {result['recommendation']}")
        print(f"\n  Top Contributing Factors:")
        for factor in result['contributing_factors']:
            print(f"    - {factor['factor']}: {factor['importance']:.3f}")
    
    except Exception as e:
        print(f"\n✗ Risk inference test failed: {e}")
    
    print("\n" + "="*70)
    print("IMAGE INFERENCE")
    print("="*70)
    print("⏳ Image model not yet trained (waiting for SIPaKMeD dataset)")
    print("   Will be available after running image training pipeline")
