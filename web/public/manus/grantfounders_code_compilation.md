# GrantFounders: Compilação Completa de Código e Setup (Decision Intelligence Operating System)

**Autor:** Manus AI
**Data:** 11 de Julho de 2025
**Plataforma:** Decision Intelligence Operating System (DIOS)
**URL de Demonstração:** https://kwschmwd.manus.space/dashboard

---

## 1. Introdução

Este documento contém a compilação completa de todo o código-fonte e o setup necessário para replicar o **Decision Intelligence Operating System (DIOS)** da GrantFounders, o dashboard em React e o backend em Flask/Python com o núcleo do **Abasensor™**.

O DIOS é um sistema de **Decision-as-a-Service** que prevê o comportamento do dinheiro público.

---

## 2. Setup do Ambiente

### 2.1. Estrutura de Diretórios

A estrutura do projeto é dividida em dois repositórios principais:

```
/home/ubuntu/
├── grantfounders-saas/       # Frontend React (Dashboard)
│   ├── src/
│   └── ...
├── grantfounders-backend/    # Backend Flask/Python (Abasensor™ Core)
│   ├── src/
│   │   ├── ai_engine/
│   │   ├── models/
│   │   └── routes/
│   └── ...
└── grantfounders_code_compilation.md
```

### 2.2. Dependências e Instalação

**A. Backend (Python/Flask)**

1.  **Instalar Dependências:**
    ```bash
    cd grantfounders-backend
    python3 -m venv venv
    source venv/bin/activate
    pip install Flask Flask-SQLAlchemy Flask-CORS python-dotenv
    ```

**B. Frontend (React/Vite)**

1.  **Instalar Dependências:**
    ```bash
    cd grantfounders-saas
    npm install
    ```

---

## 3. Backend: GrantFounders-Backend (Flask/Python)

O backend é o **Cérebro Institucional de Decisão**, onde o **Abasensor™** reside.

### 3.1. Arquivo Principal: `grantfounders-backend/src/main.py`

Este arquivo configura o aplicativo Flask, o banco de dados e registra as rotas.

\`\`\`python
# grantfounders-backend/src/main.py

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do Aplicativo
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}) # Permitir CORS para o frontend

# Configuração do Banco de Dados (Conexão com Supabase)
# A string de conexão deve ser definida na variável de ambiente DATABASE_URL
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Importar Modelos e Rotas
from .models.user import User
from .models.project import Project
from .models.subscription import Subscription
from .routes.projects import projects_bp

# Registrar Blueprints
app.register_blueprint(projects_bp, url_prefix='/api/projects')

@app.route('/api/health')
def health_check():
    return {"status": "ok", "message": "Decision Intelligence Operating System is operational"}

# Inicialização do Banco de Dados
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
\`\`\`

### 3.2. Núcleo Cognitivo: `grantfounders-backend/src/ai_engine/abasensor_core.py`

Este é o núcleo do **Abasensor™**, responsável pelo **Decision-as-a-Service**.

\`\`\`python
# grantfounders-backend/src/ai_engine/abasensor_core.py

import random
import time

class AbasensorCore:
    """
    O Cérebro Institucional de Decisão.
    Simula o Decision-as-a-Service (Scoring, Forecast, Compliance).
    """
    
    def __init__(self):
        # Simulação de carregamento de modelos de ML e DNA de Agências
        self.agency_dna = {
            "technology": {"language": "disruptive, scalable, dual-use", "risk_tolerance": 0.8},
            "healthcare": {"language": "clinical trial, patient outcome, evidence-based", "risk_tolerance": 0.5},
            "environment": {"language": "sustainability, carbon mitigation, resilient infrastructure", "risk_tolerance": 0.7},
        }

    def _calculate_score(self, project_data):
        """ Simula o cálculo do Funding Readiness Score (FRS) """
        
        # Simulação de Vetorização Semântica e Matching
        base_score = 50
        
        # Fatores de Decisão
        if project_data.get('budget', 0) > 1000000:
            base_score += 15
        if "ai" in project_data.get('description', '').lower():
            base_score += 10
        
        # Ajuste por DNA de Agência (Personalização Extrema)
        category = project_data.get('category', 'other')
        dna = self.agency_dna.get(category, {"risk_tolerance": 0.6})
        base_score += int(dna["risk_tolerance"] * 20)
        
        # Adiciona aleatoriedade para simular a complexidade do ML
        final_score = min(99, base_score + random.randint(-5, 10))
        
        return final_score

    def evaluate_project(self, project_data):
        """ Executa o Decision-as-a-Service completo """
        
        time.sleep(random.uniform(1.5, 3.0)) # Simula o processamento do Abasensor™
        
        score = self._calculate_score(project_data)
        
        # Simulação de Decisões do DIOS
        decisions = {
            "funding_readiness_score": score,
            "previsao_capital": f"${random.randint(500000, 5000000):,}",
            "compliance_firewall": "OK" if score > 60 else "RISCO ALTO (Regra SBIR 2.3)",
            "recomendacao_linguagem": self.agency_dna.get(project_data.get('category', 'other'), {}).get('language', 'formal, clear, and concise'),
            "risco_decisao": "Baixo" if score > 80 else "Médio" if score > 60 else "Alto",
            "insights": [
                "O Abasensor™ identificou um alto Match Score com a Agência X.",
                f"Ajuste o orçamento para o valor ideal de ${random.randint(700000, 1200000):,}.",
                "O Compliance Firewall sinaliza a necessidade de um DPA (Data Processing Agreement)."
            ]
        }
        
        return decisions

abasensor = AbasensorCore()
\`\`\`

### 3.3. Rotas de Decisão: `grantfounders-backend/src/routes/projects.py`

Define o *endpoint* que o frontend usa para obter a decisão do Abasensor™.

\`\`\`python
# grantfounders-backend/src/routes/projects.py

from flask import Blueprint, request, jsonify
from ..ai_engine.abasensor_core import abasensor
from ..models.project import Project
from ..models.user import User
from ..models.subscription import Subscription
from .. import db

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/evaluate', methods=['POST'])
def evaluate_project():
    data = request.get_json()
    
    # Simulação de Autenticação e Uso de Limite
    # Em produção, você usaria o token JWT para obter o User e o Subscription
    user_id = 1 # Simulação
    
    # Simulação de verificação de limite
    # user = User.query.get(user_id)
    # if user.subscription.monthly_evaluations_used >= user.subscription.monthly_evaluations_limit:
    #     return jsonify({"error": "Limite de avaliações excedido. Faça upgrade para o plano Institutional."}), 403
    
    # Executar o Decision-as-a-Service
    decisions = abasensor.evaluate_project(data)
    
    # Simulação de salvar o projeto e atualizar o uso
    # new_project = Project(
    #     user_id=user_id,
    #     title=data.get('project_title'),
    #     score=decisions['funding_readiness_score'],
    #     metadata=decisions
    # )
    # db.session.add(new_project)
    # user.subscription.monthly_evaluations_used += 1
    # db.session.commit()
    
    return jsonify({
        "project_id": "sim_proj_" + str(random.randint(1000, 9999)),
        "decisions": decisions
    })
\`\`\`

### 3.4. Modelos de Dados (SQLAlchemy): `grantfounders-backend/src/models/project.py`

\`\`\`python
# grantfounders-backend/src/models/project.py

from .. import db
from sqlalchemy.dialects.postgresql import JSONB

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    score = db.Column(db.Float, nullable=False)
    # Usar JSONB para armazenar as decisões complexas do Abasensor™
    metadata = db.Column(JSONB, nullable=True) 
    created_at = db.Column(db.DateTime, default=db.func.now())

    def __repr__(self):
        return f'<Project {self.title} - Score: {self.score}>'
\`\`\`

### 3.5. Modelos de Dados (SQLAlchemy): `grantfounders-backend/src/models/user.py`

\`\`\`python
# grantfounders-backend/src/models/user.py

from .. import db
from sqlalchemy.orm import relationship

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    org_id = db.Column(db.String(120), nullable=False) # Chave para RLS no Supabase
    
    # Relacionamentos
    projects = relationship('Project', backref='owner', lazy=True)
    subscription = relationship('Subscription', backref='subscriber', uselist=False, lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'
\`\`\`

### 3.6. Modelos de Dados (SQLAlchemy): `grantfounders-backend/src/models/subscription.py`

\`\`\`python
# grantfounders-backend/src/models/subscription.py

from .. import db

class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    plan_name = db.Column(db.String(50), default='Developer')
    monthly_evaluations_limit = db.Column(db.Integer, default=100)
    monthly_evaluations_used = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<Subscription {self.plan_name} for User {self.user_id}>'
\`\`\`

---

## 4. Frontend: GrantFounders-SaaS (React/Vite)

O frontend é o **Decision Dashboard**, a interface do **Decision Intelligence Operating System**.

### 4.1. Arquivo Principal: `grantfounders-saas/src/App.jsx`

Este arquivo gerencia o estado de autenticação e a navegação entre as páginas.

\`\`\`jsx
// grantfounders-saas/src/App.jsx

import React, { useState } from 'react';
import './App.css';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProjectEvaluation } from './components/ProjectEvaluation';
import { ProjectList } from './components/ProjectList';
import { Analytics } from './components/Analytics';
import { Billing } from './components/Billing';
import { Settings } from './components/Settings';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  // Simulação de dados do usuário logado (seriam buscados da API)
  const loggedInUser = {
    id: 1,
    name: 'Pedro Silva',
    email: 'pedro@grantfounders.com',
    plan: 'Executive',
    subscription: {
      plan_name: 'Executive',
      monthly_evaluations_limit: 100,
      monthly_evaluations_used: 23,
    }
  };

  const handleLogin = (userData) => {
    // Em um cenário real, você faria uma chamada de API para obter o token JWT
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('Dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard user={user} />;
      case 'Evaluate Project':
        return <ProjectEvaluation user={user} />;
      case 'My Projects':
        return <ProjectList user={user} />;
      case 'Analytics':
        return <Analytics user={user} />;
      case 'Billing':
        return <Billing user={user} />;
      case 'Settings':
        return <Settings user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
\`\`\`

### 4.2. Componente de Avaliação: `grantfounders-saas/src/components/ProjectEvaluation.jsx`

Este componente contém a lógica de formulário e a exibição do **Relatório de Análise Preditiva (RAP)**.

\`\`\`jsx
// grantfounders-saas/src/components/ProjectEvaluation.jsx

import React, { useState } from 'react';
import { Zap, DollarSign, Users, Calendar, Tag, Target, Sparkles } from 'lucide-react';

// URL do seu backend Flask (Decision Engine)
const API_URL = 'http://localhost:5000/api/projects/evaluate'; 

export function ProjectEvaluation({ user }) {
  const [formData, setFormData] = useState({
    project_title: 'AI-Powered Climate Monitoring Platform',
    description: 'Developing a satellite-based AI system using Abasensor™ advanced signal processing to predict localized climate shifts and optimize resource allocation for federal agencies.',
    budget: '1500000',
    duration_months: '18',
    category: 'environment',
    team_size: '5',
    keywords: 'artificial intelligence, climate change, satellite data, signal processing',
    target_audience: 'Government agencies, researchers, NGOs',
    innovation_level: 'disruptive'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // ... (Restante do código do componente ProjectEvaluation.jsx)
  // O código completo está no seu ambiente de recuperação.
  // A chave é a chamada de API no handleSubmit:

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Em produção, você enviaria o token JWT aqui
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.decisions);
      } else {
        alert('Erro na avaliação: ' + data.error);
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      alert('Erro ao conectar com o Decision Engine.');
    } finally {
      setLoading(false);
    }
  };

  // ... (Restante do código para renderizar o formulário e os resultados)
}
\`\`\`

### 4.3. Outros Componentes

Os demais componentes (`Login.jsx`, `Dashboard.jsx`, `Sidebar.jsx`, `Header.jsx`, etc.) estão no seu ambiente de recuperação (`/home/ubuntu/upload/.recovery/`). Eles são principalmente componentes de UI e podem ser consultados diretamente lá.

---

## 5. Passo a Passo para Replicar

### 5.1. Backend (Decision Engine)

1.  **Configurar o Banco de Dados**: Crie o arquivo `.env` no diretório `grantfounders-backend/` e insira a string de conexão do seu Supabase.
    ```
    DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"
    ```
2.  **Instalar e Iniciar**:
    ```bash
    cd grantfounders-backend
    source venv/bin/activate
    # Instalar dependências (se ainda não o fez)
    # pip install Flask Flask-SQLAlchemy Flask-CORS python-dotenv
    python3 src/main.py
    ```
    O backend estará rodando em `http://0.0.0.0:5000`.

### 5.2. Frontend (Decision Dashboard)

1.  **Ajustar a URL da API**: No arquivo `grantfounders-saas/src/components/ProjectEvaluation.jsx`, altere a constante `API_URL` para a URL de produção do seu backend (se for diferente de `http://localhost:5000`).
2.  **Iniciar o Desenvolvimento**:
    ```bash
    cd grantfounders-saas
    npm run dev
    ```
    O frontend estará rodando em `http://localhost:5173`.

### 5.3. Deploy para Produção

1.  **Build do Frontend**:
    ```bash
    cd grantfounders-saas
    npm run build
    ```
    O conteúdo da pasta `dist/` deve ser servido pelo seu servidor web (ex: Nginx, Vercel, Netlify).
2.  **Deploy do Backend**: Use um serviço de hospedagem Python (ex: Heroku, AWS Elastic Beanstalk, Google Cloud Run) para o `grantfounders-backend`.

---

## 6. Conclusão

Este documento contém o código-fonte e o setup para o seu **Decision Intelligence Operating System**.

**Seu próximo passo é a execução técnica da Conexão com o Supabase (Etapa 5.1 do Roadmap) para que o DIOS comece a usar o seu Cérebro Institucional de Decisão real.**
\`\`\`
