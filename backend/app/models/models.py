from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Table, Float, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import datetime

Base = declarative_base()

class Hospital(Base):
    __tablename__ = "hospitals"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    password = Column(String)
    
    patients = relationship("Patient", back_populates="hospital")

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    status = Column(String, default="active")  # active, inactive, etc.
    condition = Column(String)
    diagnosis = Column(String)
    treatment = Column(String)
    medical_history = Column(Text)
    existing_diseases = Column(String)  # keeping for backward compatibility
    disease_diagnosed = Column(String)  # keeping for backward compatibility
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    researcher_id = Column(Integer, ForeignKey("researchers.id"))
    is_active = Column(Boolean, default=True)
    
    hospital = relationship("Hospital", back_populates="patients")
    researcher = relationship("Researcher", back_populates="patients")
    scans = relationship("Scan", back_populates="patient")
    genetic_data = relationship("GeneticData", back_populates="patient")
    vitals = relationship("VitalSigns", back_populates="patient", uselist=False)
    skin_cancer_images = relationship("SkinCancerImage", back_populates="patient")

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(Integer, primary_key=True, index=True)
    about = Column(Text)
    date_uploaded = Column(DateTime, default=datetime.datetime.utcnow)
    file_path = Column(String)
    scan_type = Column(String)  # xray, mri, ct, etc.
    patient_id = Column(Integer, ForeignKey("patients.id"))
    
    patient = relationship("Patient", back_populates="scans")

class GeneticData(Base):
    __tablename__ = "genetic_data"
    
    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    analysis_result = Column(JSON)  # Store the analysis results including risk level and findings
    patient_id = Column(Integer, ForeignKey("patients.id"))
    
    patient = relationship("Patient", back_populates="genetic_data")

class Researcher(Base):
    __tablename__ = "researchers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    password = Column(String)
    purpose = Column(Text)
    patients = relationship("Patient", back_populates="researcher")

class VitalSigns(Base):
    __tablename__ = "vital_signs"
    
    id = Column(Integer, primary_key=True, index=True)
    blood_pressure = Column(String)
    heart_rate = Column(Integer)
    temperature = Column(Float)
    oxygen_level = Column(Float)
    patient_id = Column(Integer, ForeignKey("patients.id"), unique=True)
    
    patient = relationship("Patient", back_populates="vitals")

class SkinCancerImage(Base):
    __tablename__ = "skin_cancer_images"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    image_path = Column(String, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    prediction_result = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=True)
    lesion_type = Column(String, nullable=True)
    recommendations = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="skin_cancer_images")
