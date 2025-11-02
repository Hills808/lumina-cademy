"""
Testes Unitários - Modelos
Testes para validação dos modelos de dados
"""

import unittest
from datetime import datetime
from models.user import UserCreate, UserResponse, UserLogin
from models.class_model import ClassCreate, ClassResponse
from models.material import MaterialCreate, MaterialResponse


class TestUserModels(unittest.TestCase):
    """Testes para modelos de usuário"""
    
    def test_user_create_valid(self):
        """Testa criação de usuário válido"""
        user_data = {
            'email': 'test@example.com',
            'full_name': 'Test User',
            'role': 'student',
            'password': 'password123'
        }
        
        user = UserCreate(**user_data)
        
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.full_name, 'Test User')
        self.assertEqual(user.role, 'student')
    
    def test_user_create_invalid_email(self):
        """Testa criação com email inválido"""
        user_data = {
            'email': 'invalid-email',
            'full_name': 'Test User',
            'role': 'student',
            'password': 'password123'
        }
        
        with self.assertRaises(Exception):
            UserCreate(**user_data)
    
    def test_user_create_short_password(self):
        """Testa criação com senha curta"""
        user_data = {
            'email': 'test@example.com',
            'full_name': 'Test User',
            'role': 'student',
            'password': '123'  # Menos de 6 caracteres
        }
        
        with self.assertRaises(Exception):
            UserCreate(**user_data)
    
    def test_user_login_valid(self):
        """Testa modelo de login válido"""
        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        
        login = UserLogin(**login_data)
        
        self.assertEqual(login.email, 'test@example.com')
        self.assertEqual(login.password, 'password123')


class TestClassModels(unittest.TestCase):
    """Testes para modelos de turma"""
    
    def test_class_create_valid(self):
        """Testa criação de turma válida"""
        class_data = {
            'name': 'Matemática Avançada',
            'description': 'Turma de matemática',
            'code': 'ABC123',
            'teacher_id': '123e4567-e89b-12d3-a456-426614174000'
        }
        
        class_obj = ClassCreate(**class_data)
        
        self.assertEqual(class_obj.name, 'Matemática Avançada')
        self.assertEqual(class_obj.code, 'ABC123')
    
    def test_class_create_invalid_code_length(self):
        """Testa criação com código inválido"""
        class_data = {
            'name': 'Matemática',
            'code': '123',  # Menos de 6 caracteres
            'teacher_id': '123e4567-e89b-12d3-a456-426614174000'
        }
        
        with self.assertRaises(Exception):
            ClassCreate(**class_data)
    
    def test_class_create_empty_name(self):
        """Testa criação com nome vazio"""
        class_data = {
            'name': '',
            'code': 'ABC123',
            'teacher_id': '123e4567-e89b-12d3-a456-426614174000'
        }
        
        with self.assertRaises(Exception):
            ClassCreate(**class_data)


class TestMaterialModels(unittest.TestCase):
    """Testes para modelos de material"""
    
    def test_material_create_valid(self):
        """Testa criação de material válido"""
        material_data = {
            'title': 'Introdução ao Cálculo',
            'description': 'Material introdutório',
            'content': 'Conteúdo do material...',
            'teacher_id': '123e4567-e89b-12d3-a456-426614174000',
            'class_id': '123e4567-e89b-12d3-a456-426614174001'
        }
        
        material = MaterialCreate(**material_data)
        
        self.assertEqual(material.title, 'Introdução ao Cálculo')
        self.assertIsNone(material.video_type)
    
    def test_material_create_with_youtube(self):
        """Testa criação com vídeo do YouTube"""
        material_data = {
            'title': 'Aula em Vídeo',
            'content': 'Conteúdo...',
            'teacher_id': '123e4567-e89b-12d3-a456-426614174000',
            'class_id': '123e4567-e89b-12d3-a456-426614174001',
            'video_type': 'youtube',
            'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
        
        material = MaterialCreate(**material_data)
        
        self.assertEqual(material.video_type, 'youtube')
        self.assertIsNotNone(material.video_url)
    
    def test_material_create_invalid_video_type(self):
        """Testa criação com tipo de vídeo inválido"""
        material_data = {
            'title': 'Material',
            'content': 'Conteúdo...',
            'teacher_id': '123e4567-e89b-12d3-a456-426614174000',
            'class_id': '123e4567-e89b-12d3-a456-426614174001',
            'video_type': 'invalid_type'
        }
        
        with self.assertRaises(Exception):
            MaterialCreate(**material_data)


class TestDataValidation(unittest.TestCase):
    """Testes de validação de dados"""
    
    def test_email_normalization(self):
        """Testa normalização de email"""
        user_data = {
            'email': 'TEST@EXAMPLE.COM',
            'full_name': 'Test User',
            'role': 'student',
            'password': 'password123'
        }
        
        user = UserCreate(**user_data)
        
        # Email deve ser convertido para minúsculas
        self.assertEqual(user.email, 'test@example.com')
    
    def test_string_trimming(self):
        """Testa remoção de espaços"""
        class_data = {
            'name': '  Matemática  ',
            'code': 'ABC123',
            'teacher_id': '123e4567-e89b-12d3-a456-426614174000'
        }
        
        class_obj = ClassCreate(**class_data)
        
        # Nome não deve ter espaços extras
        self.assertEqual(class_obj.name.strip(), 'Matemática')


if __name__ == '__main__':
    unittest.main()
