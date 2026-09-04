# GrantFounders™ Visão Geral dos Agentes
## Guia Completo de Todas as Funcionalidades e Agentes Inteligentes Implementados

**Repositório:** https://github.com/pedroviveiros2025/grantfounders  
**Plataforma:** GrantFounders™ Federal Funding Intelligence  
**Versão:** GF-777ACE-Quantum-v3.0  
**Última Atualização:** 31 de Dezembro de 2025

---

## 📋 Índice

1. [Introdução](#introdução)
2. [Schema Core do Banco de Dados](#1-schema-core-do-banco-de-dados-com-isolamento-multi-tenant)
3. [Camada API Serverless](#2-camada-api-serverless-sobre-supabase)
4. [Interface Demo do Chatbot](#3-interface-demo-do-chatbot-para-decision-engine-api)
5. [Terminal de Prontidão para Grants Federais](#4-terminal-de-prontidão-para-grants-federais)
6. [Sistema Multi-Agente GrantFounders OS™](#5-sistema-multi-agente-grantfounders-os)
7. [Agente Federal FOA Harvester](#6-agente-federal-foa-harvester)
8. [Motor Match & Forecast](#7-motor-match--forecast)
9. [Agency DNA Builder](#8-agency-dna-builder)
10. [Arquitetura do Sistema](#arquitetura-do-sistema)
11. [Integração & Uso](#integração--uso)

---

## Introdução

GrantFounders™ é uma plataforma avançada de **Inteligência de Financiamento Federal** que usa inteligência artificial e análise comportamental para prever resultados de financiamento, combinar projetos com oportunidades e automatizar processos de solicitação de grants.

Este documento explica cada componente implementado na plataforma, baseado nos pull requests e issues concluídos.

---

## 1. Schema Core do Banco de Dados com Isolamento Multi-Tenant

**PR #1** | **Status:** ✅ Concluído | **Linhas Modificadas:** +4.214 -3

### O Que Faz

A fundação de toda a plataforma GrantFounders. Implementa um schema sofisticado PostgreSQL com **81 tabelas** projetado para:

- **Arquitetura multi-tenant** com Row-Level Security (RLS)
- **Rastreabilidade de decisões** - toda ação é registrada e auditável
- **Rastreamento de compliance** - garante que todas as operações atendam padrões federais
- **Soberania de dados** - dados de cada organização completamente isolados

### Componentes Principais

#### Organizações & Multi-Tenancy
- `organizations` - Entidades tenant principais
- `org_users` - Membros com acesso baseado em roles
- `org_subscriptions` - Gestão de assinaturas e billing
- `api_keys` - Geração e validação segura de API keys

#### Tabelas de Inteligência de Decisão
- `gf_assessment_inputs` - Dados brutos de projetos para avaliação
- `gf_decisions` - Decisões finais de pontuação e aprovação
- `audit_logs` - Trilha completa de auditoria
- `usage_events` - Rastreamento de uso de API por organização

#### Compliance & Segurança
- `compliance_firewall_rules` - Verificação automática de compliance
- `compliance_items` - Requisitos específicos de compliance
- `federal_hidden_taxonomy` - Base de conhecimento de contratos federais

### Recursos de Segurança

1. **Row-Level Security (RLS)** - Isolamento automático de dados por tenant
2. **Logging de Auditoria** - Toda mudança no banco é rastreada
3. **Autenticação por API Key** - Acesso seguro baseado em tokens
4. **Permissões Baseadas em Roles** - Roles de owner, admin, member e viewer

---

## 2. Camada API Serverless Sobre Supabase

**PR #2** | **Status:** ✅ Concluído | **Linhas Modificadas:** +778 -3

### O Que Faz

Uma camada API **production-grade** construída sobre rotas API do Next.js que fica entre aplicações cliente e o backend Supabase. Fornece:

- **Autenticação & Autorização** - Valida API keys e força controle de acesso
- **Validação de Requisições** - Usa schemas Zod para garantir integridade dos dados
- **Rate Limiting** - Protege contra abuso (120 req/min por key)
- **Suporte CORS** - Habilita requisições cross-origin
- **Respostas Padronizadas** - Tratamento consistente de erros

### Endpoints da API

#### `/api/health` - Health Check
Retorna status do sistema e informações de versão.

#### `/api/ace/score` - Motor de Pontuação ACE
Avalia projetos usando o algoritmo GF-777ACE.

**Entrada:** Parâmetros do projeto (orçamento, setor, scores ESG, etc.)  
**Saída:** Score ACE (0-100), tier (AAA/A/B/C) e decisão

#### `/api/auth` - Autenticação de Usuário
Gerencia signup e signin usando Supabase Auth.

#### `/api/stripe/checkout` - Processamento de Pagamento
Cria sessões de checkout Stripe para assinaturas.

#### `/api/stripe/webhook` - Eventos Stripe
Recebe eventos webhook do Stripe e cria API keys para novos clientes.

---

## 3. Interface Demo do Chatbot para Decision Engine API

**PR #3** | **Status:** ✅ Concluído | **Linhas Modificadas:** +759 -3

### O Que Faz

Uma **interface demo interativa** que mostra as capacidades do Decision Engine através de uma UI conversacional. Permite aos usuários:

- Testar o motor de pontuação ACE em tempo real
- Entender como diferentes parâmetros afetam as pontuações
- Visualizar lógica de decisão e classificações de tier
- Experimentar a API sem escrever código

### Recursos

- **Pontuação em Tempo Real** - Feedback instantâneo conforme parâmetros mudam
- **Árvore de Decisão Visual** - Mostra como a pontuação se traduz em decisões
- **Sliders de Parâmetros** - Controles intuitivos para todos os 13 parâmetros
- **Detalhamento da Pontuação** - Exibe contribuições ponderadas de cada fator
- **Capacidade de Export** - Gera relatórios compartilháveis

---

## 4. Terminal de Prontidão para Grants Federais

**PR #4** | **Status:** ✅ Concluído | **Linhas Modificadas:** +7.162

### O Que Faz

Um **terminal institucional de decisão production-grade** que serve como interface principal para avaliar prontidão para grants federais.

### Componentes

#### Interface de Avaliação de Projetos (`/projects/evaluate`)
- Formulário abrangente para entrada de detalhes do projeto
- Validação e orientação em tempo real
- Cálculo instantâneo de score ACE
- Recomendação de decisão com justificativa

#### Dashboard (`/dashboard`)
- Visão geral da organização e métricas
- Histórico de avaliações recentes
- Estatísticas de uso de API
- Status de assinatura e billing

### O Algoritmo ACE (GF-777ACE-Quantum-v3.0)

O kernel de pontuação **Alignment, Compliance, and Efficiency** que alimenta o motor de decisão:

#### Parâmetros de Entrada (13 totais):
1. `project_name` - Identificador do projeto
2. `sector` - gov/health/bank/fund
3. `budget` - Orçamento total (USD)
4. `duration_months` - Timeline do projeto
5. `beneficiaries` - Número de pessoas impactadas
6. `esg_score` - Pontuação Environmental, Social, Governance (0-100)
7. `risk_index` - Avaliação de risco (0-100)
8. `execution_capacity` - Capacidade da equipe de entregar (0-100)
9. `scalability` - Potencial de crescimento (0-100)
10. `strategic_value` - Alinhamento com objetivos estratégicos (0-100)
11. `compliance_score` - Compliance regulatório (0-100)
12. `expected_roi` - Retorno sobre investimento (%)

#### Extração de Features:
O algoritmo extrai 5 features chave:
- **Efficiency** (25% peso) - Utilização de orçamento, ROI, capacidade de execução
- **Governance** (25% peso) - Score de compliance, índice de risco
- **Sustainability** (20% peso) - Duração do projeto, escalabilidade
- **Impact** (20% peso) - Beneficiários, valor estratégico, ESG
- **Resilience** (10% peso) - Mitigação de risco, capacidade de execução

#### Tiers de Decisão:
- **AAA** (85-100): AUTO_APPROVED - Maior confiança, aprovação imediata
- **A** (70-84): REVIEW_REQUIRED - Candidato forte, precisa revisão especializada
- **B** (55-69): CONDITIONAL_APPROVAL - Possível com modificações
- **C** (0-54): BLOCKED - Não atende critérios mínimos

---

## 5. Sistema Multi-Agente GrantFounders OS™

**PR #5** | **Status:** ✅ Concluído | **Linhas Modificadas:** +6.567 -3

### O Que Faz

O **cérebro** do GrantFounders - um sistema multi-agente sofisticado que orquestra múltiplos agentes de IA para fornecer inteligência de financiamento abrangente. Pense nele como um "sistema operacional" para decisões de financiamento federal.

### Arquitetura de Agentes

#### 1. **Agente Compliance Firewall**
- **Função:** Valida propostas contra regulamentações federais
- **Fonte de Dados:** Tabela `compliance_firewall_rules`
- **Saída:** Passa/falha com detalhes específicos de violações

#### 2. **Agente de Otimização de Linguagem**
- **Função:** Analisa e otimiza linguagem de propostas
- **Fonte de Dados:** Tabela `dod_prompt_templates`
- **Saída:** Sugestões para terminologia específica de agências

#### 3. **Agente de Previsão de Orçamento**
- **Função:** Prevê valores prováveis de financiamento
- **Fonte de Dados:** Dados históricos de awards em `agency_award_events`
- **Saída:** Faixa de financiamento com intervalos de confiança

#### 4. **Agente de Avaliação de Risco**
- **Função:** Identifica riscos de execução e compliance
- **Fonte de Dados:** Parâmetros do projeto + padrões históricos
- **Saída:** Score de risco com recomendações de mitigação

#### 5. **Agente Otimizador de Timeline**
- **Função:** Sugere durações ótimas de projeto
- **Fonte de Dados:** Preferências de agências em `agency_market_dna`
- **Saída:** Timeline recomendada baseada em comportamento de agências

### Orquestração de Agentes

O sistema usa um **padrão de coordenador** onde:
1. Entrada é recebida do usuário ou API
2. Coordenador despacha tarefas para agentes relevantes
3. Cada agente realiza análise especializada
4. Resultados são agregados e ponderados
5. Decisão final é renderizada com rastreabilidade completa

---

## 6. Agente Federal FOA Harvester

**PR #6** | **Status:** ✅ Concluído | **Linhas Modificadas:** +3.806 -3

### O Que Faz

Um **pipeline autônomo de ingestão de dados** que continuamente coleta Oportunidades de Financiamento Federal (FOAs) de múltiplas fontes e as processa em dados estruturados e pesquisáveis.

### Fontes de Dados

1. **Grants.gov API** - Fonte primária para oportunidades de grants federais
2. **SAM.gov** - Oportunidades de contratação federal
3. **SBIR.gov** - Programas Small Business Innovation Research
4. **Portais específicos de agências** - Feeds diretos de agências federais

### Processo de Coleta

#### 1. **Fase de Descoberta**
- Escaneia fontes a cada 6 horas
- Identifica FOAs novas ou atualizadas
- Verifica mudanças de deadline

#### 2. **Fase de Extração**
- Baixa anúncios completos de oportunidades
- Extrai metadados:
  - ID da oportunidade
  - Título e descrição
  - Agência e programa
  - Valores de award (mín/máx)
  - Datas de deadline
  - Critérios de elegibilidade
  - Documentação requerida

#### 3. **Fase de Processamento**
- **Chunking de Texto:** Quebra documentos longos em segmentos
- **Geração de Embeddings:** Cria embeddings vetoriais para busca semântica
- **Mapeamento de Taxonomia:** Liga à taxonomia de programas federais
- **Validação de Qualidade:** Garante completude e precisão dos dados

#### 4. **Fase de Armazenamento**
- Tabela `foas` - Dados principais de oportunidades
- Tabela `funding_opportunities` - Metadados estendidos
- Tabela `grant_chunks` - Segmentos de texto com embeddings
- Tabela `funding_signals` - Sinais extraídos (keywords, requisitos)

### Capacidades de Busca Semântica

O harvester habilita **matching inteligente** através de:

```sql
-- Encontrar oportunidades similares a uma descrição de projeto
SELECT * FROM match_opportunities(
  query_embedding := project_description_vector,
  match_count := 20
);
```

### Recursos de Automação

- **Coletas Agendadas** - Executa automaticamente a cada 6 horas
- **Detecção de Mudanças** - Processa apenas oportunidades novas/atualizadas
- **Recuperação de Erros** - Tenta novamente coletas falhadas com backoff exponencial
- **Sistema de Notificações** - Alerta sobre novas oportunidades de alto valor

---

## 7. Motor Match & Forecast

**PR #8** | **Status:** ✅ Concluído | **Linhas Modificadas:** +5.712 -3

### O Que Faz

O **núcleo de inteligência preditiva** que combina projetos com oportunidades e prevê resultados de financiamento usando machine learning e análise comportamental.

### Algoritmo de Matching

#### 1. **Matching Semântico** (40% peso)
Usa embeddings vetoriais para encontrar oportunidades semanticamente similares ao projeto:
- Descrição do projeto → vetor de embedding
- Compara contra todos os embeddings de FOAs usando similaridade de cosseno
- Retorna top N matches com scores de similaridade

#### 2. **Matching de DNA de Agência** (30% peso)
Compara características do projeto contra padrões comportamentais de agências:
- Analisa decisões passadas de financiamento da agência
- Combina atributos do projeto com preferências da agência
- Ajusta para vieses específicos da agência

#### 3. **Matching de Compliance** (20% peso)
Garante que o projeto atende requisitos da oportunidade:
- Verifica critérios de elegibilidade
- Valida capacidades requeridas
- Identifica documentação faltante

#### 4. **Alinhamento de Orçamento** (10% peso)
Garante que o orçamento se encaixa nas expectativas da agência:
- Compara com tamanhos típicos de award
- Ajusta para tolerância de orçamento da agência
- Sinaliza riscos de orçamento acima/abaixo

### Pontuação de Match

Cada match recebe:
- **GF Rank** (0-100) - Qualidade geral do match
- **Approval Score** (0-100) - Probabilidade prevista de aprovação
- **Funding Forecast** ($) - Valor estimado do award

Armazenado na tabela `project_grant_matches`.

### Modelos de Previsão

#### Análise de Awards Históricos
- Analisa 100.000+ awards passados de `agency_award_events`
- Identifica padrões em:
  - Valores de award por agência e programa
  - Taxas de sucesso por tipo de projeto
  - Timeline de aplicação a decisão
  - Razões comuns de rejeição

#### Modelos Preditivos
- Tabela `funding_prediction_models` armazena artefatos de modelos ML
- Modelos treinados em:
  - Características do projeto
  - Padrões de comportamento de agências
  - Tendências sazonais de financiamento
  - Fatores políticos/econômicos

#### Componentes de Previsão
- **Previsão Base** - Valor mais provável do award
- **Faixa** - Valores mínimo e máximo esperados
- **Confiança** - Confiança estatística na previsão
- **Timing** - Datas esperadas de decisão e desembolso

Armazenado na tabela `funding_forecasts`.

### Exemplo de Uso

```typescript
// Combinar um projeto com todas as oportunidades
const matches = await matchProjectToOpportunities(projectId);

// Retorna array de matches ordenados por GF rank:
[
  {
    opportunity_id: "DOD-2025-SBIR-456",
    gf_rank: 94.2,
    approval_score: 87.3,
    funding_forecast: 1250000,
    deadline: "2025-09-15",
    match_rationale: "Forte alinhamento com foco em AI/ML..."
  },
  // ... mais matches
]
```

---

## 8. Agency DNA Builder

**PR #7** | **Status:** 🔴 Cancelado | **Linhas Modificadas:** +3.593 -3

### O Que Faz (Funcionalidade Pretendida)

O **Agency DNA Builder** foi projetado para criar **perfis comportamentais** de agências federais analisando seus padrões históricos de financiamento, comportamentos de tomada de decisão e preferências institucionais. Embora este PR tenha sido cancelado, funcionalidade similar existe no sistema completo.

### Recursos DNA Implementados (em PRs concluídos)

Mesmo que o PR #7 tenha sido cancelado, capacidades de DNA de agências foram integradas em outros componentes:

#### Perfis Comportamentais de Agências (tabela `agency_market_dna`)

Cada agência federal tem um perfil comportamental abrangente com:

**Métricas de Comportamento de Financiamento:**
- `total_funding_usd` - Capacidade total anual de financiamento
- `avg_award_size` - Valores típicos de awards
- `award_velocity` - Velocidade de decisões de financiamento
- `fiscal_allocation_pattern` - Quando deployam capital

**Métricas de Inovação & Risco:**
- `innovation_appetite_index` (0-100) - Vontade de financiar abordagens novas
- `risk_tolerance` (0-100) - Conforto com resultados incertos
- `disruption_tolerance` (0-100) - Abertura a tecnologias disruptivas

**Preferências Institucionais:**
- `small_business_bias_index` (0-100) - Preferência por pequenas empresas
- `sbir_sttr_affinity` (0-100) - Engajamento com programas SBIR/STTR
- `acquisition_readiness` (0-100) - Probabilidade de adquirir vs. conceder grant
- `autonomy_acceptance` (0-100) - Conforto com sistemas autônomos
- `digitalization_level` (0-100) - Maturidade de transformação digital

**Inteligência de Mercado:**
- `hot_verticals` (JSONB array) - Setores atualmente priorizados
- `underserved_domains` (JSONB array) - Áreas buscando soluções
- `incumbent_vendors` (JSONB array) - Principais contratados existentes
- `contracting_vehicles` (JSONB array) - Mecanismos de contrato preferidos

**Linguagem & Comunicação:**
- `funding_language_profile` (TEXT) - Terminologia e fraseamento preferidos
- `decision_making_language` (TEXT) - Como formulam decisões
- `application_keywords` (JSONB array) - Keywords que sinalizam alinhamento

### Recursos Baseados em DNA

#### 1. **Otimização de Linguagem**
Usa DNA de agência para sugerir linguagem ótima de proposta:
```sql
SELECT funding_language_profile 
FROM agency_market_dna 
WHERE agency_code = 'DOD';
-- Retorna: "mission-critical, dual-use, TRL 6+, transition-ready"
```

#### 2. **Recomendações de Orçamento**
Sugere orçamento ideal baseado em padrões de agência:
```sql
SELECT avg_award_size, award_ceiling, award_floor
FROM agency_market_dna
WHERE agency_code = 'NIH';
```

#### 3. **Otimização de Timeline**
Recomenda duração de projeto baseada em preferências de agência:
```sql
SELECT fiscal_allocation_pattern
FROM agency_market_dna
WHERE agency_code = 'NSF';
-- Retorna quando a agência tipicamente faz awards
```

#### 4. **Matching de Verticals**
Identifica se projeto alinha com prioridades de agência:
```sql
SELECT hot_verticals, underserved_domains
FROM agency_market_dna
WHERE agency_code = 'DOE';
-- Retorna: ["renewable energy", "grid modernization", "carbon capture"]
```

### Por Que Importa

DNA de Agência é o **ingrediente secreto** que torna as previsões do GrantFounders precisas. Em vez de matching genérico, o sistema:

1. **Entende psicologia de agências** - O que motiva suas decisões
2. **Fala sua língua** - Usa terminologia que preferem
3. **Prevê comportamento** - Sabe quando e como financiam
4. **Identifica oportunidades** - Detecta áreas subatendidas
5. **Otimiza posicionamento** - Posiciona projetos para máximo apelo

---

## Arquitetura do Sistema

### Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Server Components

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Next.js API Routes (Serverless)
- Edge Functions para processamento em tempo real

**AI/ML:**
- OpenAI GPT-4 (análise de texto)
- pgvector (busca semântica)
- Modelos ML customizados (previsão)

**Integrações:**
- Stripe (pagamentos)
- Grants.gov API
- SAM.gov API
- SBIR.gov

### Fluxo de Dados

```
Input do Usuário → Camada API → Autenticação → Validação → Motor de Decisão
                      ↓                                           ↓
              Rate Limiting                            Sistema Multi-Agente
                      ↓                                           ↓
             Usage Tracking                           Banco Supabase
                                                                  ↓
                                                      Resposta + Auditoria
```

### Arquitetura de Segurança

1. **Autenticação API** - Bearer tokens + owner secrets
2. **Row-Level Security** - Políticas RLS do PostgreSQL
3. **Logging de Auditoria** - Rastreabilidade completa
4. **Criptografia** - TLS em trânsito, criptografia em repouso
5. **Rate Limiting** - 120 req/min por organização
6. **Validação de Input** - Schemas Zod em todos os inputs

---

## Integração & Uso

### Para Desenvolvedores

**1. Obter API Key:**
```bash
# Comprar assinatura em https://www.grantfounders.com/pricing
# API key entregue via email após checkout
```

**2. Avaliar um Projeto:**
```typescript
const response = await fetch('https://www.grantfounders.com/api/ace/score', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    project_name: "AI Climate Monitor",
    sector: "gov",
    budget: 750000,
    duration_months: 24,
    beneficiaries: 50000,
    esg_score: 85,
    risk_index: 25,
    execution_capacity: 90,
    scalability: 75,
    strategic_value: 88,
    compliance_score: 92,
    expected_roi: 18
  })
});

const result = await response.json();
console.log(result.ace_score);  // 87
console.log(result.tier);       // "AAA"
console.log(result.decision);   // "AUTO_APPROVED"
```

### Para Organizações

**Acesso ao Dashboard:**
1. Visite https://www.grantfounders.com
2. Cadastre-se ou faça login
3. Navegue até /projects/evaluate
4. Entre com os detalhes do projeto
5. Receba score ACE instantâneo e recomendações

**Tiers de Assinatura:**
- **Free Trial** - 10 avaliações
- **Pro** - $99/mês - 100 avaliações, matching básico
- **Enterprise** - Custom - Avaliações ilimitadas, autopilot completo

---

## Conclusão

GrantFounders™ representa uma **mudança de paradigma** em inteligência de financiamento federal. Ao combinar:

- **IA multi-agente** para análise abrangente
- **DNA comportamental** para insights específicos de agências
- **Previsão preditiva** para probabilidade de resultados
- **Coleta autônoma** para descoberta de oportunidades
- **Matching semântico** para emparelhamento inteligente

...a plataforma transforma financiamento federal de uma **caixa preta** em um **processo previsível e otimizável**.

Cada agente e componente trabalha junto para fornecer inteligência de decisão de nível institucional que era anteriormente impossível de alcançar.

---

**Suporte:** support@grantfounders.com  
**Documentação:** https://docs.grantfounders.com  
**Status da API:** https://www.grantfounders.com/api/health

**Última Atualização:** 31 de Dezembro de 2025  
**Versão:** 1.0.0  
**Kernel:** GF-777ACE-Quantum-v3.0
