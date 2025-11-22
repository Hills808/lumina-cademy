# Sistema de Quiz com IA - Documentação

## Visão Geral

O sistema de Quiz com IA foi implementado para gerar automaticamente quizzes semanais baseados nos materiais publicados pelos professores. A IA analisa o conteúdo dos materiais e cria questões de múltipla escolha que testam a compreensão dos alunos.

## Componentes do Sistema

### 1. Banco de Dados

#### Tabela `materials` (atualizada)
Novos campos adicionados para facilitar análise pela IA:
- `keywords` (text[]): Palavras-chave do material
- `topics` (text[]): Tópicos/temas abordados
- `difficulty_level` (text): Nível de dificuldade (iniciante, intermediário, avançado)
- `summary` (text): Resumo do material para facilitar análise

#### Tabela `auto_quiz_schedule` (nova)
Controla a geração automática de quizzes:
- `class_id`: ID da turma
- `last_generated_at`: Data da última geração
- `next_generation_at`: Data da próxima geração
- `is_active`: Se a geração automática está ativa

### 2. Edge Function: `generate-weekly-quiz`

**Localização**: `supabase/functions/generate-weekly-quiz/index.ts`

**Funcionalidade**:
1. Recebe `classId` como parâmetro
2. Busca materiais da turma publicados na última semana
3. Prepara contexto com título, conteúdo, palavras-chave e tópicos
4. Chama Lovable AI (modelo `google/gemini-2.5-flash`) para gerar o quiz
5. A IA retorna um JSON com:
   - Título e descrição do quiz
   - 5 questões de múltipla escolha
   - 4 alternativas por questão
   - Pontuação por questão
6. Salva o quiz e as questões no banco de dados
7. Atualiza o agendamento para próxima semana

**Prompt da IA**:
- Sistema: Instruções para criar quiz educacional com 5 questões
- Usuário: Contexto dos materiais da semana
- Formato: JSON estruturado com questões e alternativas

### 3. Página de Criação de Materiais

**Localização**: `src/pages/Materiais.tsx`

**Melhorias**:
- Novos campos no formulário:
  - **Resumo**: Para facilitar análise pela IA
  - **Palavras-chave**: Tags separadas por vírgula
  - **Tópicos**: Temas abordados
  - **Nível de Dificuldade**: Iniciante/Intermediário/Avançado

**Benefícios**:
- Material melhor estruturado
- IA consegue entender melhor o conteúdo
- Quizzes mais relevantes e precisos

### 4. Página de Quiz Automático

**Localização**: `src/pages/QuizAutomatico.tsx`

**Funcionalidades**:
- Lista todas as turmas do professor
- Mostra status de cada turma (Ativo/Inativo)
- Exibe última e próxima data de geração
- Permite ativar/desativar geração automática
- Botão "Gerar Agora" para criar quiz imediatamente

**Fluxo de Uso**:
1. Professor acessa "Quiz Automático IA" no menu
2. Vê lista de suas turmas
3. Clica em "Ativar" para habilitar geração semanal
4. Pode clicar no botão ✨ para gerar quiz imediatamente
5. Sistema cria quiz baseado nos materiais da última semana

## Como Funciona

### Para Professores

1. **Criar Materiais Estruturados**:
   - Adicionar palavras-chave relevantes
   - Especificar tópicos principais
   - Definir nível de dificuldade
   - Escrever resumo claro
   - Conteúdo detalhado

2. **Ativar Geração Automática**:
   - Acessar "Quiz Automático IA"
   - Ativar para turmas desejadas
   - Sistema gera quiz toda semana automaticamente

3. **Gerar Quiz Manual**:
   - Clicar no botão ✨ (Sparkles)
   - IA analisa materiais e cria quiz instantaneamente
   - Quiz é publicado automaticamente

### Para Alunos

- Acessam "Quizzes" e veem os novos quizzes gerados
- Sistema continua igual (fazer quiz, ganhar XP, etc.)
- Quizzes são baseados no que estudaram na semana

## Vantagens do Sistema

### Para Professores
✅ **Economia de Tempo**: Não precisa criar quizzes manualmente  
✅ **Conteúdo Relevante**: Quizzes baseados exatamente no que foi ensinado  
✅ **Automação**: Gera semanalmente sem intervenção  
✅ **Flexibilidade**: Pode gerar quizzes sob demanda  

### Para Alunos
✅ **Avaliação Frequente**: Quiz toda semana para testar conhecimento  
✅ **Conteúdo Atualizado**: Baseado nos materiais recentes  
✅ **Questões Variadas**: IA cria questões diferentes a cada semana  
✅ **XP e Gamificação**: Integrado com sistema de pontos  

## Configuração Técnica

### Secrets Necessários
- `LOVABLE_API_KEY`: Já configurado automaticamente
- `SUPABASE_URL`: Já configurado
- `SUPABASE_SERVICE_ROLE_KEY`: Já configurado

### Modelo de IA
- **Modelo**: `google/gemini-2.5-flash`
- **Motivo**: Equilibra qualidade e velocidade
- **Custo**: Incluído no Lovable AI

### Formato de Resposta da IA

```json
{
  "quiz_title": "Quiz Semanal - Álgebra",
  "quiz_description": "Quiz sobre equações e sistemas lineares",
  "questions": [
    {
      "question_text": "Qual é a solução da equação 2x + 5 = 13?",
      "question_order": 1,
      "points": 20,
      "options": [
        {"option_text": "x = 3", "option_order": 1, "is_correct": false},
        {"option_text": "x = 4", "option_order": 2, "is_correct": true},
        {"option_text": "x = 5", "option_order": 3, "is_correct": false},
        {"option_text": "x = 6", "option_order": 4, "is_correct": false}
      ]
    }
  ]
}
```

## Próximos Passos (Futuras Melhorias)

### Implementação de Cron Job
Para geração verdadeiramente automática, seria necessário:
1. Configurar pg_cron no Supabase
2. Criar job que roda toda semana
3. Job chama edge function para cada turma ativa
4. Professores só precisam ativar uma vez

### Melhorias Possíveis
- [ ] Permitir professor editar quizzes gerados pela IA
- [ ] IA considerar desempenho dos alunos em quizzes anteriores
- [ ] Gerar explicações detalhadas para respostas
- [ ] Múltiplos níveis de dificuldade no mesmo quiz
- [ ] Professor configurar número de questões
- [ ] Histórico de quizzes gerados

## Observações Importantes

⚠️ **Materiais Necessários**: A IA precisa de pelo menos 1 material da última semana para gerar quiz  
⚠️ **Qualidade do Material**: Quanto melhor estruturado o material (com palavras-chave, resumo, tópicos), melhores serão as questões  
⚠️ **Geração Manual**: Professores podem sempre gerar quizzes manualmente quando precisarem  
⚠️ **Revisão Recomendada**: Embora a IA seja boa, professores podem querer revisar os quizzes gerados  

## Suporte

Para dúvidas ou problemas:
1. Verificar logs da edge function no Lovable Cloud
2. Conferir se materiais têm campos estruturados preenchidos
3. Testar geração manual antes de ativar automação
