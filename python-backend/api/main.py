"""
LUMINA - API Principal
Sistema de Gestão Educacional
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime

app = FastAPI(
    title="LUMINA API",
    description="API para Sistema de Gestão Educacional",
    version="1.0.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "message": "LUMINA API - Sistema de Gestão Educacional",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/classes")
async def get_classes():
    """Retorna lista de turmas"""
    return {
        "classes": [
            {
                "id": 1,
                "name": "Matemática Avançada",
                "teacher": "Prof. Silva",
                "students": 30
            },
            {
                "id": 2,
                "name": "Física Quântica",
                "teacher": "Prof. Santos",
                "students": 25
            }
        ]
    }


@app.get("/api/materials")
async def get_materials():
    """Retorna lista de materiais didáticos"""
    return {
        "materials": [
            {
                "id": 1,
                "title": "Introdução ao Cálculo",
                "type": "pdf",
                "class_id": 1
            },
            {
                "id": 2,
                "title": "Mecânica Quântica Básica",
                "type": "video",
                "class_id": 2
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
