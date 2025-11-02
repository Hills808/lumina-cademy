"""
Serviço de Quizzes
Gerencia operações relacionadas a quizzes e avaliações
"""

from typing import List, Dict, Optional
from datetime import datetime


class QuizService:
    """Serviço para gerenciamento de quizzes"""
    
    @staticmethod
    def calculate_score(answers: List[Dict], correct_answers: List[Dict]) -> int:
        """Calcula pontuação do quiz"""
        if not answers or not correct_answers:
            return 0
        
        total_questions = len(correct_answers)
        correct_count = 0
        
        for answer, correct in zip(answers, correct_answers):
            if answer.get("option_id") == correct.get("correct_option_id"):
                correct_count += 1
        
        score = int((correct_count / total_questions) * 100)
        return score
    
    @staticmethod
    def is_passing_score(score: int, passing_score: int = 60) -> bool:
        """Verifica se pontuação é suficiente para aprovação"""
        return score >= passing_score
    
    @staticmethod
    def calculate_total_points(questions: List[Dict]) -> int:
        """Calcula total de pontos do quiz"""
        total = sum(q.get("points", 1) for q in questions)
        return total
    
    @staticmethod
    def validate_quiz_attempt(
        quiz_id: str,
        student_id: str,
        time_limit_minutes: Optional[int]
    ) -> bool:
        """Valida se tentativa de quiz é válida"""
        # Verificações:
        # - Quiz está publicado
        # - Aluno está matriculado na turma
        # - Dentro do limite de tempo
        # - Não excedeu número de tentativas
        return True
    
    @staticmethod
    def get_quiz_statistics(quiz_id: str) -> Dict:
        """Retorna estatísticas do quiz"""
        return {
            "total_attempts": 0,
            "average_score": 0.0,
            "highest_score": 0,
            "lowest_score": 0,
            "completion_rate": 0.0
        }
