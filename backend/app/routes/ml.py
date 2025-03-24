from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Request
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import io
import logging
import base64
import pandas as pd
import os
from datetime import datetime
from typing import Dict, Any, Optional

router = APIRouter()  # Remove the prefix here since it's set in __init__.py

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Skin cancer classes with their descriptions
SKIN_CANCER_CLASSES = {
    'akiec': 'Actinic Keratoses and Intraepithelial Carcinoma',
    'bcc': 'Basal Cell Carcinoma',
    'bkl': 'Benign Keratosis-like Lesions',
    'df': 'Dermatofibroma',
    'mel': 'Melanoma',
    'nv': 'Melanocytic Nevi',
    'vasc': 'Vascular Lesions'
}

# Risk levels and their thresholds
RISK_LEVELS = {
    'High': 0.85,
    'Medium': 0.70,
    'Low': 0.50
}

def preprocess_image(image: Image.Image) -> np.ndarray:
    """Preprocess the image for model input."""
    # Resize to 224x224 (standard input size for many CNN models)
    image = image.resize((224, 224))
    
    # Convert to numpy array and normalize
    img_array = np.array(image)
    img_array = img_array.astype('float32') / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def analyze_skin_cancer_prediction(prediction: Dict[str, float]) -> Dict[str, Any]:
    """Analyze the prediction results and provide detailed information."""
    # Get the class with highest probability
    predicted_class = max(prediction.items(), key=lambda x: x[1])
    confidence = predicted_class[1]
    class_name = predicted_class[0]
    
    # Determine risk level based on confidence
    risk_level = 'Low'
    if confidence >= RISK_LEVELS['High']:
        risk_level = 'High'
    elif confidence >= RISK_LEVELS['Medium']:
        risk_level = 'Medium'
    
    # Generate recommendations based on the prediction
    recommendations = []
    if class_name == 'mel' and confidence > 0.7:
        recommendations.append("Immediate consultation with a dermatologist is recommended")
        recommendations.append("Consider biopsy for confirmation")
    elif class_name in ['bcc', 'akiec']:
        recommendations.append("Schedule a dermatology appointment")
        recommendations.append("Monitor for changes in size or appearance")
    elif class_name == 'nv' and confidence > 0.8:
        recommendations.append("Regular monitoring recommended")
        recommendations.append("Follow ABCDE rule for self-examination")
    
    return {
        "type": SKIN_CANCER_CLASSES[class_name],
        "confidence": round(confidence * 100, 2),
        "risk_level": risk_level,
        "recommendations": recommendations,
        "class_code": class_name
    }

@router.post("/predict/skin")
async def predict_skin_cancer(request: Request, file: UploadFile = File(...)):
    """Endpoint for skin cancer prediction."""
    try:
        # Log request details
        logger.info("Received skin cancer prediction request")
        logger.info(f"File: {file.filename}, Content-Type: {file.content_type}")
        
        # Validate content type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Expected image/*, got {file.content_type}"
            )
        
        # Read file contents
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Open and validate image
        try:
            image = Image.open(io.BytesIO(contents))
        except Exception as e:
            logger.error(f"Failed to open image: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Preprocess image
        processed_image = preprocess_image(image)
        
        # Mock prediction (replace with actual model)
        mock_predictions = {
            'akiec': 0.05,
            'bcc': 0.10,
            'bkl': 0.15,
            'df': 0.05,
            'mel': 0.05,
            'nv': 0.55,
            'vasc': 0.05
        }
        
        # Analyze prediction
        result = analyze_skin_cancer_prediction(mock_predictions)
        
        # Convert processed image to base64
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return JSONResponse(content={
            "prediction": result,
            "processed_image": img_str
        })
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in skin cancer prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def analyze_genetic_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Analyze genetic data and provide risk assessment."""
    try:
        # Calculate risk score based on genetic markers
        risk_score = 0
        markers = df.columns.tolist()
        
        # Analyze specific genetic markers
        for marker in markers:
            if 'BRCA' in marker:
                risk_score += 0.3
            elif 'TP53' in marker:
                risk_score += 0.2
            elif 'EGFR' in marker:
                risk_score += 0.15
            elif 'KRAS' in marker:
                risk_score += 0.15
            elif 'PTEN' in marker:
                risk_score += 0.2
        
        # Normalize risk score
        risk_score = min(risk_score, 1.0)
        
        # Determine risk level
        if risk_score >= 0.7:
            risk_level = 'High'
        elif risk_score >= 0.4:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'
        
        # Generate findings
        findings = []
        if risk_score > 0.7:
            findings.append("High genetic predisposition to cancer")
            findings.append("Multiple high-risk genetic markers detected")
        elif risk_score > 0.4:
            findings.append("Moderate genetic risk factors present")
            findings.append("Some concerning genetic markers identified")
        else:
            findings.append("Low genetic risk factors")
            findings.append("No significant genetic markers detected")
        
        # Generate recommendations
        recommendations = []
        if risk_level == 'High':
            recommendations.append("Regular cancer screening recommended")
            recommendations.append("Consider genetic counseling")
            recommendations.append("Lifestyle modifications may be beneficial")
        elif risk_level == 'Medium':
            recommendations.append("Periodic screening recommended")
            recommendations.append("Monitor for any changes")
            recommendations.append("Maintain healthy lifestyle")
        else:
            recommendations.append("Regular health check-ups recommended")
            recommendations.append("Maintain healthy lifestyle")
        
        return {
            "risk_level": risk_level,
            "risk_score": round(risk_score * 100, 2),
            "findings": findings,
            "recommendations": recommendations,
            "markers_analyzed": len(markers)
        }
        
    except Exception as e:
        logger.error(f"Error in genetic data analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/genetic")
async def predict_genetic_cancer(file: UploadFile = File(...)):
    """Endpoint for genetic cancer prediction."""
    try:
        logger.info("Received genetic data file for analysis")
        
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        logger.info(f"Successfully read Excel file with {len(df)} rows and {len(df.columns)} columns")
        
        # Analyze genetic data
        result = analyze_genetic_data(df)
        logger.info(f"Completed genetic analysis with risk level: {result['risk_level']}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in genetic cancer prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 