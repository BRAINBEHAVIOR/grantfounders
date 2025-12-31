"""
GrantFounders Project Evaluation API Routes
Handles project submission, analysis, and results retrieval
"""

from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from datetime import datetime
import json
import uuid
import time

from src.models.user import db, User
from src.models.project import Project, ProjectStatus, RiskLevel
from src.models.subscription import Subscription, UsageLog
from src.ai_engine.abasensor_core import abasensor_engine

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/evaluate', methods=['POST'])
@cross_origin()
def evaluate_project():
    """
    Evaluate a project using Abasensor™ AI technology
    
    Expected payload:
    {
        "project_title": "string",
        "description": "string", 
        "budget": number,
        "duration_months": number,
        "category": "string",
        "team_size": number,
        "keywords": ["string"],
        "target_audience": "string",
        "innovation_level": "string"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['project_title', 'description', 'budget', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': {
                        'code': 'invalid_request',
                        'message': f'Missing required field: {field}',
                        'details': {'missing_fields': [field]}
                    }
                }), 400
        
        # Get user from API key (simplified for demo)
        api_key = request.headers.get('Authorization', '').replace('Bearer ', '')
        user = User.query.filter_by(api_key=api_key).first()
        
        if not user:
            # Create demo user for testing
            user = User(
                id=f"user_{uuid.uuid4().hex[:8]}",
                email="demo@grantfounders.com",
                name="Demo User",
                api_key=api_key or f"demo_key_{uuid.uuid4().hex[:8]}"
            )
            db.session.add(user)
            
            # Create demo subscription
            subscription = Subscription(
                user_id=user.id,
                plan='executive'
            )
            subscription.start_trial()
            db.session.add(subscription)
            db.session.commit()
        
        # Check subscription and usage limits
        subscription = Subscription.query.filter_by(user_id=user.id).first()
        if not subscription or not subscription.check_usage_limit('evaluations'):
            return jsonify({
                'error': {
                    'code': 'quota_exceeded',
                    'message': 'Monthly evaluation quota exceeded',
                    'details': {
                        'current_usage': subscription.monthly_evaluations_used if subscription else 0,
                        'limit': subscription.monthly_evaluations_limit if subscription else 0
                    }
                }
            }), 429
        
        # Create project record
        project = Project(
            user_id=user.id,
            title=data['project_title'],
            description=data['description'],
            budget=float(data['budget']),
            duration_months=data.get('duration_months', 12),
            category=data['category'],
            team_size=data.get('team_size', 1),
            target_audience=data.get('target_audience', ''),
            innovation_level=data.get('innovation_level', 'incremental'),
            status=ProjectStatus.PROCESSING,
            processing_started_at=datetime.utcnow()
        )
        
        # Set keywords
        if 'keywords' in data:
            project.set_keywords(data['keywords'])
        
        db.session.add(project)
        db.session.flush()  # Get project ID
        
        # Run AI analysis using Abasensor™ engine
        analysis_result = abasensor_engine.analyze_project({
            'title': project.title,
            'description': project.description,
            'budget': project.budget,
            'duration_months': project.duration_months,
            'category': project.category,
            'team_size': project.team_size,
            'keywords': project.get_keywords(),
            'target_audience': project.target_audience,
            'innovation_level': project.innovation_level,
            'previous_funding': data.get('previous_funding', 0)
        })
        
        # Update project with analysis results
        project.status = ProjectStatus.COMPLETED
        project.processing_completed_at = datetime.utcnow()
        project.processing_time_ms = analysis_result.processing_time_ms
        
        # Overall analysis
        project.overall_score = analysis_result.overall_score
        project.funding_probability = analysis_result.funding_probability
        project.confidence_level = analysis_result.confidence_level
        project.risk_assessment = RiskLevel(analysis_result.risk_assessment)
        project.recommendation = analysis_result.recommendation
        
        # Detailed scores
        scores = analysis_result.detailed_scores
        project.technical_feasibility = scores.get('technical_feasibility')
        project.market_potential = scores.get('market_potential')
        project.team_capability = scores.get('team_capability')
        project.financial_viability = scores.get('financial_viability')
        project.innovation_factor = scores.get('innovation_factor')
        project.social_impact = scores.get('social_impact')
        project.regulatory_compliance = scores.get('regulatory_compliance')
        
        # Insights
        insights = analysis_result.insights
        project.set_strengths(insights.get('strengths', []))
        project.set_improvements(insights.get('areas_for_improvement', []))
        project.set_recommendations(insights.get('strategic_recommendations', []))
        
        # Benchmarks
        benchmarks = analysis_result.benchmarks
        project.similar_projects_funded = benchmarks.get('similar_projects_funded')
        project.average_funding_amount = benchmarks.get('average_funding_amount')
        project.success_rate_category = benchmarks.get('success_rate_category')
        project.percentile_ranking = benchmarks.get('percentile_ranking')
        
        # Update usage tracking
        if subscription:
            subscription.increment_usage('evaluations')
            
            # Log usage
            usage_log = UsageLog(
                subscription_id=subscription.id,
                user_id=user.id,
                action_type='evaluation',
                resource_id=project.id,
                usage_metadata=json.dumps({
                    'category': project.category,
                    'budget': project.budget,
                    'score': project.overall_score
                }),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', '')
            )
            db.session.add(usage_log)
        
        db.session.commit()
        
        # Return analysis results
        response = project.to_dict()
        
        return jsonify(response), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Project evaluation failed: {str(e)}")
        
        return jsonify({
            'error': {
                'code': 'processing_failed',
                'message': 'Project evaluation failed',
                'details': {'error': str(e)}
            }
        }), 500

@projects_bp.route('/<project_id>', methods=['GET'])
@cross_origin()
def get_project(project_id):
    """Get project details and analysis results"""
    try:
        # Get user from API key
        api_key = request.headers.get('Authorization', '').replace('Bearer ', '')
        user = User.query.filter_by(api_key=api_key).first()
        
        if not user:
            return jsonify({
                'error': {
                    'code': 'unauthorized',
                    'message': 'Invalid API key'
                }
            }), 401
        
        # Get project
        project = Project.query.filter_by(id=project_id, user_id=user.id).first()
        
        if not project:
            return jsonify({
                'error': {
                    'code': 'resource_not_found',
                    'message': 'Project not found'
                }
            }), 404
        
        return jsonify(project.to_dict()), 200
        
    except Exception as e:
        current_app.logger.error(f"Get project failed: {str(e)}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'Failed to retrieve project'
            }
        }), 500

@projects_bp.route('/', methods=['GET'])
@cross_origin()
def list_projects():
    """List user's projects with pagination"""
    try:
        # Get user from API key
        api_key = request.headers.get('Authorization', '').replace('Bearer ', '')
        user = User.query.filter_by(api_key=api_key).first()
        
        if not user:
            return jsonify({
                'error': {
                    'code': 'unauthorized',
                    'message': 'Invalid API key'
                }
            }), 401
        
        # Pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        # Filters
        category = request.args.get('category')
        status = request.args.get('status')
        
        # Build query
        query = Project.query.filter_by(user_id=user.id)
        
        if category:
            query = query.filter_by(category=category)
        
        if status:
            query = query.filter_by(status=ProjectStatus(status))
        
        # Order by creation date (newest first)
        query = query.order_by(Project.created_at.desc())
        
        # Paginate
        projects = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'projects': [project.to_dict() for project in projects.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': projects.total,
                'pages': projects.pages,
                'has_next': projects.has_next,
                'has_prev': projects.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"List projects failed: {str(e)}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'Failed to retrieve projects'
            }
        }), 500

@projects_bp.route('/batch', methods=['POST'])
@cross_origin()
def batch_evaluate():
    """Batch evaluate multiple projects"""
    try:
        data = request.get_json()
        
        if 'projects' not in data or not isinstance(data['projects'], list):
            return jsonify({
                'error': {
                    'code': 'invalid_request',
                    'message': 'Missing or invalid projects array'
                }
            }), 400
        
        if len(data['projects']) > 10:
            return jsonify({
                'error': {
                    'code': 'invalid_request',
                    'message': 'Maximum 10 projects per batch'
                }
            }), 400
        
        # Get user from API key
        api_key = request.headers.get('Authorization', '').replace('Bearer ', '')
        user = User.query.filter_by(api_key=api_key).first()
        
        if not user:
            return jsonify({
                'error': {
                    'code': 'unauthorized',
                    'message': 'Invalid API key'
                }
            }), 401
        
        # Check subscription and usage limits
        subscription = Subscription.query.filter_by(user_id=user.id).first()
        if not subscription:
            return jsonify({
                'error': {
                    'code': 'subscription_required',
                    'message': 'Active subscription required for batch processing'
                }
            }), 403
        
        batch_size = len(data['projects'])
        if not subscription.check_usage_limit('evaluations') or \
           subscription.monthly_evaluations_used + batch_size > subscription.monthly_evaluations_limit:
            return jsonify({
                'error': {
                    'code': 'quota_exceeded',
                    'message': 'Insufficient evaluation quota for batch size'
                }
            }), 429
        
        results = []
        
        for project_data in data['projects']:
            try:
                # Validate required fields
                required_fields = ['project_title', 'description', 'budget', 'category']
                for field in required_fields:
                    if field not in project_data:
                        results.append({
                            'status': 'failed',
                            'error': f'Missing required field: {field}',
                            'project_title': project_data.get('project_title', 'Unknown')
                        })
                        continue
                
                # Create project record
                project = Project(
                    user_id=user.id,
                    title=project_data['project_title'],
                    description=project_data['description'],
                    budget=float(project_data['budget']),
                    duration_months=project_data.get('duration_months', 12),
                    category=project_data['category'],
                    team_size=project_data.get('team_size', 1),
                    target_audience=project_data.get('target_audience', ''),
                    innovation_level=project_data.get('innovation_level', 'incremental'),
                    status=ProjectStatus.PROCESSING,
                    processing_started_at=datetime.utcnow()
                )
                
                if 'keywords' in project_data:
                    project.set_keywords(project_data['keywords'])
                
                db.session.add(project)
                db.session.flush()
                
                # Run AI analysis
                analysis_result = abasensor_engine.analyze_project({
                    'title': project.title,
                    'description': project.description,
                    'budget': project.budget,
                    'duration_months': project.duration_months,
                    'category': project.category,
                    'team_size': project.team_size,
                    'keywords': project.get_keywords(),
                    'target_audience': project.target_audience,
                    'innovation_level': project.innovation_level
                })
                
                # Update project with results (same as single evaluation)
                project.status = ProjectStatus.COMPLETED
                project.processing_completed_at = datetime.utcnow()
                project.processing_time_ms = analysis_result.processing_time_ms
                project.overall_score = analysis_result.overall_score
                project.funding_probability = analysis_result.funding_probability
                project.confidence_level = analysis_result.confidence_level
                project.risk_assessment = RiskLevel(analysis_result.risk_assessment)
                project.recommendation = analysis_result.recommendation
                
                # Update usage
                subscription.increment_usage('evaluations')
                
                results.append({
                    'status': 'completed',
                    'project_id': project.id,
                    'project_title': project.title,
                    'overall_score': project.overall_score,
                    'funding_probability': project.funding_probability,
                    'recommendation': project.recommendation
                })
                
            except Exception as e:
                results.append({
                    'status': 'failed',
                    'error': str(e),
                    'project_title': project_data.get('project_title', 'Unknown')
                })
        
        db.session.commit()
        
        return jsonify({
            'batch_id': f"batch_{uuid.uuid4().hex[:8]}",
            'total_projects': len(data['projects']),
            'completed': len([r for r in results if r['status'] == 'completed']),
            'failed': len([r for r in results if r['status'] == 'failed']),
            'results': results
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Batch evaluation failed: {str(e)}")
        return jsonify({
            'error': {
                'code': 'processing_failed',
                'message': 'Batch evaluation failed'
            }
        }), 500

@projects_bp.route('/analytics', methods=['GET'])
@cross_origin()
def get_analytics():
    """Get project analytics and trends"""
    try:
        # Get user from API key
        api_key = request.headers.get('Authorization', '').replace('Bearer ', '')
        user = User.query.filter_by(api_key=api_key).first()
        
        if not user:
            return jsonify({
                'error': {
                    'code': 'unauthorized',
                    'message': 'Invalid API key'
                }
            }), 401
        
        # Get user's projects
        projects = Project.query.filter_by(user_id=user.id).all()
        
        if not projects:
            return jsonify({
                'message': 'No projects found for analytics',
                'analytics': {
                    'total_projects': 0,
                    'average_score': 0,
                    'success_rate': 0
                }
            }), 200
        
        # Calculate analytics
        total_projects = len(projects)
        completed_projects = [p for p in projects if p.status == ProjectStatus.COMPLETED]
        
        if completed_projects:
            average_score = sum(p.overall_score for p in completed_projects) / len(completed_projects)
            high_probability_projects = len([p for p in completed_projects if p.funding_probability >= 0.7])
            success_rate = high_probability_projects / len(completed_projects)
            
            # Category breakdown
            category_stats = {}
            for project in completed_projects:
                cat = project.category
                if cat not in category_stats:
                    category_stats[cat] = {'count': 0, 'avg_score': 0, 'total_score': 0}
                category_stats[cat]['count'] += 1
                category_stats[cat]['total_score'] += project.overall_score
            
            for cat in category_stats:
                category_stats[cat]['avg_score'] = category_stats[cat]['total_score'] / category_stats[cat]['count']
                del category_stats[cat]['total_score']
            
            # Recent trends (last 30 days)
            from datetime import timedelta
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_projects = [p for p in completed_projects if p.created_at >= thirty_days_ago]
            
            analytics = {
                'total_projects': total_projects,
                'completed_projects': len(completed_projects),
                'average_score': round(average_score, 1),
                'success_rate': round(success_rate, 2),
                'high_probability_projects': high_probability_projects,
                'category_breakdown': category_stats,
                'recent_activity': {
                    'projects_last_30_days': len(recent_projects),
                    'avg_score_recent': round(sum(p.overall_score for p in recent_projects) / len(recent_projects), 1) if recent_projects else 0
                },
                'top_performing_project': {
                    'title': max(completed_projects, key=lambda p: p.overall_score).title,
                    'score': max(p.overall_score for p in completed_projects),
                    'category': max(completed_projects, key=lambda p: p.overall_score).category
                } if completed_projects else None
            }
        else:
            analytics = {
                'total_projects': total_projects,
                'completed_projects': 0,
                'average_score': 0,
                'success_rate': 0,
                'message': 'No completed projects for detailed analytics'
            }
        
        return jsonify({'analytics': analytics}), 200
        
    except Exception as e:
        current_app.logger.error(f"Analytics failed: {str(e)}")
        return jsonify({
            'error': {
                'code': 'internal_error',
                'message': 'Failed to generate analytics'
            }
        }), 500

