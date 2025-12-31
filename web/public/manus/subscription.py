"""
GrantFounders Subscription & Billing Models
Database schema for SaaS subscription management and revenue tracking
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from enum import Enum
import json

db = SQLAlchemy()

class SubscriptionPlan(Enum):
    STARTER = "starter"
    EXECUTIVE = "executive"
    STRATEGIC = "strategic"
    ENTERPRISE = "enterprise"

class SubscriptionStatus(Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"
    PAUSED = "paused"

class PaymentStatus(Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    
    # Subscription details
    plan = db.Column(db.Enum(SubscriptionPlan), nullable=False)
    status = db.Column(db.Enum(SubscriptionStatus), default=SubscriptionStatus.TRIALING)
    
    # Pricing
    monthly_price = db.Column(db.Float, nullable=False)
    annual_price = db.Column(db.Float)
    billing_cycle = db.Column(db.String(20), default='monthly')  # monthly, annual
    currency = db.Column(db.String(10), default='USD')
    
    # Dates
    trial_start = db.Column(db.DateTime)
    trial_end = db.Column(db.DateTime)
    current_period_start = db.Column(db.DateTime)
    current_period_end = db.Column(db.DateTime)
    canceled_at = db.Column(db.DateTime)
    
    # Usage limits and tracking
    monthly_evaluations_limit = db.Column(db.Integer)
    monthly_evaluations_used = db.Column(db.Integer, default=0)
    monthly_reports_limit = db.Column(db.Integer)
    monthly_reports_used = db.Column(db.Integer, default=0)
    api_calls_limit = db.Column(db.Integer)
    api_calls_used = db.Column(db.Integer, default=0)
    
    # Features
    dashboard_access = db.Column(db.Boolean, default=False)
    api_access = db.Column(db.Boolean, default=False)
    priority_support = db.Column(db.Boolean, default=False)
    custom_branding = db.Column(db.Boolean, default=False)
    white_label = db.Column(db.Boolean, default=False)
    dedicated_support = db.Column(db.Boolean, default=False)
    
    # Payment integration
    stripe_subscription_id = db.Column(db.String(100))
    stripe_customer_id = db.Column(db.String(100))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    payments = db.relationship('Payment', backref='subscription', lazy=True)
    usage_logs = db.relationship('UsageLog', backref='subscription', lazy=True)
    
    def __init__(self, **kwargs):
        super(Subscription, self).__init__(**kwargs)
        if not self.id:
            import uuid
            self.id = f"sub_{uuid.uuid4().hex[:12]}"
        
        # Set plan-specific defaults
        self._set_plan_defaults()
    
    def _set_plan_defaults(self):
        """Set default values based on subscription plan"""
        plan_configs = {
            SubscriptionPlan.STARTER: {
                'monthly_price': 497.0,
                'annual_price': 4970.0,
                'monthly_evaluations_limit': 5,
                'monthly_reports_limit': 5,
                'api_calls_limit': 1000,
                'dashboard_access': False,
                'api_access': False,
                'priority_support': False
            },
            SubscriptionPlan.EXECUTIVE: {
                'monthly_price': 1997.0,
                'annual_price': 19970.0,
                'monthly_evaluations_limit': -1,  # unlimited
                'monthly_reports_limit': -1,
                'api_calls_limit': 10000,
                'dashboard_access': True,
                'api_access': True,
                'priority_support': True
            },
            SubscriptionPlan.STRATEGIC: {
                'monthly_price': 4997.0,
                'annual_price': 49970.0,
                'monthly_evaluations_limit': -1,
                'monthly_reports_limit': -1,
                'api_calls_limit': 50000,
                'dashboard_access': True,
                'api_access': True,
                'priority_support': True,
                'custom_branding': True,
                'white_label': True,
                'dedicated_support': True
            },
            SubscriptionPlan.ENTERPRISE: {
                'monthly_price': 9997.0,
                'annual_price': 99970.0,
                'monthly_evaluations_limit': -1,
                'monthly_reports_limit': -1,
                'api_calls_limit': -1,  # unlimited
                'dashboard_access': True,
                'api_access': True,
                'priority_support': True,
                'custom_branding': True,
                'white_label': True,
                'dedicated_support': True
            }
        }
        
        if self.plan in plan_configs:
            config = plan_configs[self.plan]
            for key, value in config.items():
                if not hasattr(self, key) or getattr(self, key) is None:
                    setattr(self, key, value)
    
    def start_trial(self, trial_days=14):
        """Start a trial period"""
        self.status = SubscriptionStatus.TRIALING
        self.trial_start = datetime.utcnow()
        self.trial_end = self.trial_start + timedelta(days=trial_days)
        self.current_period_start = self.trial_start
        self.current_period_end = self.trial_end
    
    def activate_subscription(self):
        """Activate the subscription after trial or payment"""
        self.status = SubscriptionStatus.ACTIVE
        now = datetime.utcnow()
        
        if self.billing_cycle == 'annual':
            self.current_period_end = now + timedelta(days=365)
        else:
            self.current_period_end = now + timedelta(days=30)
        
        self.current_period_start = now
    
    def can_use_feature(self, feature_name):
        """Check if user can use a specific feature"""
        return getattr(self, feature_name, False)
    
    def check_usage_limit(self, usage_type):
        """Check if user has exceeded usage limits"""
        limit_attr = f"monthly_{usage_type}_limit"
        used_attr = f"monthly_{usage_type}_used"
        
        limit = getattr(self, limit_attr, 0)
        used = getattr(self, used_attr, 0)
        
        # -1 means unlimited
        if limit == -1:
            return True
        
        return used < limit
    
    def increment_usage(self, usage_type, amount=1):
        """Increment usage counter"""
        used_attr = f"monthly_{usage_type}_used"
        current_used = getattr(self, used_attr, 0)
        setattr(self, used_attr, current_used + amount)
    
    def reset_monthly_usage(self):
        """Reset monthly usage counters"""
        self.monthly_evaluations_used = 0
        self.monthly_reports_used = 0
        self.api_calls_used = 0
    
    def to_dict(self):
        return {
            'subscription_id': self.id,
            'user_id': self.user_id,
            'plan': self.plan.value,
            'status': self.status.value,
            'pricing': {
                'monthly_price': self.monthly_price,
                'annual_price': self.annual_price,
                'billing_cycle': self.billing_cycle,
                'currency': self.currency
            },
            'trial': {
                'start': self.trial_start.isoformat() + 'Z' if self.trial_start else None,
                'end': self.trial_end.isoformat() + 'Z' if self.trial_end else None
            },
            'current_period': {
                'start': self.current_period_start.isoformat() + 'Z' if self.current_period_start else None,
                'end': self.current_period_end.isoformat() + 'Z' if self.current_period_end else None
            },
            'usage': {
                'evaluations': {
                    'limit': self.monthly_evaluations_limit,
                    'used': self.monthly_evaluations_used
                },
                'reports': {
                    'limit': self.monthly_reports_limit,
                    'used': self.monthly_reports_used
                },
                'api_calls': {
                    'limit': self.api_calls_limit,
                    'used': self.api_calls_used
                }
            },
            'features': {
                'dashboard_access': self.dashboard_access,
                'api_access': self.api_access,
                'priority_support': self.priority_support,
                'custom_branding': self.custom_branding,
                'white_label': self.white_label,
                'dedicated_support': self.dedicated_support
            },
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None
        }


class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.String(50), primary_key=True)
    subscription_id = db.Column(db.String(50), db.ForeignKey('subscriptions.id'), nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    
    # Payment details
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='USD')
    status = db.Column(db.Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Payment method
    payment_method = db.Column(db.String(50))  # card, bank_transfer, etc.
    payment_processor = db.Column(db.String(50), default='stripe')
    
    # External references
    stripe_payment_intent_id = db.Column(db.String(100))
    stripe_charge_id = db.Column(db.String(100))
    
    # Billing period
    billing_period_start = db.Column(db.DateTime)
    billing_period_end = db.Column(db.DateTime)
    
    # Metadata
    description = db.Column(db.String(500))
    invoice_url = db.Column(db.String(500))
    receipt_url = db.Column(db.String(500))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    paid_at = db.Column(db.DateTime)
    failed_at = db.Column(db.DateTime)
    
    def __init__(self, **kwargs):
        super(Payment, self).__init__(**kwargs)
        if not self.id:
            import uuid
            self.id = f"pay_{uuid.uuid4().hex[:12]}"
    
    def to_dict(self):
        return {
            'payment_id': self.id,
            'subscription_id': self.subscription_id,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status.value,
            'payment_method': self.payment_method,
            'description': self.description,
            'billing_period': {
                'start': self.billing_period_start.isoformat() + 'Z' if self.billing_period_start else None,
                'end': self.billing_period_end.isoformat() + 'Z' if self.billing_period_end else None
            },
            'invoice_url': self.invoice_url,
            'receipt_url': self.receipt_url,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'paid_at': self.paid_at.isoformat() + 'Z' if self.paid_at else None
        }


class UsageLog(db.Model):
    __tablename__ = 'usage_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    subscription_id = db.Column(db.String(50), db.ForeignKey('subscriptions.id'), nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    
    # Usage details
    action_type = db.Column(db.String(50), nullable=False)  # evaluation, report, api_call
    resource_id = db.Column(db.String(50))  # project_id, report_id, etc.
    
    # Metadata
    usage_metadata = db.Column(db.Text)  # JSON string for additional data
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'subscription_id': self.subscription_id,
            'user_id': self.user_id,
            'action_type': self.action_type,
            'resource_id': self.resource_id,
            'metadata': json.loads(self.usage_metadata) if self.usage_metadata else {},
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None
        }


class Revenue(db.Model):
    __tablename__ = 'revenue'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Revenue tracking
    date = db.Column(db.Date, nullable=False)
    monthly_recurring_revenue = db.Column(db.Float, default=0)
    annual_recurring_revenue = db.Column(db.Float, default=0)
    one_time_revenue = db.Column(db.Float, default=0)
    
    # Customer metrics
    new_customers = db.Column(db.Integer, default=0)
    churned_customers = db.Column(db.Integer, default=0)
    active_subscriptions = db.Column(db.Integer, default=0)
    
    # Plan breakdown
    starter_subscriptions = db.Column(db.Integer, default=0)
    executive_subscriptions = db.Column(db.Integer, default=0)
    strategic_subscriptions = db.Column(db.Integer, default=0)
    enterprise_subscriptions = db.Column(db.Integer, default=0)
    
    # Usage metrics
    total_evaluations = db.Column(db.Integer, default=0)
    total_reports = db.Column(db.Integer, default=0)
    total_api_calls = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'date': self.date.isoformat(),
            'revenue': {
                'monthly_recurring': self.monthly_recurring_revenue,
                'annual_recurring': self.annual_recurring_revenue,
                'one_time': self.one_time_revenue,
                'total': self.monthly_recurring_revenue + self.annual_recurring_revenue + self.one_time_revenue
            },
            'customers': {
                'new': self.new_customers,
                'churned': self.churned_customers,
                'active': self.active_subscriptions
            },
            'plan_distribution': {
                'starter': self.starter_subscriptions,
                'executive': self.executive_subscriptions,
                'strategic': self.strategic_subscriptions,
                'enterprise': self.enterprise_subscriptions
            },
            'usage': {
                'evaluations': self.total_evaluations,
                'reports': self.total_reports,
                'api_calls': self.total_api_calls
            }
        }

