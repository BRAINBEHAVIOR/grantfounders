"""
GrantFounders User Model
Database schema for user management and authentication
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import hashlib

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    # Primary identification
    id = db.Column(db.String(50), primary_key=True)
    
    # Basic user information
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=True)
    
    # Authentication
    password_hash = db.Column(db.String(255))
    api_key = db.Column(db.String(100), unique=True, nullable=False)
    
    # Profile information
    organization = db.Column(db.String(200))
    job_title = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    country = db.Column(db.String(100))
    
    # Account status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    email_verified_at = db.Column(db.DateTime)
    
    # Preferences
    timezone = db.Column(db.String(50), default='UTC')
    language = db.Column(db.String(10), default='en')
    notification_preferences = db.Column(db.Text)  # JSON string
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = db.Column(db.DateTime)
    
    # Note: Relationships defined in related models to avoid circular imports
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        if not self.id:
            self.id = f"user_{uuid.uuid4().hex[:12]}"
        if not self.api_key:
            self.api_key = self.generate_api_key()
    
    def generate_api_key(self):
        """Generate a unique API key for the user"""
        unique_string = f"{self.email}{datetime.utcnow().isoformat()}{uuid.uuid4().hex}"
        return f"gf_{hashlib.sha256(unique_string.encode()).hexdigest()[:32]}"
    
    def regenerate_api_key(self):
        """Regenerate API key (for security purposes)"""
        self.api_key = self.generate_api_key()
        return self.api_key
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return self.password_hash == hashlib.sha256(password.encode()).hexdigest()
    
    def get_active_subscription(self):
        """Get user's active subscription"""
        from src.models.subscription import Subscription, SubscriptionStatus
        return Subscription.query.filter_by(
            user_id=self.id,
            status=SubscriptionStatus.ACTIVE
        ).first()
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login_at = datetime.utcnow()
    
    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary for API responses"""
        user_dict = {
            'user_id': self.id,
            'email': self.email,
            'name': self.name,
            'username': self.username,
            'organization': self.organization,
            'job_title': self.job_title,
            'country': self.country,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'timezone': self.timezone,
            'language': self.language,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'last_login_at': self.last_login_at.isoformat() + 'Z' if self.last_login_at else None
        }
        
        if include_sensitive:
            user_dict['api_key'] = self.api_key
            user_dict['phone'] = self.phone
        
        return user_dict
    
    def __repr__(self):
        return f'<User {self.email}>'

