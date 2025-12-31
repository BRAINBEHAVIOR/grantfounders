# grantfounders-backend/src/config.py

import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

class Config:
    """Configurações base para o Decision Intelligence Operating System (DIOS)."""
    
    # Configuração do Banco de Dados (Supabase/PostgreSQL)
    # Lê a variável de ambiente DATABASE_URL. Se não encontrar, usa um fallback local.
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Chave Secreta (CRÍTICA para segurança do Flask)
    SECRET_KEY = os.getenv('SECRET_KEY', 'fallback_secret_key_nao_use_em_producao')
    
    # Configuração de CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')

    # Configurações do Abasensor™ (Podem ser movidas para o banco de dados)
    ABASENSOR_VERSION = "1.0.0-DIOS"
    ABASENSOR_DNA_AGENCY_WEIGHTS = {
        "technology": 0.8,
        "healthcare": 0.5,
        "environment": 0.7,
    }

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    # Forçar o uso da variável de ambiente em produção
    if Config.SQLALCHEMY_DATABASE_URI == 'sqlite:///app.db':
        raise EnvironmentError("DATABASE_URL não configurada em ambiente de produção!")

# Mapeamento para fácil acesso
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
