from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Hospital schemas
class HospitalBase(BaseModel):
    name: str

class HospitalCreate(HospitalBase):
    password: str

class Hospital(HospitalBase):
    id: int
    
    class Config:
        from_attributes = True

# Patient schemas
class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    status: Optional[str] = "active"
    condition: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    medical_history: Optional[str] = None
    existing_diseases: Optional[str] = None
    disease_diagnosed: Optional[str] = None

class PatientCreate(PatientBase):
    hospital_id: int

class Patient(PatientBase):
    id: int
    hospital_id: int
    
    class Config:
        from_attributes = True

# Vital Signs schemas
class VitalSignsBase(BaseModel):
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    oxygen_level: Optional[float] = None

class VitalSignsCreate(VitalSignsBase):
    patient_id: int

class VitalSigns(VitalSignsBase):
    id: int
    patient_id: int
    
    class Config:
        from_attributes = True

# Scan schemas
class ScanBase(BaseModel):
    about: str
    scan_type: Optional[str] = None
    
class ScanCreate(ScanBase):
    patient_id: int

class Scan(ScanBase):
    id: int
    date_uploaded: datetime
    file_path: str
    patient_id: int
    
    class Config:
        from_attributes = True

# Genetic Data schemas
class GeneticDataBase(BaseModel):
    dna_findings: Optional[str] = None
    risk_factors: Optional[str] = None
    family_history: Optional[Dict[str, Any]] = None
    genetic_markers: Optional[Dict[str, Any]] = None

class GeneticDataCreate(GeneticDataBase):
    patient_id: int

class GeneticData(GeneticDataBase):
    id: int
    file_path: str
    upload_date: datetime
    patient_id: int
    
    class Config:
        from_attributes = True

# Researcher schemas
class ResearcherBase(BaseModel):
    name: str
    purpose: str

class ResearcherCreate(ResearcherBase):
    password: str

class Researcher(ResearcherBase):
    id: int
    
    class Config:
        from_attributes = True
