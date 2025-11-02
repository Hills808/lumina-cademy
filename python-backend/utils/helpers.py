"""
Helpers
Funções utilitárias gerais
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict


def format_datetime(dt: datetime, format_string: str = "%d/%m/%Y %H:%M") -> str:
    """Formata datetime para string"""
    return dt.strftime(format_string)


def parse_datetime(date_string: str, format_string: str = "%d/%m/%Y %H:%M") -> Optional[datetime]:
    """Converte string para datetime"""
    try:
        return datetime.strptime(date_string, format_string)
    except ValueError:
        return None


def calculate_time_difference(start: datetime, end: datetime) -> Dict[str, int]:
    """Calcula diferença entre duas datas"""
    diff = end - start
    
    days = diff.days
    hours, remainder = divmod(diff.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    return {
        "days": days,
        "hours": hours,
        "minutes": minutes,
        "seconds": seconds
    }


def chunk_list(items: List, chunk_size: int) -> List[List]:
    """Divide lista em chunks menores"""
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]


def calculate_percentage(part: float, whole: float) -> float:
    """Calcula porcentagem"""
    if whole == 0:
        return 0.0
    return round((part / whole) * 100, 2)


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Trunca texto para tamanho máximo"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix
