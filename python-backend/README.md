# LUMINA - Backend Python (Estrutura de Referência)

Este diretório contém a estrutura de backend em Python para o sistema LUMINA.

## Estrutura do Projeto

```
python-backend/
├── api/                 # Endpoints da API
├── models/             # Modelos de dados
├── services/           # Lógica de negócio
├── utils/              # Utilitários
├── config/             # Configurações
└── requirements.txt    # Dependências Python
```

## Tecnologias

- Python 3.11+
- FastAPI (Framework web)
- SQLAlchemy (ORM)
- Pydantic (Validação de dados)
- Uvicorn (Servidor ASGI)

## Instalação

```bash
pip install -r requirements.txt
```

## Execução

```bash
uvicorn api.main:app --reload
```

## Observações

Esta estrutura foi criada para demonstração e requisitos acadêmicos.
O sistema funcional utiliza TypeScript/Node.js com Supabase.
