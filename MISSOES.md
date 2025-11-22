# Sistema de Missões Diárias e Semanais

## 📋 Visão Geral

O sistema de missões oferece desafios diários e semanais que recompensam os usuários com XP bonus ao completá-los. As missões são automaticamente atribuídas e rastreiam o progresso do usuário em tempo real.

## 🎯 Tipos de Missões

### Missões Diárias
- **Renovação**: Resetam todos os dias à meia-noite
- **Exemplos**:
  - 📖 Primeira Leitura (1 material) - 20 XP
  - 📚 Estudante Dedicado (3 materiais) - 50 XP
  - 🎯 Quiz Master (2 quizzes) - 60 XP
  - 🌟 Acesso Diário (1 login) - 15 XP
  - 🗺️ Explorador (3 seções visitadas) - 25 XP

### Missões Semanais
- **Renovação**: Resetam todos os domingos
- **Exemplos**:
  - 🏃 Maratonista (10 quizzes) - 200 XP
  - 📚 Bibliotecário (15 materiais) - 180 XP
  - ⭐ Perfeccionista Semanal (5 quizzes com nota 100) - 250 XP
  - 🔥 Sequência Semanal (7 dias de streak) - 150 XP
  - 💪 Engajamento Total (20 atividades) - 300 XP

## 🔧 Estrutura do Banco de Dados

### Tabela `missions`
Armazena os templates de missões disponíveis:
- `name`: Nome da missão
- `description`: Descrição do objetivo
- `mission_type`: 'daily' ou 'weekly'
- `category`: Categoria (quiz, material, streak, engagement)
- `requirement_type`: Tipo de ação necessária
- `requirement_value`: Quantidade necessária para completar
- `xp_reward`: Recompensa de XP
- `icon`: Emoji representativo

### Tabela `user_missions`
Rastreia o progresso individual de cada usuário:
- `user_id`: ID do usuário
- `mission_id`: ID da missão
- `progress`: Progresso atual
- `completed`: Se foi completada
- `completed_at`: Data/hora de conclusão
- `expires_at`: Data/hora de expiração

## 🚀 Funções do Banco de Dados

### `assign_daily_missions(user_id)`
Atribui missões diárias a um usuário automaticamente.

### `assign_weekly_missions(user_id)`
Atribui missões semanais a um usuário automaticamente.

### `update_mission_progress(user_id, requirement_type, increment)`
Atualiza o progresso de missões quando o usuário realiza ações.
Exemplo: ao ler um material, chama com `requirement_type = 'read_materials'`.

### `cleanup_expired_missions()`
Remove missões expiradas não completadas (pode ser usado em um cron job).

## 📱 Integração no Frontend

### Hook `useMissions`
```typescript
const { 
  dailyMissions, 
  weeklyMissions, 
  completedMissions,
  totalMissions,
  updateMissionProgress 
} = useMissions(userId);
```

### Componentes Disponíveis

1. **MissionsPanel**: Painel completo com tabs para diárias/semanais
2. **MissionsWidget**: Widget compacto para dashboard
3. **MissionCard**: Card individual de missão com progresso
4. **MissionCompletionToast**: Notificações automáticas de conclusão

## 🎮 Como Funciona

1. **Atribuição Automática**: 
   - Ao acessar o dashboard, missões são automaticamente atribuídas se ainda não existirem
   - Missões diárias são criadas para o dia atual
   - Missões semanais são criadas para a semana atual

2. **Rastreamento de Progresso**:
   - Cada ação do usuário (ler material, completar quiz, etc.) atualiza automaticamente o progresso
   - O progresso é salvo em tempo real no banco de dados

3. **Conclusão**:
   - Quando o progresso atinge o valor necessário, a missão é marcada como completada
   - XP bonus é adicionado automaticamente
   - Notificação é exibida ao usuário

4. **Expiração**:
   - Missões diárias expiram à meia-noite
   - Missões semanais expiram no domingo
   - Missões não completadas são removidas automaticamente

## 🔗 Integração com Sistema de XP

As missões estão totalmente integradas ao sistema de XP existente:
- Ao ler um material → `update_mission_progress('read_materials')`
- Ao completar quiz → `update_mission_progress('complete_quizzes')`
- Ao tirar nota 100 → `update_mission_progress('perfect_quizzes')`
- Ao fazer login → `update_mission_progress('daily_login')`

## 📊 Recompensas

| Tipo de Missão | XP Médio |
|----------------|----------|
| Diária simples | 15-25 XP |
| Diária normal  | 50-60 XP |
| Semanal normal | 150-200 XP |
| Semanal difícil| 250-300 XP |

## 🎨 Customização

Para adicionar novas missões, insira na tabela `missions`:
```sql
INSERT INTO missions (name, description, mission_type, category, requirement_type, requirement_value, xp_reward, icon) 
VALUES ('Nova Missão', 'Descrição', 'daily', 'quiz', 'complete_quizzes', 5, 100, '🎯');
```

## 📈 Melhorias Futuras

- [ ] Missões especiais de eventos
- [ ] Missões com múltiplos requisitos
- [ ] Sistema de "missões épicas" mensais
- [ ] Recompensas adicionais além de XP (badges especiais)
- [ ] Missões cooperativas para turmas
