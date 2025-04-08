from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
from PIL import Image
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import tensorflow as tf
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Accept"]}})

# Create a simple dummy model
def create_dummy_model():
    X = np.array([[30, 120, 70, 98.6, 98], 
                  [70, 180, 90, 102, 92],
                  [25, 110, 65, 97.5, 99]])
    y = np.array([0, 1, 2])  # stable, critical, recovered
    model = RandomForestClassifier(n_estimators=10, random_state=42)
    model.fit(X, y)
    return model

# Create the model
model = create_dummy_model()

# In-memory storage for patients (replace with database in production)
patients = []

@app.route('/patients', methods=['GET'])
def get_patients():
    try:
        return jsonify(patients)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/patients', methods=['POST'])
def add_patient():
    try:
        patient = request.get_json()
        if not patient:
            return jsonify({"error": "Invalid patient data"}), 400
        
        # Validate required fields
        if not patient.get('name') or not patient.get('age'):
            return jsonify({"error": "Name and age are required"}), 400
        
        # Generate a simple ID (use proper ID generation in production)
        patient['id'] = len(patients) + 1
        patient['created_at'] = datetime.now().isoformat()
        
        # Add default values if not provided
        patient.setdefault('status', 'active')
        patient.setdefault('condition', 'stable')
        patient.setdefault('vitals', {})
        
        # If vitals are provided, try to predict condition
        if patient.get('vitals'):
            try:
                patient['condition'] = predict_condition(patient)
            except Exception as e:
                print(f"Error predicting condition: {e}")
        
        patients.append(patient)
        return jsonify(patient), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    try:
        patient = next((p for p in patients if p['id'] == patient_id), None)
        if patient is None:
            return jsonify({"error": "Patient not found"}), 404
        return jsonify(patient)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    try:
        update_data = request.get_json()
        if not update_data:
            return jsonify({"error": "Invalid update data"}), 400
            
        patient = next((p for p in patients if p['id'] == patient_id), None)
        if patient is None:
            return jsonify({"error": "Patient not found"}), 404
        
        # Update patient data
        patient.update(update_data)
        return jsonify(patient)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/patients/<int:patient_id>/vitals', methods=['PUT'])
def update_vitals(patient_id):
    try:
        vitals = request.get_json()
        if not vitals:
            return jsonify({"error": "Invalid vitals data"}), 400
            
        patient = next((p for p in patients if p['id'] == patient_id), None)
        if patient is None:
            return jsonify({"error": "Patient not found"}), 404
        
        patient['vitals'] = vitals
        
        # Update condition based on new vitals
        try:
            patient['condition'] = predict_condition(patient)
        except Exception as e:
            print(f"Error predicting condition: {e}")
            
        return jsonify(patient)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def predict_condition(data):
    """Predict patient condition using machine learning"""
    try:
        # Convert data to numpy array and reshape
        vitals = data.get('vitals', {})
        features = np.array([
            float(data.get('age', 0)),
            float(vitals.get('blood_pressure', '120/80').split('/')[0]),
            float(vitals.get('blood_pressure', '120/80').split('/')[1]),
            float(vitals.get('temperature', 98.6)),
            float(vitals.get('heart_rate', 70))
        ]).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        # Map prediction to condition
        conditions = ['stable', 'critical', 'recovered']
        return conditions[int(prediction)]
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return 'stable'  # Default to stable if prediction fails

if __name__ == '__main__':
    # Add some sample data
    patients.append({
        "id": 1,
        "name": "John Doe",
        "age": 45,
        "status": "active",
        "condition": "stable",
        "created_at": datetime.now().isoformat(),
        "vitals": {
            "blood_pressure": "120/80",
            "heart_rate": 75,
            "temperature": 98.6
        }
    })
    
    print("Server running at http://127.0.0.1:5000")
    app.run(debug=True, port=5000) 