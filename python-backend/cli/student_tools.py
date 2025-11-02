"""
Ferramentas CLI para Estudantes
Interface de linha de comando para estudantes
"""

import argparse
from datetime import datetime, timedelta
from typing import List, Dict


class StudentCLI:
    """CLI para funcionalidades de estudantes"""
    
    def __init__(self):
        self.parser = argparse.ArgumentParser(
            description='LUMINA - Ferramentas para Estudantes',
            prog='lumina-student'
        )
        self._setup_commands()
    
    def _setup_commands(self):
        """Configura comandos disponíveis"""
        subparsers = self.parser.add_subparsers(dest='command')
        
        # Ver minhas turmas
        subparsers.add_parser('my-classes', help='Ver minhas turmas')
        
        # Ver materiais
        materials = subparsers.add_parser('materials', help='Ver materiais')
        materials.add_argument('--class-code', help='Código da turma')
        
        # Ver quizzes
        quizzes = subparsers.add_parser('quizzes', help='Ver quizzes disponíveis')
        quizzes.add_argument('--class-code', help='Código da turma')
        
        # Ver notas
        grades = subparsers.add_parser('grades', help='Ver minhas notas')
        grades.add_argument('--class-code', help='Filtrar por turma')
        
        # Progresso
        subparsers.add_parser('progress', help='Ver meu progresso')
        
        # Calendário
        calendar = subparsers.add_parser('calendar', help='Ver eventos do calendário')
        calendar.add_argument('--days', type=int, default=7, help='Próximos N dias')
    
    def run(self):
        """Executa o CLI"""
        args = self.parser.parse_args()
        
        if not args.command:
            self.parser.print_help()
            return
        
        command_map = {
            'my-classes': self.show_classes,
            'materials': self.show_materials,
            'quizzes': self.show_quizzes,
            'grades': self.show_grades,
            'progress': self.show_progress,
            'calendar': self.show_calendar,
        }
        
        handler = command_map.get(args.command)
        if handler:
            handler(args)
    
    def show_classes(self, args):
        """Mostra turmas do aluno"""
        print("\n" + "=" * 60)
        print("MINHAS TURMAS")
        print("=" * 60 + "\n")
        
        classes = [
            {
                'name': 'Matemática Avançada',
                'code': 'ABC123',
                'teacher': 'Prof. Silva',
                'students': 25
            },
            {
                'name': 'Física Quântica',
                'code': 'XYZ789',
                'teacher': 'Prof. Santos',
                'students': 18
            }
        ]
        
        for cls in classes:
            print(f"📚 {cls['name']}")
            print(f"   Código: {cls['code']}")
            print(f"   Professor: {cls['teacher']}")
            print(f"   Alunos: {cls['students']}")
            print()
    
    def show_materials(self, args):
        """Mostra materiais disponíveis"""
        title = "MATERIAIS"
        if args.class_code:
            title += f" - Turma {args.class_code}"
        
        print("\n" + "=" * 60)
        print(title)
        print("=" * 60 + "\n")
        
        materials = [
            {
                'title': 'Introdução ao Cálculo',
                'type': 'PDF',
                'class': 'ABC123',
                'date': '2024-01-15'
            },
            {
                'title': 'Aula 1: Limites',
                'type': 'Vídeo',
                'class': 'ABC123',
                'date': '2024-01-16'
            }
        ]
        
        for material in materials:
            if not args.class_code or material['class'] == args.class_code:
                print(f"📄 {material['title']}")
                print(f"   Tipo: {material['type']}")
                print(f"   Turma: {material['class']}")
                print(f"   Data: {material['date']}")
                print()
    
    def show_quizzes(self, args):
        """Mostra quizzes disponíveis"""
        print("\n" + "=" * 60)
        print("QUIZZES DISPONÍVEIS")
        print("=" * 60 + "\n")
        
        quizzes = [
            {
                'title': 'Quiz 1: Limites e Continuidade',
                'class': 'ABC123',
                'deadline': '2024-02-01',
                'status': 'Pendente',
                'attempts': 0
            },
            {
                'title': 'Avaliação Parcial',
                'class': 'ABC123',
                'deadline': '2024-02-15',
                'status': 'Concluído',
                'attempts': 2,
                'score': 85
            }
        ]
        
        for quiz in quizzes:
            if not args.class_code or quiz['class'] == args.class_code:
                status_icon = '✓' if quiz['status'] == 'Concluído' else '⏳'
                print(f"{status_icon} {quiz['title']}")
                print(f"   Turma: {quiz['class']}")
                print(f"   Prazo: {quiz['deadline']}")
                print(f"   Status: {quiz['status']}")
                if quiz.get('score'):
                    print(f"   Nota: {quiz['score']}")
                print()
    
    def show_grades(self, args):
        """Mostra notas do aluno"""
        print("\n" + "=" * 60)
        print("MINHAS NOTAS")
        print("=" * 60 + "\n")
        
        grades = [
            {
                'quiz': 'Quiz 1: Limites',
                'class': 'ABC123',
                'score': 85,
                'max_score': 100,
                'date': '2024-01-20'
            },
            {
                'quiz': 'Quiz 2: Derivadas',
                'class': 'ABC123',
                'score': 92,
                'max_score': 100,
                'date': '2024-01-25'
            }
        ]
        
        total_score = 0
        total_max = 0
        
        for grade in grades:
            if not args.class_code or grade['class'] == args.class_code:
                percentage = (grade['score'] / grade['max_score']) * 100
                print(f"📝 {grade['quiz']}")
                print(f"   Nota: {grade['score']}/{grade['max_score']} ({percentage:.1f}%)")
                print(f"   Data: {grade['date']}")
                print()
                
                total_score += grade['score']
                total_max += grade['max_score']
        
        if total_max > 0:
            avg = (total_score / total_max) * 100
            print("-" * 60)
            print(f"Média geral: {avg:.1f}%")
    
    def show_progress(self, args):
        """Mostra progresso geral"""
        print("\n" + "=" * 60)
        print("MEU PROGRESSO")
        print("=" * 60 + "\n")
        
        progress = {
            'Turmas matriculadas': 2,
            'Materiais visualizados': 15,
            'Quizzes concluídos': 8,
            'Média geral': '88.5%',
            'Taxa de conclusão': '67%',
            'Horas de estudo': 24,
        }
        
        for label, value in progress.items():
            print(f"{label:<30}: {value}")
        
        print("\n" + "-" * 60)
        print("Progresso por turma:")
        print("-" * 60 + "\n")
        
        class_progress = [
            {
                'name': 'Matemática Avançada',
                'completion': 75,
                'average': 87
            },
            {
                'name': 'Física Quântica',
                'completion': 60,
                'average': 90
            }
        ]
        
        for cls in class_progress:
            print(f"📚 {cls['name']}")
            print(f"   Conclusão: {cls['completion']}% {'█' * (cls['completion'] // 10)}")
            print(f"   Média: {cls['average']}%")
            print()
    
    def show_calendar(self, args):
        """Mostra eventos do calendário"""
        print("\n" + "=" * 60)
        print(f"CALENDÁRIO - Próximos {args.days} dias")
        print("=" * 60 + "\n")
        
        events = []
        base_date = datetime.now()
        
        for i in range(args.days):
            date = base_date + timedelta(days=i)
            
            if i % 3 == 0:  # Simula alguns eventos
                events.append({
                    'date': date.strftime('%d/%m/%Y'),
                    'time': '14:00',
                    'title': f'Aula de Matemática',
                    'type': 'aula'
                })
            
            if i == 5:
                events.append({
                    'date': date.strftime('%d/%m/%Y'),
                    'time': '23:59',
                    'title': 'Prazo: Quiz de Física',
                    'type': 'prazo'
                })
        
        current_date = None
        for event in events:
            if event['date'] != current_date:
                print(f"\n📅 {event['date']}")
                print("-" * 60)
                current_date = event['date']
            
            icon = '⏰' if event['type'] == 'prazo' else '📖'
            print(f"   {icon} {event['time']} - {event['title']}")


def main():
    """Ponto de entrada"""
    cli = StudentCLI()
    cli.run()


if __name__ == '__main__':
    main()
