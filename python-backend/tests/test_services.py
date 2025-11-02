"""
Testes Unitários - Serviços
Testes para lógica de negócio
"""

import unittest
from services.auth_service import AuthService
from services.class_service import ClassService
from services.quiz_service import QuizService


class TestAuthService(unittest.TestCase):
    """Testes para serviço de autenticação"""
    
    def test_hash_password(self):
        """Testa hash de senha"""
        password = "password123"
        hashed = AuthService.hash_password(password)
        
        self.assertIsNotNone(hashed)
        self.assertNotEqual(password, hashed)
        self.assertTrue(len(hashed) > 20)
    
    def test_verify_password_correct(self):
        """Testa verificação de senha correta"""
        password = "password123"
        hashed = AuthService.hash_password(password)
        
        result = AuthService.verify_password(password, hashed)
        
        self.assertTrue(result)
    
    def test_verify_password_incorrect(self):
        """Testa verificação de senha incorreta"""
        password = "password123"
        wrong_password = "wrongpassword"
        hashed = AuthService.hash_password(password)
        
        result = AuthService.verify_password(wrong_password, hashed)
        
        self.assertFalse(result)
    
    def test_create_access_token(self):
        """Testa criação de token JWT"""
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        email = "test@example.com"
        
        token = AuthService.create_access_token(user_id, email)
        
        self.assertIsNotNone(token)
        self.assertTrue(len(token) > 20)
    
    def test_decode_valid_token(self):
        """Testa decodificação de token válido"""
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        email = "test@example.com"
        
        token = AuthService.create_access_token(user_id, email)
        payload = AuthService.decode_token(token)
        
        self.assertIsNotNone(payload)
        self.assertEqual(payload['sub'], user_id)
        self.assertEqual(payload['email'], email)
    
    def test_decode_invalid_token(self):
        """Testa decodificação de token inválido"""
        invalid_token = "invalid.token.here"
        
        payload = AuthService.decode_token(invalid_token)
        
        self.assertIsNone(payload)


class TestClassService(unittest.TestCase):
    """Testes para serviço de turmas"""
    
    def test_generate_class_code(self):
        """Testa geração de código de turma"""
        code = ClassService.generate_class_code()
        
        self.assertIsNotNone(code)
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isupper())
        self.assertTrue(code.isalnum())
    
    def test_validate_class_code_valid(self):
        """Testa validação de código válido"""
        valid_code = "ABC123"
        
        result = ClassService.validate_class_code(valid_code)
        
        self.assertTrue(result)
    
    def test_validate_class_code_too_short(self):
        """Testa validação de código curto"""
        short_code = "AB12"
        
        result = ClassService.validate_class_code(short_code)
        
        self.assertFalse(result)
    
    def test_validate_class_code_too_long(self):
        """Testa validação de código longo"""
        long_code = "ABC1234"
        
        result = ClassService.validate_class_code(long_code)
        
        self.assertFalse(result)
    
    def test_validate_class_code_lowercase(self):
        """Testa validação de código com minúsculas"""
        lowercase_code = "abc123"
        
        result = ClassService.validate_class_code(lowercase_code)
        
        self.assertFalse(result)
    
    def test_can_enroll_student(self):
        """Testa verificação de matrícula"""
        class_id = "123e4567-e89b-12d3-a456-426614174000"
        student_id = "123e4567-e89b-12d3-a456-426614174001"
        
        # Por padrão retorna True (implementação simplificada)
        result = ClassService.can_enroll_student(class_id, student_id)
        
        self.assertTrue(result)


class TestQuizService(unittest.TestCase):
    """Testes para serviço de quizzes"""
    
    def test_calculate_score_perfect(self):
        """Testa cálculo de pontuação perfeita"""
        answers = [
            {'question_id': '1', 'option_id': 'a'},
            {'question_id': '2', 'option_id': 'b'},
        ]
        
        correct_answers = [
            {'question_id': '1', 'correct_option_id': 'a'},
            {'question_id': '2', 'correct_option_id': 'b'},
        ]
        
        score = QuizService.calculate_score(answers, correct_answers)
        
        self.assertEqual(score, 100)
    
    def test_calculate_score_partial(self):
        """Testa cálculo de pontuação parcial"""
        answers = [
            {'question_id': '1', 'option_id': 'a'},
            {'question_id': '2', 'option_id': 'x'},  # Incorreta
        ]
        
        correct_answers = [
            {'question_id': '1', 'correct_option_id': 'a'},
            {'question_id': '2', 'correct_option_id': 'b'},
        ]
        
        score = QuizService.calculate_score(answers, correct_answers)
        
        self.assertEqual(score, 50)
    
    def test_calculate_score_zero(self):
        """Testa cálculo de pontuação zero"""
        answers = [
            {'question_id': '1', 'option_id': 'x'},
            {'question_id': '2', 'option_id': 'y'},
        ]
        
        correct_answers = [
            {'question_id': '1', 'correct_option_id': 'a'},
            {'question_id': '2', 'correct_option_id': 'b'},
        ]
        
        score = QuizService.calculate_score(answers, correct_answers)
        
        self.assertEqual(score, 0)
    
    def test_is_passing_score_pass(self):
        """Testa verificação de aprovação"""
        score = 75
        
        result = QuizService.is_passing_score(score)
        
        self.assertTrue(result)
    
    def test_is_passing_score_fail(self):
        """Testa verificação de reprovação"""
        score = 45
        
        result = QuizService.is_passing_score(score)
        
        self.assertFalse(result)
    
    def test_is_passing_score_exact(self):
        """Testa verificação com pontuação exata"""
        score = 60
        
        result = QuizService.is_passing_score(score, passing_score=60)
        
        self.assertTrue(result)
    
    def test_calculate_total_points(self):
        """Testa cálculo de pontos totais"""
        questions = [
            {'id': '1', 'points': 10},
            {'id': '2', 'points': 15},
            {'id': '3', 'points': 20},
        ]
        
        total = QuizService.calculate_total_points(questions)
        
        self.assertEqual(total, 45)
    
    def test_calculate_total_points_default(self):
        """Testa cálculo com pontos padrão"""
        questions = [
            {'id': '1'},  # Sem campo points
            {'id': '2'},
        ]
        
        total = QuizService.calculate_total_points(questions)
        
        self.assertEqual(total, 2)  # 1 ponto cada por padrão


class TestDataIntegrity(unittest.TestCase):
    """Testes de integridade de dados"""
    
    def test_unique_class_codes(self):
        """Testa unicidade de códigos de turma"""
        codes = set()
        
        for _ in range(100):
            code = ClassService.generate_class_code()
            codes.add(code)
        
        # Deve gerar códigos únicos (alta probabilidade)
        self.assertGreater(len(codes), 90)
    
    def test_password_hashing_uniqueness(self):
        """Testa que mesma senha gera hashes diferentes"""
        password = "password123"
        
        hash1 = AuthService.hash_password(password)
        hash2 = AuthService.hash_password(password)
        
        # Hashes devem ser diferentes devido ao salt
        self.assertNotEqual(hash1, hash2)


if __name__ == '__main__':
    unittest.main()
