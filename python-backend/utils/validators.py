"""
Validadores
Funções utilitárias para validação de dados
"""

import re
from typing import Optional


def validate_email(email: str) -> bool:
    """Valida formato de email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Valida força da senha
    Returns: (is_valid, error_message)
    """
    if len(password) < 6:
        return False, "Senha deve ter pelo menos 6 caracteres"
    
    if len(password) > 100:
        return False, "Senha muito longa"
    
    return True, None


def validate_name(name: str) -> tuple[bool, Optional[str]]:
    """Valida nome completo"""
    if not name or len(name.strip()) < 2:
        return False, "Nome muito curto"
    
    if len(name) > 100:
        return False, "Nome muito longo"
    
    if not all(c.isalpha() or c.isspace() for c in name):
        return False, "Nome deve conter apenas letras"
    
    return True, None


def sanitize_input(text: str) -> str:
    """Remove caracteres potencialmente perigosos"""
    # Remove caracteres especiais para prevenir SQL injection
    text = text.strip()
    text = re.sub(r'[<>\"\'%;()&+]', '', text)
    return text


def validate_uuid(uuid_string: str) -> bool:
    """Valida formato UUID"""
    pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    return bool(re.match(pattern, uuid_string.lower()))
