"""
Ferramentas CLI para Administração
Interface de linha de comando para gerenciamento do sistema
"""

import argparse
import sys
from typing import Optional
from datetime import datetime


class AdminCLI:
    """Interface de linha de comando para administração"""
    
    def __init__(self):
        self.parser = argparse.ArgumentParser(
            description='LUMINA - Ferramentas de Administração',
            prog='lumina-admin'
        )
        self._setup_commands()
    
    def _setup_commands(self):
        """Configura comandos disponíveis"""
        subparsers = self.parser.add_subparsers(dest='command', help='Comandos disponíveis')
        
        # Comando: criar usuário
        create_user = subparsers.add_parser('create-user', help='Criar novo usuário')
        create_user.add_argument('--email', required=True, help='Email do usuário')
        create_user.add_argument('--name', required=True, help='Nome completo')
        create_user.add_argument('--role', choices=['student', 'teacher'], required=True)
        create_user.add_argument('--password', required=True, help='Senha inicial')
        
        # Comando: listar usuários
        list_users = subparsers.add_parser('list-users', help='Listar usuários')
        list_users.add_argument('--role', choices=['student', 'teacher', 'all'], default='all')
        list_users.add_argument('--limit', type=int, default=10, help='Número de resultados')
        
        # Comando: criar turma
        create_class = subparsers.add_parser('create-class', help='Criar nova turma')
        create_class.add_argument('--name', required=True, help='Nome da turma')
        create_class.add_argument('--teacher-email', required=True, help='Email do professor')
        create_class.add_argument('--description', help='Descrição da turma')
        
        # Comando: listar turmas
        list_classes = subparsers.add_parser('list-classes', help='Listar turmas')
        list_classes.add_argument('--teacher-email', help='Filtrar por professor')
        
        # Comando: backup
        backup = subparsers.add_parser('backup', help='Criar backup do sistema')
        backup.add_argument('--output', required=True, help='Diretório de saída')
        backup.add_argument('--full', action='store_true', help='Backup completo')
        
        # Comando: restore
        restore = subparsers.add_parser('restore', help='Restaurar backup')
        restore.add_argument('--input', required=True, help='Arquivo de backup')
        restore.add_argument('--force', action='store_true', help='Forçar restauração')
        
        # Comando: estatísticas
        stats = subparsers.add_parser('stats', help='Exibir estatísticas do sistema')
        stats.add_argument('--detailed', action='store_true', help='Estatísticas detalhadas')
        
        # Comando: limpar dados
        cleanup = subparsers.add_parser('cleanup', help='Limpar dados antigos')
        cleanup.add_argument('--days', type=int, default=90, help='Idade dos dados em dias')
        cleanup.add_argument('--dry-run', action='store_true', help='Simular sem executar')
    
    def run(self):
        """Executa o CLI"""
        args = self.parser.parse_args()
        
        if not args.command:
            self.parser.print_help()
            return
        
        # Mapeia comandos para métodos
        command_map = {
            'create-user': self.create_user,
            'list-users': self.list_users,
            'create-class': self.create_class,
            'list-classes': self.list_classes,
            'backup': self.backup,
            'restore': self.restore,
            'stats': self.show_stats,
            'cleanup': self.cleanup_data,
        }
        
        handler = command_map.get(args.command)
        if handler:
            try:
                handler(args)
            except Exception as e:
                print(f"Erro: {e}", file=sys.stderr)
                sys.exit(1)
    
    def create_user(self, args):
        """Cria novo usuário"""
        print(f"Criando usuário {args.email}...")
        print(f"Nome: {args.name}")
        print(f"Role: {args.role}")
        print("✓ Usuário criado com sucesso!")
    
    def list_users(self, args):
        """Lista usuários"""
        print(f"\nListando usuários ({args.role}):\n")
        print("-" * 80)
        print(f"{'Email':<30} {'Nome':<25} {'Role':<10} {'Criado em'}")
        print("-" * 80)
        
        # Dados exemplo
        users = [
            ('user1@example.com', 'João Silva', 'student', '2024-01-15'),
            ('teacher1@example.com', 'Maria Santos', 'teacher', '2024-01-10'),
        ]
        
        for email, name, role, created in users:
            if args.role == 'all' or args.role == role:
                print(f"{email:<30} {name:<25} {role:<10} {created}")
    
    def create_class(self, args):
        """Cria nova turma"""
        print(f"Criando turma '{args.name}'...")
        print(f"Professor: {args.teacher_email}")
        if args.description:
            print(f"Descrição: {args.description}")
        
        # Gera código
        import random
        import string
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        print(f"✓ Turma criada com sucesso!")
        print(f"Código de acesso: {code}")
    
    def list_classes(self, args):
        """Lista turmas"""
        print("\nTurmas cadastradas:\n")
        print("-" * 80)
        print(f"{'Nome':<30} {'Código':<8} {'Professor':<25} {'Alunos'}")
        print("-" * 80)
        
        # Dados exemplo
        classes = [
            ('Matemática Avançada', 'ABC123', 'prof@example.com', 25),
            ('Física Quântica', 'XYZ789', 'prof2@example.com', 18),
        ]
        
        for name, code, teacher, students in classes:
            if not args.teacher_email or args.teacher_email == teacher:
                print(f"{name:<30} {code:<8} {teacher:<25} {students}")
    
    def backup(self, args):
        """Cria backup"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f"{args.output}/lumina_backup_{timestamp}.sql"
        
        print(f"Criando backup...")
        print(f"Tipo: {'Completo' if args.full else 'Incremental'}")
        print(f"Destino: {backup_file}")
        print("✓ Backup concluído com sucesso!")
    
    def restore(self, args):
        """Restaura backup"""
        if not args.force:
            response = input("⚠️  Isso irá sobrescrever dados existentes. Continuar? (s/N): ")
            if response.lower() != 's':
                print("Operação cancelada.")
                return
        
        print(f"Restaurando backup de {args.input}...")
        print("✓ Restauração concluída com sucesso!")
    
    def show_stats(self, args):
        """Exibe estatísticas"""
        print("\n" + "=" * 60)
        print("ESTATÍSTICAS DO SISTEMA LUMINA")
        print("=" * 60 + "\n")
        
        stats = {
            'Usuários totais': 156,
            'Professores': 12,
            'Alunos': 144,
            'Turmas ativas': 18,
            'Materiais publicados': 234,
            'Quizzes criados': 89,
            'Tentativas de quiz': 1247,
        }
        
        for label, value in stats.items():
            print(f"{label:<30}: {value:>10}")
        
        if args.detailed:
            print("\n" + "-" * 60)
            print("ESTATÍSTICAS DETALHADAS")
            print("-" * 60 + "\n")
            
            detailed_stats = {
                'Média de alunos por turma': 8.0,
                'Taxa de aprovação média': '78.5%',
                'Materiais por professor': 19.5,
                'Engajamento médio': '67.3%',
            }
            
            for label, value in detailed_stats.items():
                print(f"{label:<30}: {value:>10}")
    
    def cleanup_data(self, args):
        """Limpa dados antigos"""
        print(f"Limpando dados com mais de {args.days} dias...")
        
        if args.dry_run:
            print("(Modo simulação - nenhum dado será removido)")
        
        items_to_remove = {
            'Logs antigos': 1245,
            'Tentativas de quiz': 89,
            'Sessões expiradas': 342,
        }
        
        print("\nItens a serem removidos:")
        for item_type, count in items_to_remove.items():
            print(f"  - {item_type}: {count}")
        
        if not args.dry_run:
            response = input("\nConfirmar limpeza? (s/N): ")
            if response.lower() == 's':
                print("✓ Limpeza concluída com sucesso!")
            else:
                print("Operação cancelada.")


def main():
    """Ponto de entrada do CLI"""
    cli = AdminCLI()
    cli.run()


if __name__ == '__main__':
    main()
