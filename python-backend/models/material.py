"""
Modelo de Material Didático
Define a estrutura de dados para materiais educacionais
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, HttpUrl


class MaterialBase(BaseModel):
    """Modelo base de material"""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    content: str


class MaterialCreate(MaterialBase):
    """Modelo para criação de material"""
    teacher_id: str
    class_id: str
    video_type: Optional[Literal["youtube", "vimeo"]] = None
    video_url: Optional[HttpUrl] = None


class MaterialResponse(MaterialBase):
    """Modelo de resposta de material"""
    id: str
    teacher_id: str
    class_id: str
    video_type: Optional[str] = None
    video_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
