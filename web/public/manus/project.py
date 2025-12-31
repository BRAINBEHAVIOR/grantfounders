"""
GrantFounders Project Model
Database schema for project evaluations and analysis
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
from enum import Enum

db = SQLAlchemy()

class ProjectStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class RiskLevel(Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"

class Project(db.Model):
    __tablename__ = 'projects'
    
    # Primary identification
    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    
    # Project basic information
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    budget = db.Column(db.Float, nullable=False)
    duration_months = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    team_size = db.Column(db.Integer)
    previous_funding = db.Column(db.Float, default=0)
    keywords = db.Column(db.Text)  # JSON string
    target_audience = db.Column(db.Text)
    innovation_level = db.Column(db.String(20))
    
    # Processing status
    status = db.Column(db.Enum(ProjectStatus), default=ProjectStatus.PENDING)
    processing_started_at = db.Column(db.DateTime)
    processing_completed_at = db.Column(db.DateTime)
    processing_time_ms = db.Column(db.Integer)
    
    # AI Analysis Results
    overall_score = db.Column(db.Float)
    funding_probability = db.Column(db.Float)
    confidence_level = db.Column(db.Float)
    risk_assessment = db.Column(db.Enum(RiskLevel))
    recommendation = db.Column(db.String(50))
    
    # Detailed Scores (JSON)
    technical_feasibility = db.Column(db.Float)
    market_potential = db.Column(db.Float)
    team_capability = db.Column(db.Float)
    financial_viability = db.Column(db.Float)
    innovation_factor = db.Column(db.Float)
    social_impact = db.Column(db.Float)
    regulatory_compliance = db.Column(db.Float)
    
    # Analysis Insights (JSON strings)
    strengths = db.Column(db.Text)  # JSON array
    areas_for_improvement = db.Column(db.Text)  # JSON array
    strategic_recommendations = db.Column(db.Text)  # JSON array
    
    # Benchmarking data
    similar_projects_funded = db.Column(db.Integer)
    average_funding_amount = db.Column(db.Float)
    success_rate_category = db.Column(db.Float)
    percentile_ranking = db.Column(db.Integer)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reports = db.relationship('Report', backref='project', lazy=True, cascade='all, delete-orphan')
    opportunities = db.relationship('ProjectOpportunity', backref='project', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Project, self).__init__(**kwargs)
        if not self.id:
            import uuid
            self.id = f"proj_{uuid.uuid4().hex[:12]}"
    
    def to_dict(self):
        """Convert project to dictionary for API responses"""
        return {
            'project_id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'budget': self.budget,
            'duration_months': self.duration_months,
            'category': self.category,
            'team_size': self.team_size,
            'previous_funding': self.previous_funding,
            'keywords': json.loads(self.keywords) if self.keywords else [],
            'target_audience': self.target_audience,
            'innovation_level': self.innovation_level,
            'status': self.status.value if self.status else None,
            'processing_time_ms': self.processing_time_ms,
            'analysis': {
                'overall_score': self.overall_score,
                'funding_probability': self.funding_probability,
                'confidence_level': self.confidence_level,
                'risk_assessment': self.risk_assessment.value if self.risk_assessment else None,
                'recommendation': self.recommendation
            } if self.overall_score else None,
            'scores': {
                'technical_feasibility': self.technical_feasibility,
                'market_potential': self.market_potential,
                'team_capability': self.team_capability,
                'financial_viability': self.financial_viability,
                'innovation_factor': self.innovation_factor,
                'social_impact': self.social_impact,
                'regulatory_compliance': self.regulatory_compliance
            } if self.technical_feasibility else None,
            'insights': {
                'strengths': json.loads(self.strengths) if self.strengths else [],
                'areas_for_improvement': json.loads(self.areas_for_improvement) if self.areas_for_improvement else [],
                'strategic_recommendations': json.loads(self.strategic_recommendations) if self.strategic_recommendations else []
            } if self.strengths else None,
            'benchmarks': {
                'similar_projects_funded': self.similar_projects_funded,
                'average_funding_amount': self.average_funding_amount,
                'success_rate_category': self.success_rate_category,
                'percentile_ranking': self.percentile_ranking
            } if self.similar_projects_funded else None,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'updated_at': self.updated_at.isoformat() + 'Z' if self.updated_at else None
        }
    
    def set_keywords(self, keywords_list):
        """Set keywords as JSON string"""
        self.keywords = json.dumps(keywords_list)
    
    def get_keywords(self):
        """Get keywords as list"""
        return json.loads(self.keywords) if self.keywords else []
    
    def set_strengths(self, strengths_list):
        """Set strengths as JSON string"""
        self.strengths = json.dumps(strengths_list)
    
    def set_improvements(self, improvements_list):
        """Set areas for improvement as JSON string"""
        self.areas_for_improvement = json.dumps(improvements_list)
    
    def set_recommendations(self, recommendations_list):
        """Set strategic recommendations as JSON string"""
        self.strategic_recommendations = json.dumps(recommendations_list)


class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.String(50), primary_key=True)
    project_id = db.Column(db.String(50), db.ForeignKey('projects.id'), nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    
    # Report details
    report_type = db.Column(db.String(50), nullable=False)  # executive, technical, investor, grant_application
    format = db.Column(db.String(10), default='pdf')  # pdf, docx, html
    status = db.Column(db.String(20), default='pending')  # pending, generating, completed, failed
    
    # File information
    file_path = db.Column(db.String(500))
    file_size_bytes = db.Column(db.Integer)
    page_count = db.Column(db.Integer)
    download_url = db.Column(db.String(500))
    expires_at = db.Column(db.DateTime)
    
    # Custom branding
    branding_config = db.Column(db.Text)  # JSON string
    sections_included = db.Column(db.Text)  # JSON array
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    def __init__(self, **kwargs):
        super(Report, self).__init__(**kwargs)
        if not self.id:
            import uuid
            self.id = f"rpt_{uuid.uuid4().hex[:12]}"
    
    def to_dict(self):
        return {
            'report_id': self.id,
            'project_id': self.project_id,
            'report_type': self.report_type,
            'format': self.format,
            'status': self.status,
            'file_size_bytes': self.file_size_bytes,
            'page_count': self.page_count,
            'download_url': self.download_url,
            'expires_at': self.expires_at.isoformat() + 'Z' if self.expires_at else None,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'completed_at': self.completed_at.isoformat() + 'Z' if self.completed_at else None
        }


class FundingOpportunity(db.Model):
    __tablename__ = 'funding_opportunities'
    
    id = db.Column(db.String(50), primary_key=True)
    
    # Opportunity details
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text)
    funder_name = db.Column(db.String(200), nullable=False)
    funder_type = db.Column(db.String(50))  # government, foundation, private, corporate
    funder_country = db.Column(db.String(100))
    
    # Funding details
    min_amount = db.Column(db.Float)
    max_amount = db.Column(db.Float)
    currency = db.Column(db.String(10), default='USD')
    deadline = db.Column(db.DateTime)
    application_url = db.Column(db.String(500))
    
    # Categorization
    categories = db.Column(db.Text)  # JSON array
    focus_areas = db.Column(db.Text)  # JSON array
    eligibility_criteria = db.Column(db.Text)  # JSON array
    geographic_restrictions = db.Column(db.Text)  # JSON array
    
    # Metadata
    is_active = db.Column(db.Boolean, default=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    project_matches = db.relationship('ProjectOpportunity', backref='opportunity', lazy=True)
    
    def __init__(self, **kwargs):
        super(FundingOpportunity, self).__init__(**kwargs)
        if not self.id:
            import uuid
            self.id = f"opp_{uuid.uuid4().hex[:12]}"
    
    def to_dict(self):
        return {
            'opportunity_id': self.id,
            'title': self.title,
            'description': self.description,
            'funder': {
                'name': self.funder_name,
                'type': self.funder_type,
                'country': self.funder_country
            },
            'amount': {
                'min': self.min_amount,
                'max': self.max_amount,
                'currency': self.currency
            },
            'deadline': self.deadline.isoformat() + 'Z' if self.deadline else None,
            'application_url': self.application_url,
            'categories': json.loads(self.categories) if self.categories else [],
            'focus_areas': json.loads(self.focus_areas) if self.focus_areas else [],
            'eligibility': json.loads(self.eligibility_criteria) if self.eligibility_criteria else [],
            'geographic_restrictions': json.loads(self.geographic_restrictions) if self.geographic_restrictions else [],
            'is_active': self.is_active,
            'last_updated': self.last_updated.isoformat() + 'Z' if self.last_updated else None
        }


class ProjectOpportunity(db.Model):
    __tablename__ = 'project_opportunities'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.String(50), db.ForeignKey('projects.id'), nullable=False)
    opportunity_id = db.Column(db.String(50), db.ForeignKey('funding_opportunities.id'), nullable=False)
    
    # Matching analysis
    match_score = db.Column(db.Float, nullable=False)
    eligibility_score = db.Column(db.Float)
    confidence_level = db.Column(db.Float)
    
    # Matching details
    matching_criteria = db.Column(db.Text)  # JSON object
    recommendation_reason = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        opportunity_dict = self.opportunity.to_dict()
        opportunity_dict.update({
            'match_score': self.match_score,
            'eligibility_score': self.eligibility_score,
            'confidence_level': self.confidence_level,
            'matching_criteria': json.loads(self.matching_criteria) if self.matching_criteria else {},
            'recommendation_reason': self.recommendation_reason
        })
        return opportunity_dict

