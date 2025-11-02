"""
Sistema de Recomendações com IA
Recomendações personalizadas de conteúdo e estudo
"""

from typing import List, Dict, Tuple, Optional
import math
from collections import defaultdict
from datetime import datetime, timedelta


class ContentRecommendationEngine:
    """Motor de recomendação de conteúdo educacional"""
    
    def __init__(self):
        self.user_profiles = {}
        self.content_metadata = {}
        self.interaction_history = []
    
    def calculate_content_similarity(
        self, 
        content1: Dict, 
        content2: Dict
    ) -> float:
        """Calcula similaridade entre dois conteúdos"""
        # Similaridade baseada em tags
        tags1 = set(content1.get('tags', []))
        tags2 = set(content2.get('tags', []))
        
        if not tags1 or not tags2:
            return 0.0
        
        intersection = tags1.intersection(tags2)
        union = tags1.union(tags2)
        
        jaccard_similarity = len(intersection) / len(union)
        
        # Considera também a dificuldade
        difficulty_diff = abs(
            content1.get('difficulty', 5) - content2.get('difficulty', 5)
        )
        difficulty_similarity = 1 - (difficulty_diff / 10)
        
        # Combina métricas
        final_similarity = (jaccard_similarity * 0.7 + difficulty_similarity * 0.3)
        
        return round(final_similarity, 3)
    
    def collaborative_filtering(
        self, 
        user_id: str, 
        all_users_interactions: Dict
    ) -> List[str]:
        """Filtragem colaborativa para recomendações"""
        user_items = set(all_users_interactions.get(user_id, []))
        
        # Encontra usuários similares
        similar_users = []
        for other_user_id, other_items in all_users_interactions.items():
            if other_user_id == user_id:
                continue
            
            other_items_set = set(other_items)
            
            # Calcula similaridade usando Jaccard
            if user_items:
                similarity = len(user_items.intersection(other_items_set)) / \
                           len(user_items.union(other_items_set))
                
                if similarity > 0.3:  # Threshold de similaridade
                    similar_users.append((other_user_id, similarity))
        
        # Ordena por similaridade
        similar_users.sort(key=lambda x: x[1], reverse=True)
        
        # Recomenda itens que usuários similares consumiram
        recommendations = set()
        for similar_user_id, _ in similar_users[:5]:  # Top 5 similares
            similar_user_items = set(all_users_interactions[similar_user_id])
            new_items = similar_user_items - user_items
            recommendations.update(new_items)
        
        return list(recommendations)[:10]  # Top 10 recomendações
    
    def content_based_filtering(
        self, 
        user_id: str, 
        user_history: List[Dict],
        all_content: List[Dict]
    ) -> List[str]:
        """Filtragem baseada em conteúdo"""
        # Constrói perfil do usuário baseado em histórico
        user_tags = defaultdict(int)
        user_difficulties = []
        
        for interaction in user_history:
            content_id = interaction['content_id']
            
            # Busca metadados do conteúdo
            content = next(
                (c for c in all_content if c['id'] == content_id), 
                None
            )
            
            if content:
                for tag in content.get('tags', []):
                    user_tags[tag] += interaction.get('rating', 3)
                
                user_difficulties.append(content.get('difficulty', 5))
        
        # Calcula dificuldade média preferida
        avg_difficulty = sum(user_difficulties) / len(user_difficulties) \
                        if user_difficulties else 5
        
        # Pontua todos os conteúdos
        scored_content = []
        consumed_ids = {item['content_id'] for item in user_history}
        
        for content in all_content:
            if content['id'] in consumed_ids:
                continue
            
            score = 0
            
            # Pontuação por tags
            for tag in content.get('tags', []):
                score += user_tags.get(tag, 0)
            
            # Penaliza se a dificuldade é muito diferente
            difficulty_diff = abs(content.get('difficulty', 5) - avg_difficulty)
            score -= difficulty_diff * 2
            
            scored_content.append((content['id'], score))
        
        # Ordena por pontuação
        scored_content.sort(key=lambda x: x[1], reverse=True)
        
        return [content_id for content_id, _ in scored_content[:10]]
    
    def hybrid_recommendation(
        self,
        user_id: str,
        user_history: List[Dict],
        all_users_interactions: Dict,
        all_content: List[Dict],
        weights: Dict = None
    ) -> List[Tuple[str, float]]:
        """Sistema híbrido de recomendação"""
        if weights is None:
            weights = {'collaborative': 0.4, 'content': 0.6}
        
        # Recomendações colaborativas
        collab_recs = set(
            self.collaborative_filtering(user_id, all_users_interactions)
        )
        
        # Recomendações baseadas em conteúdo
        content_recs = set(
            self.content_based_filtering(user_id, user_history, all_content)
        )
        
        # Combina recomendações
        all_recs = collab_recs.union(content_recs)
        
        # Calcula pontuação final
        final_scores = []
        for rec_id in all_recs:
            collab_score = 1.0 if rec_id in collab_recs else 0.0
            content_score = 1.0 if rec_id in content_recs else 0.0
            
            final_score = (
                collab_score * weights['collaborative'] +
                content_score * weights['content']
            )
            
            final_scores.append((rec_id, final_score))
        
        # Ordena por pontuação final
        final_scores.sort(key=lambda x: x[1], reverse=True)
        
        return final_scores[:10]


class StudyPathOptimizer:
    """Otimizador de trilhas de aprendizado"""
    
    @staticmethod
    def calculate_prerequisite_chain(
        content_id: str, 
        prerequisites_map: Dict[str, List[str]]
    ) -> List[str]:
        """Calcula cadeia de pré-requisitos"""
        chain = []
        visited = set()
        
        def dfs(current_id: str):
            if current_id in visited:
                return
            
            visited.add(current_id)
            
            prereqs = prerequisites_map.get(current_id, [])
            for prereq in prereqs:
                dfs(prereq)
            
            chain.append(current_id)
        
        dfs(content_id)
        return chain
    
    @staticmethod
    def optimize_study_schedule(
        materials: List[Dict],
        available_hours_per_day: int,
        deadline_days: int
    ) -> List[Dict]:
        """Otimiza cronograma de estudos"""
        total_hours_available = available_hours_per_day * deadline_days
        total_hours_needed = sum(m['estimated_hours'] for m in materials)
        
        if total_hours_needed > total_hours_available:
            # Prioriza por importância e dificuldade
            materials.sort(
                key=lambda x: (x.get('importance', 5), -x.get('difficulty', 5)),
                reverse=True
            )
        
        schedule = []
        current_day = 1
        hours_today = 0
        
        for material in materials:
            hours_needed = material['estimated_hours']
            
            while hours_needed > 0:
                if hours_today >= available_hours_per_day:
                    current_day += 1
                    hours_today = 0
                
                if current_day > deadline_days:
                    break
                
                hours_to_allocate = min(
                    hours_needed,
                    available_hours_per_day - hours_today
                )
                
                schedule.append({
                    'material_id': material['id'],
                    'material_title': material['title'],
                    'day': current_day,
                    'hours': hours_to_allocate,
                    'start_hour': 9 + hours_today  # Começa às 9h
                })
                
                hours_needed -= hours_to_allocate
                hours_today += hours_to_allocate
        
        return schedule
    
    @staticmethod
    def suggest_review_intervals(
        last_studied: datetime,
        mastery_level: float
    ) -> datetime:
        """Sugere próxima revisão usando repetição espaçada"""
        # Algoritmo baseado em spaced repetition
        base_interval = 1  # dias
        
        if mastery_level >= 0.9:
            multiplier = 7
        elif mastery_level >= 0.7:
            multiplier = 3
        elif mastery_level >= 0.5:
            multiplier = 2
        else:
            multiplier = 1
        
        next_review = last_studied + timedelta(days=base_interval * multiplier)
        
        return next_review


class PersonalizedLearningPath:
    """Gerador de trilhas personalizadas"""
    
    def __init__(self, student_profile: Dict):
        self.profile = student_profile
        self.learning_style = student_profile.get('learning_style', 'visual')
        self.pace = student_profile.get('pace', 'moderate')
    
    def generate_adaptive_path(
        self,
        target_skills: List[str],
        current_skills: Dict[str, float],
        available_content: List[Dict]
    ) -> List[Dict]:
        """Gera trilha adaptativa de aprendizado"""
        path = []
        
        for skill in target_skills:
            current_level = current_skills.get(skill, 0.0)
            
            if current_level >= 0.8:
                continue  # Já domina o skill
            
            # Filtra conteúdo relevante
            relevant_content = [
                content for content in available_content
                if skill in content.get('skills_taught', [])
            ]
            
            # Ordena por adequação ao nível atual
            relevant_content.sort(
                key=lambda x: abs(x.get('required_level', 0) - current_level)
            )
            
            # Adiciona à trilha
            for content in relevant_content[:3]:  # Top 3 mais adequados
                path.append({
                    'content_id': content['id'],
                    'skill_target': skill,
                    'current_level': current_level,
                    'target_level': min(current_level + 0.3, 1.0),
                    'estimated_hours': content.get('duration', 2),
                    'learning_style_match': self._check_style_match(content)
                })
        
        return path
    
    def _check_style_match(self, content: Dict) -> float:
        """Verifica compatibilidade com estilo de aprendizado"""
        content_type = content.get('type', 'text')
        
        style_matches = {
            'visual': {'video': 1.0, 'infographic': 0.9, 'text': 0.5},
            'auditory': {'audio': 1.0, 'video': 0.8, 'text': 0.6},
            'kinesthetic': {'interactive': 1.0, 'quiz': 0.9, 'video': 0.7}
        }
        
        matches = style_matches.get(self.learning_style, {})
        return matches.get(content_type, 0.5)


if __name__ == "__main__":
    # Exemplo de uso
    engine = ContentRecommendationEngine()
    
    sample_content1 = {
        'id': 'c1',
        'tags': ['matematica', 'algebra', 'basico'],
        'difficulty': 3
    }
    
    sample_content2 = {
        'id': 'c2',
        'tags': ['matematica', 'geometria', 'basico'],
        'difficulty': 3
    }
    
    similarity = engine.calculate_content_similarity(sample_content1, sample_content2)
    print(f"Similaridade entre conteúdos: {similarity}")
