"""
Scripts de Migração de Dados
Ferramentas para migração e transformação de dados
"""

import json
import csv
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib


class DataMigrationTool:
    """Ferramenta para migração de dados entre sistemas"""
    
    def __init__(self, source_format: str, target_format: str):
        self.source_format = source_format
        self.target_format = target_format
        self.migration_log = []
    
    def migrate_users(self, source_data: List[Dict]) -> List[Dict]:
        """Migra dados de usuários"""
        migrated_users = []
        
        for user in source_data:
            try:
                migrated_user = {
                    'id': self._generate_uuid(user.get('email', '')),
                    'email': user.get('email', '').lower().strip(),
                    'full_name': user.get('name', user.get('full_name', '')),
                    'role': self._normalize_role(user.get('type', user.get('role', 'student'))),
                    'created_at': self._parse_date(user.get('created_at', user.get('registration_date'))),
                    'avatar_url': user.get('avatar', user.get('profile_picture')),
                }
                
                migrated_users.append(migrated_user)
                self._log_success('user', user.get('email'))
                
            except Exception as e:
                self._log_error('user', user.get('email'), str(e))
        
        return migrated_users
    
    def migrate_classes(self, source_data: List[Dict], user_mapping: Dict) -> List[Dict]:
        """Migra dados de turmas"""
        migrated_classes = []
        
        for class_data in source_data:
            try:
                teacher_email = class_data.get('teacher_email', class_data.get('instructor'))
                teacher_id = user_mapping.get(teacher_email)
                
                if not teacher_id:
                    self._log_error('class', class_data.get('name'), 'Teacher not found')
                    continue
                
                migrated_class = {
                    'id': self._generate_uuid(class_data.get('name', '') + str(teacher_id)),
                    'name': class_data.get('name', class_data.get('title', '')),
                    'description': class_data.get('description', ''),
                    'code': self._generate_class_code(),
                    'teacher_id': teacher_id,
                    'created_at': self._parse_date(class_data.get('created_at')),
                }
                
                migrated_classes.append(migrated_class)
                self._log_success('class', class_data.get('name'))
                
            except Exception as e:
                self._log_error('class', class_data.get('name'), str(e))
        
        return migrated_classes
    
    def migrate_materials(self, source_data: List[Dict], mappings: Dict) -> List[Dict]:
        """Migra materiais didáticos"""
        migrated_materials = []
        
        for material in source_data:
            try:
                class_id = mappings['classes'].get(material.get('class_name'))
                teacher_id = mappings['teachers'].get(material.get('author'))
                
                if not class_id or not teacher_id:
                    self._log_error('material', material.get('title'), 'Missing references')
                    continue
                
                migrated_material = {
                    'id': self._generate_uuid(material.get('title', '') + str(class_id)),
                    'title': material.get('title', ''),
                    'description': material.get('description', material.get('summary', '')),
                    'content': material.get('content', material.get('body', '')),
                    'teacher_id': teacher_id,
                    'class_id': class_id,
                    'video_type': self._detect_video_type(material.get('video_url')),
                    'video_url': material.get('video_url'),
                    'created_at': self._parse_date(material.get('created_at')),
                }
                
                migrated_materials.append(migrated_material)
                self._log_success('material', material.get('title'))
                
            except Exception as e:
                self._log_error('material', material.get('title'), str(e))
        
        return migrated_materials
    
    def _generate_uuid(self, seed: str) -> str:
        """Gera UUID determinístico baseado em seed"""
        hash_obj = hashlib.md5(seed.encode())
        return hash_obj.hexdigest()[:8] + '-' + hash_obj.hexdigest()[8:12] + '-' + \
               hash_obj.hexdigest()[12:16] + '-' + hash_obj.hexdigest()[16:20] + '-' + \
               hash_obj.hexdigest()[20:32]
    
    def _normalize_role(self, role: str) -> str:
        """Normaliza papéis de usuário"""
        role_lower = role.lower().strip()
        
        if role_lower in ['teacher', 'professor', 'instructor', 'educator']:
            return 'teacher'
        elif role_lower in ['student', 'learner', 'pupil']:
            return 'student'
        else:
            return 'student'  # default
    
    def _parse_date(self, date_str: Optional[str]) -> str:
        """Parseia e formata datas"""
        if not date_str:
            return datetime.now().isoformat()
        
        try:
            # Tenta vários formatos
            formats = [
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%d',
                '%d/%m/%Y',
                '%d/%m/%Y %H:%M:%S',
            ]
            
            for fmt in formats:
                try:
                    dt = datetime.strptime(date_str, fmt)
                    return dt.isoformat()
                except ValueError:
                    continue
            
            return datetime.now().isoformat()
            
        except Exception:
            return datetime.now().isoformat()
    
    def _generate_class_code(self) -> str:
        """Gera código único de turma"""
        import random
        import string
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    def _detect_video_type(self, url: Optional[str]) -> Optional[str]:
        """Detecta tipo de vídeo pela URL"""
        if not url:
            return None
        
        if 'youtube.com' in url or 'youtu.be' in url:
            return 'youtube'
        elif 'vimeo.com' in url:
            return 'vimeo'
        else:
            return None
    
    def _log_success(self, entity_type: str, entity_name: str):
        """Registra migração bem-sucedida"""
        self.migration_log.append({
            'status': 'success',
            'type': entity_type,
            'name': entity_name,
            'timestamp': datetime.now().isoformat()
        })
    
    def _log_error(self, entity_type: str, entity_name: str, error: str):
        """Registra erro de migração"""
        self.migration_log.append({
            'status': 'error',
            'type': entity_type,
            'name': entity_name,
            'error': error,
            'timestamp': datetime.now().isoformat()
        })
    
    def export_migration_log(self, filepath: str):
        """Exporta log de migração"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.migration_log, f, indent=2, ensure_ascii=False)


class CSVImporter:
    """Importador de dados CSV"""
    
    @staticmethod
    def import_students_from_csv(filepath: str) -> List[Dict]:
        """Importa alunos de arquivo CSV"""
        students = []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                student = {
                    'email': row.get('email', row.get('Email', '')),
                    'full_name': row.get('name', row.get('Name', row.get('full_name', ''))),
                    'role': 'student'
                }
                
                students.append(student)
        
        return students
    
    @staticmethod
    def import_grades_from_csv(filepath: str) -> List[Dict]:
        """Importa notas de arquivo CSV"""
        grades = []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                grade = {
                    'student_email': row.get('student_email', row.get('Student Email', '')),
                    'quiz_title': row.get('quiz', row.get('Quiz', '')),
                    'score': float(row.get('score', row.get('Score', 0))),
                    'completed_at': row.get('date', row.get('Date', '')),
                }
                
                grades.append(grade)
        
        return grades


class JSONExporter:
    """Exportador de dados JSON"""
    
    @staticmethod
    def export_class_data(class_data: Dict, filepath: str):
        """Exporta dados de turma para JSON"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(class_data, f, indent=2, ensure_ascii=False)
    
    @staticmethod
    def export_student_progress(student_id: str, progress_data: Dict, filepath: str):
        """Exporta progresso do aluno"""
        export_data = {
            'student_id': student_id,
            'export_date': datetime.now().isoformat(),
            'progress': progress_data
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)


def batch_migrate_from_legacy_system(
    legacy_data_dir: str,
    output_dir: str
) -> Dict[str, Any]:
    """Executa migração completa de sistema legado"""
    
    print("Iniciando migração de dados...")
    
    migrator = DataMigrationTool('legacy', 'lumina')
    
    # Carrega dados legados
    with open(f"{legacy_data_dir}/users.json", 'r') as f:
        legacy_users = json.load(f)
    
    with open(f"{legacy_data_dir}/classes.json", 'r') as f:
        legacy_classes = json.load(f)
    
    # Migra usuários
    migrated_users = migrator.migrate_users(legacy_users)
    user_mapping = {u['email']: u['id'] for u in migrated_users}
    
    # Migra turmas
    migrated_classes = migrator.migrate_classes(legacy_classes, user_mapping)
    
    # Exporta dados migrados
    with open(f"{output_dir}/migrated_users.json", 'w') as f:
        json.dump(migrated_users, f, indent=2)
    
    with open(f"{output_dir}/migrated_classes.json", 'w') as f:
        json.dump(migrated_classes, f, indent=2)
    
    # Exporta log
    migrator.export_migration_log(f"{output_dir}/migration_log.json")
    
    print(f"Migração concluída!")
    print(f"- Usuários migrados: {len(migrated_users)}")
    print(f"- Turmas migradas: {len(migrated_classes)}")
    
    return {
        'users': migrated_users,
        'classes': migrated_classes,
        'log': migrator.migration_log
    }


if __name__ == "__main__":
    # Exemplo de uso
    print("Data Migration Tool - LUMINA")
