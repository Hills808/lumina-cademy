"""
Modelo de Turma
Define a estrutura de dados para turmas do sistema
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ClassBase(BaseModel):
    """Modelo base de turma"""
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    code: str = Field(min_length=6, max_length=6)


class ClassCreate(ClassBase):
    """Modelo para criação de turma"""
    teacher_id: str


class ClassResponse(ClassBase):
    """Modelo de resposta de turma"""
    id: str
    teacher_id: str
    created_at: datetime
    updated_at: datetime
    student_count: int = 0

    class Config:
        from_attributes = True


class ClassEnrollment(BaseModel):
    """Modelo para matrícula em turma"""
    class_id: str
    student_id: str
    enrolled_at: datetime

    class Config:
        from_attributes = True
