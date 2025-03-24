from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.models import Patient

def get_patients(db: Session, skip: int = 0, limit: int = 100) -> List[Patient]:
    return db.query(Patient).offset(skip).limit(limit).all()

def get_patient(db: Session, patient_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.id == patient_id).first()

def delete_patient(db: Session, patient_id: int) -> bool:
    patient = get_patient(db, patient_id)
    if patient:
        db.delete(patient)
        db.commit()
        return True
    return False 