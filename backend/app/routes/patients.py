from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import os
import shutil
import json
from datetime import datetime
import pandas as pd
from ..database import get_db
from ..models import models, schemas
from ..services import patient_service
import io
from ..routes.ml import analyze_genetic_data

from ..models.schemas import Patient, PatientCreate, Scan, ScanCreate, GeneticData, GeneticDataCreate, VitalSigns, VitalSignsCreate
from ..models.models import Patient as PatientModel, Scan as ScanModel, GeneticData as GeneticDataModel, VitalSigns as VitalSignsModel, Hospital

router = APIRouter()

@router.post("/upload", response_model=List[schemas.Patient])
async def upload_patients(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Read the Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        patients = []
        for _, row in df.iterrows():
            # Convert row to dict and handle NaN values
            patient_data = row.to_dict()
            patient_data = {k: v for k, v in patient_data.items() if pd.notna(v)}
            
            # Create patient with default values for required fields
            patient = models.Patient(
                name=patient_data.get('name', 'Unknown'),
                age=patient_data.get('age', 0),
                gender=patient_data.get('gender', 'Unknown'),
                hospital_id=patient_data.get('hospital_id', 1),
                status=patient_data.get('status', 'active'),
                condition=patient_data.get('condition', ''),
                diagnosis=patient_data.get('diagnosis', ''),
                treatment=patient_data.get('treatment', ''),
                medical_history=patient_data.get('medical_history', '')
            )
            
            # Add vitals if present
            if any(key in patient_data for key in ['bloodPressure', 'heartRate', 'temperature', 'oxygenLevel']):
                patient.vitals = {
                    'bloodPressure': patient_data.get('bloodPressure', ''),
                    'heartRate': patient_data.get('heartRate', ''),
                    'temperature': patient_data.get('temperature', ''),
                    'oxygenLevel': patient_data.get('oxygenLevel', '')
                }
            
            # Add radiology data if present
            if any(key in patient_data for key in ['xRays', 'mriScans', 'ctScans']):
                patient.radiology = {
                    'xRays': patient_data.get('xRays', []),
                    'mriScans': patient_data.get('mriScans', []),
                    'ctScans': patient_data.get('ctScans', [])
                }
            
            # Add genetics data if present
            if any(key in patient_data for key in ['dnaAnalysis', 'familyHistory', 'geneticMarkers']):
                patient.genetics = {
                    'dnaAnalysis': patient_data.get('dnaAnalysis', {
                        'date': '',
                        'findings': '',
                        'riskFactors': []
                    }),
                    'familyHistory': patient_data.get('familyHistory', {
                        'conditions': [],
                        'relationships': []
                    }),
                    'geneticMarkers': patient_data.get('geneticMarkers', {
                        'tested': [],
                        'results': ''
                    })
                }
            
            db.add(patient)
            patients.append(patient)
        
        db.commit()
        for patient in patients:
            db.refresh(patient)
        
        return patients
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[schemas.Patient])
def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return patient_service.get_patients(db, skip=skip, limit=limit)

@router.get("/{patient_id}", response_model=schemas.Patient)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = patient_service.get_patient(db, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.post("/", response_model=schemas.Patient)
def create_patient(patient_data: dict = Body(...), db: Session = Depends(get_db)):
    try:
        # Create patient with default values for required fields
        patient = models.Patient(
            name=patient_data.get('name', 'Unknown'),
            age=patient_data.get('age', 0),
            gender=patient_data.get('gender', 'Unknown'),
            hospital_id=patient_data.get('hospital_id', 1),
            status=patient_data.get('status', 'active'),
            condition=patient_data.get('condition', ''),
            diagnosis=patient_data.get('diagnosis', ''),
            treatment=patient_data.get('treatment', ''),
            medical_history=patient_data.get('medical_history', '')
        )
        
        db.add(patient)
        db.commit()
        db.refresh(patient)
        
        # Add vitals if present
        if 'vitals' in patient_data:
            vitals_data = patient_data['vitals']
            vitals = models.VitalSigns(
                patient_id=patient.id,
                blood_pressure=vitals_data.get('bloodPressure', ''),
                heart_rate=vitals_data.get('heartRate', 0),
                temperature=vitals_data.get('temperature', 0.0),
                oxygen_level=vitals_data.get('oxygenLevel', 0.0)
            )
            db.add(vitals)
            db.commit()
        
        return patient
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{patient_id}", response_model=schemas.Patient)
def update_patient(patient_id: int, patient_data: dict = Body(...), db: Session = Depends(get_db)):
    try:
        patient = patient_service.get_patient(db, patient_id)
        if patient is None:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Update basic information
        for key, value in patient_data.items():
            if hasattr(patient, key):
                setattr(patient, key, value)
        
        # Update nested objects if present
        if 'vitals' in patient_data:
            patient.vitals = patient_data['vitals']
        if 'radiology' in patient_data:
            patient.radiology = patient_data['radiology']
        if 'genetics' in patient_data:
            patient.genetics = patient_data['genetics']
        
        db.commit()
        db.refresh(patient)
        return patient
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = patient_service.get_patient(db, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient_service.delete_patient(db, patient_id)

@router.post("/{patient_id}/vitals", response_model=VitalSigns)
def create_or_update_vitals(patient_id: int, vitals: VitalSignsCreate, db: Session = Depends(get_db)):
    # Verify patient exists
    db_patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Check if vitals already exist for this patient
    db_vitals = db.query(VitalSignsModel).filter(VitalSignsModel.patient_id == patient_id).first()
    
    if db_vitals:
        # Update existing vitals
        for key, value in vitals.dict(exclude={"patient_id"}).items():
            setattr(db_vitals, key, value)
    else:
        # Create new vitals
        db_vitals = VitalSignsModel(**vitals.dict())
        db.add(db_vitals)
    
    db.commit()
    db.refresh(db_vitals)
    return db_vitals

@router.post("/{patient_id}/scans", response_model=Scan)
def create_patient_scan(
    patient_id: int, 
    about: str = Form(...),
    scan_type: str = Form(...),
    scan_file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # Verify patient exists
    db_patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Save file
    file_location = f"uploads/scans/{patient_id}_{scan_file.filename}"
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(scan_file.file, buffer)
    
    # Create scan record
    db_scan = ScanModel(
        about=about,
        scan_type=scan_type,
        file_path=file_location,
        patient_id=patient_id
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan

@router.post("/{patient_id}/genetic")
async def upload_genetic_data(
    patient_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Verify patient exists
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
            
        # Validate file type
        if not file.filename.endswith(('.xls', '.xlsx')):
            raise HTTPException(status_code=400, detail="File must be an Excel file (.xls or .xlsx)")
            
        # Create genetic_data directory if it doesn't exist
        upload_dir = os.path.join("uploads", "genetic_data")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        new_filename = f"patient_{patient_id}_{timestamp}{file_extension}"
        file_path = os.path.join(upload_dir, new_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Read and analyze genetic data
        df = pd.read_excel(file_path)
        analysis_result = analyze_genetic_data(df)
        
        # Create or update genetic data record
        genetic_data = db.query(GeneticData).filter(GeneticData.patient_id == patient_id).first()
        if genetic_data:
            genetic_data.file_path = file_path
            genetic_data.upload_date = datetime.utcnow()
            genetic_data.analysis_result = analysis_result
        else:
            genetic_data = GeneticData(
                patient_id=patient_id,
                file_path=file_path,
                analysis_result=analysis_result
            )
            db.add(genetic_data)
            
        db.commit()
        
        return {
            "message": "Genetic data uploaded successfully",
            "analysis": analysis_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
