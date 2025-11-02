"""
Modelo de Usuário
Define a estrutura de dados para usuários do sistema
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Modelo base de usuário"""
    email: EmailStr
    full_name: str
    role: Literal["student", "teacher"]


class UserCreate(UserBase):
    """Modelo para criação de usuário"""
    password: str = Field(min_length=6)


class UserResponse(UserBase):
    """Modelo de resposta de usuário"""
    id: str
    created_at: datetime
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Modelo para login de usuário"""
    email: EmailStr
    password: str
