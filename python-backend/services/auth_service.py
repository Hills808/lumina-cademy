"""
Serviço de Autenticação
Gerencia login, registro e autenticação de usuários
"""

from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt


class AuthService:
    """Serviço de autenticação de usuários"""
    
    SECRET_KEY = "your-secret-key-here"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Gera hash da senha"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifica se a senha está correta"""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    @classmethod
    def create_access_token(cls, user_id: str, email: str) -> str:
        """Cria token JWT de acesso"""
        expire = datetime.utcnow() + timedelta(minutes=cls.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        payload = {
            "sub": user_id,
            "email": email,
            "exp": expire
        }
        
        token = jwt.encode(payload, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        return token
    
    @classmethod
    def decode_token(cls, token: str) -> Optional[dict]:
        """Decodifica e valida token JWT"""
        try:
            payload = jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.JWTError:
            return None
