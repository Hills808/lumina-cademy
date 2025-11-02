"""
Análise de Dados Educacionais
Script para análise estatística de desempenho dos alunos
"""

import statistics
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
import json


class StudentPerformanceAnalyzer:
    """Analisador de desempenho estudantil"""
    
    def __init__(self, student_data: List[Dict]):
        self.student_data = student_data
        self.results = {}
    
    def calculate_average_score(self, student_id: str) -> float:
        """Calcula média de pontuação do aluno"""
        scores = [
            attempt['score'] 
            for attempt in self.student_data 
            if attempt['student_id'] == student_id
        ]
        
        if not scores:
            return 0.0
        
        return statistics.mean(scores)
    
    def calculate_median_score(self, student_id: str) -> float:
        """Calcula mediana de pontuação do aluno"""
        scores = [
            attempt['score'] 
            for attempt in self.student_data 
            if attempt['student_id'] == student_id
        ]
        
        if not scores:
            return 0.0
        
        return statistics.median(scores)
    
    def calculate_standard_deviation(self, student_id: str) -> float:
        """Calcula desvio padrão das pontuações"""
        scores = [
            attempt['score'] 
            for attempt in self.student_data 
            if attempt['student_id'] == student_id
        ]
        
        if len(scores) < 2:
            return 0.0
        
        return statistics.stdev(scores)
    
    def identify_struggling_students(self, threshold: float = 60.0) -> List[str]:
        """Identifica alunos com dificuldades"""
        struggling = []
        
        student_ids = set(item['student_id'] for item in self.student_data)
        
        for student_id in student_ids:
            avg_score = self.calculate_average_score(student_id)
            if avg_score < threshold:
                struggling.append(student_id)
        
        return struggling
    
    def calculate_improvement_rate(self, student_id: str) -> float:
        """Calcula taxa de melhoria do aluno ao longo do tempo"""
        attempts = [
            attempt 
            for attempt in self.student_data 
            if attempt['student_id'] == student_id
        ]
        
        if len(attempts) < 2:
            return 0.0
        
        # Ordena por data
        attempts.sort(key=lambda x: x['completed_at'])
        
        first_score = attempts[0]['score']
        last_score = attempts[-1]['score']
        
        if first_score == 0:
            return 0.0
        
        improvement = ((last_score - first_score) / first_score) * 100
        return round(improvement, 2)
    
    def generate_class_statistics(self, class_id: str) -> Dict:
        """Gera estatísticas completas da turma"""
        class_attempts = [
            attempt 
            for attempt in self.student_data 
            if attempt.get('class_id') == class_id
        ]
        
        if not class_attempts:
            return {}
        
        scores = [attempt['score'] for attempt in class_attempts]
        
        return {
            'total_attempts': len(class_attempts),
            'average_score': round(statistics.mean(scores), 2),
            'median_score': statistics.median(scores),
            'min_score': min(scores),
            'max_score': max(scores),
            'std_deviation': round(statistics.stdev(scores), 2) if len(scores) > 1 else 0,
            'passing_rate': len([s for s in scores if s >= 60]) / len(scores) * 100
        }
    
    def predict_student_success(self, student_id: str) -> Tuple[str, float]:
        """Prediz probabilidade de sucesso do aluno"""
        avg_score = self.calculate_average_score(student_id)
        improvement_rate = self.calculate_improvement_rate(student_id)
        
        # Algoritmo simples de predição
        success_probability = (avg_score * 0.7 + improvement_rate * 0.3)
        
        if success_probability >= 80:
            prediction = "Alto potencial de sucesso"
        elif success_probability >= 60:
            prediction = "Bom potencial de sucesso"
        elif success_probability >= 40:
            prediction = "Potencial moderado - necessita apoio"
        else:
            prediction = "Necessita intervenção urgente"
        
        return prediction, round(success_probability, 2)


class LearningTrendsAnalyzer:
    """Analisador de tendências de aprendizado"""
    
    @staticmethod
    def analyze_peak_study_times(activity_data: List[Dict]) -> Dict[int, int]:
        """Analisa horários de pico de estudo"""
        hourly_activity = {hour: 0 for hour in range(24)}
        
        for activity in activity_data:
            timestamp = datetime.fromisoformat(activity['timestamp'])
            hour = timestamp.hour
            hourly_activity[hour] += 1
        
        return hourly_activity
    
    @staticmethod
    def calculate_engagement_score(
        login_count: int,
        material_views: int,
        quiz_attempts: int,
        days_active: int
    ) -> float:
        """Calcula score de engajamento"""
        if days_active == 0:
            return 0.0
        
        # Pesos para cada métrica
        weights = {
            'login': 0.2,
            'material': 0.3,
            'quiz': 0.4,
            'consistency': 0.1
        }
        
        # Normaliza valores
        normalized_login = min(login_count / 30, 1)  # 30 logins/mês = 100%
        normalized_material = min(material_views / 50, 1)  # 50 visualizações = 100%
        normalized_quiz = min(quiz_attempts / 20, 1)  # 20 tentativas = 100%
        normalized_consistency = min(days_active / 30, 1)  # 30 dias = 100%
        
        engagement_score = (
            normalized_login * weights['login'] +
            normalized_material * weights['material'] +
            normalized_quiz * weights['quiz'] +
            normalized_consistency * weights['consistency']
        ) * 100
        
        return round(engagement_score, 2)
    
    @staticmethod
    def identify_content_gaps(completion_data: List[Dict]) -> List[str]:
        """Identifica lacunas no conteúdo estudado"""
        all_materials = set(item['material_id'] for item in completion_data)
        
        completion_rates = {}
        for material_id in all_materials:
            material_attempts = [
                item for item in completion_data 
                if item['material_id'] == material_id
            ]
            
            completed = len([
                item for item in material_attempts 
                if item.get('completed', False)
            ])
            
            total = len(material_attempts)
            completion_rates[material_id] = (completed / total) * 100 if total > 0 else 0
        
        # Materiais com taxa de conclusão abaixo de 30%
        gaps = [
            material_id 
            for material_id, rate in completion_rates.items() 
            if rate < 30
        ]
        
        return gaps


def generate_comprehensive_report(student_id: str, data: Dict) -> str:
    """Gera relatório completo de desempenho"""
    report = f"""
    ==========================================
    RELATÓRIO DE DESEMPENHO - LUMINA
    ==========================================
    
    Aluno ID: {student_id}
    Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}
    
    MÉTRICAS DE DESEMPENHO:
    - Média Geral: {data.get('average_score', 0):.2f}
    - Mediana: {data.get('median_score', 0):.2f}
    - Desvio Padrão: {data.get('std_deviation', 0):.2f}
    - Taxa de Melhoria: {data.get('improvement_rate', 0):.2f}%
    
    ENGAJAMENTO:
    - Score de Engajamento: {data.get('engagement_score', 0):.2f}
    - Total de Atividades: {data.get('total_activities', 0)}
    - Dias Ativos: {data.get('days_active', 0)}
    
    PREDIÇÃO:
    {data.get('prediction', 'N/A')}
    
    RECOMENDAÇÕES:
    {chr(10).join('- ' + rec for rec in data.get('recommendations', []))}
    
    ==========================================
    """
    
    return report


if __name__ == "__main__":
    # Exemplo de uso
    sample_data = [
        {
            'student_id': 'student1',
            'class_id': 'class1',
            'score': 75,
            'completed_at': '2024-01-15T10:00:00'
        },
        {
            'student_id': 'student1',
            'class_id': 'class1',
            'score': 82,
            'completed_at': '2024-01-20T14:30:00'
        }
    ]
    
    analyzer = StudentPerformanceAnalyzer(sample_data)
    avg = analyzer.calculate_average_score('student1')
    print(f"Média do aluno: {avg}")
