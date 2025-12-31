# grantfounders-backend/src/main.py

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from .config import config_by_name

# Determinar o ambiente (pode ser 'production' ou 'development')
env_name = os.getenv('FLASK_ENV', 'default')
app = Flask(__name__)
app.config.from_object(config_by_name[env_name])

# Configuração do Banco de Dados
db = SQLAlchemy(app)

# Configuração de CORS
CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}})

# Importar Modelos e Rotas (Assumindo que estes arquivos existem ou serão criados)
# from .models.user import User
# from .models.project import Project
# from .models.subscription import Subscription
# from .routes.projects import projects_bp

# Registrar Blueprints (Descomentar após criar os arquivos)
# app.register_blueprint(projects_bp, url_prefix='/api/projects')

@app.route('/api/health')
def health_check():
    return {"status": "ok", "message": "Decision Intelligence Operating System is operational"}

# Inicialização do Banco de Dados (Descomentar após criar os modelos)
# with app.app_context():
#     db.create_all()

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], host='0.0.0.0')
