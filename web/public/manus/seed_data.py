#!/usr/bin/env python3
"""
GrantFounders Database Seeding Script
Populates the database with sample funding opportunities and test data
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User
from src.models.project import Project, FundingOpportunity, Report, ProjectOpportunity
from src.models.subscription import Subscription, Payment, UsageLog, Revenue
from datetime import datetime, timedelta
import json

def seed_funding_opportunities():
    """Seed the database with realistic funding opportunities"""
    
    opportunities = [
        {
            'title': 'AI for Climate Solutions Challenge',
            'description': 'Seeking innovative AI solutions to address climate change challenges including carbon capture, renewable energy optimization, and environmental monitoring.',
            'funder_name': 'Climate Innovation Fund',
            'funder_type': 'foundation',
            'funder_country': 'United States',
            'min_amount': 500000,
            'max_amount': 2000000,
            'deadline': datetime.utcnow() + timedelta(days=90),
            'application_url': 'https://climateinnovation.org/apply',
            'categories': ['technology', 'environment'],
            'focus_areas': ['artificial intelligence', 'climate change', 'sustainability'],
            'eligibility_criteria': ['Non-profit organizations', 'Research institutions', 'Tech startups'],
            'geographic_restrictions': ['North America', 'Europe']
        },
        {
            'title': 'Healthcare Innovation Grant Program',
            'description': 'Supporting breakthrough healthcare technologies that improve patient outcomes and reduce costs through digital health, precision medicine, and medical devices.',
            'funder_name': 'National Health Foundation',
            'funder_type': 'government',
            'funder_country': 'United States',
            'min_amount': 250000,
            'max_amount': 1500000,
            'deadline': datetime.utcnow() + timedelta(days=120),
            'application_url': 'https://nhf.gov/grants/healthcare-innovation',
            'categories': ['healthcare', 'technology'],
            'focus_areas': ['digital health', 'precision medicine', 'medical devices'],
            'eligibility_criteria': ['Healthcare organizations', 'Medical research institutions', 'Biotech companies'],
            'geographic_restrictions': ['United States']
        },
        {
            'title': 'Renewable Energy Research Initiative',
            'description': 'Funding advanced research in renewable energy technologies including solar, wind, battery storage, and smart grid solutions.',
            'funder_name': 'Department of Energy',
            'funder_type': 'government',
            'funder_country': 'United States',
            'min_amount': 1000000,
            'max_amount': 5000000,
            'deadline': datetime.utcnow() + timedelta(days=150),
            'application_url': 'https://energy.gov/funding/renewable-research',
            'categories': ['energy', 'technology'],
            'focus_areas': ['renewable energy', 'battery storage', 'smart grid'],
            'eligibility_criteria': ['Universities', 'National laboratories', 'Energy companies'],
            'geographic_restrictions': ['United States', 'Canada']
        },
        {
            'title': 'Social Impact Technology Fund',
            'description': 'Supporting technology solutions that address social challenges including education access, poverty reduction, and community development.',
            'funder_name': 'Global Social Impact Foundation',
            'funder_type': 'foundation',
            'funder_country': 'International',
            'min_amount': 100000,
            'max_amount': 750000,
            'deadline': datetime.utcnow() + timedelta(days=60),
            'application_url': 'https://gsif.org/apply',
            'categories': ['social_impact', 'technology'],
            'focus_areas': ['education', 'poverty reduction', 'community development'],
            'eligibility_criteria': ['Non-profit organizations', 'Social enterprises', 'Community organizations'],
            'geographic_restrictions': ['Global']
        },
        {
            'title': 'Advanced Manufacturing Innovation Program',
            'description': 'Funding for innovative manufacturing technologies including automation, robotics, 3D printing, and Industry 4.0 solutions.',
            'funder_name': 'Manufacturing Innovation Institute',
            'funder_type': 'private',
            'funder_country': 'United States',
            'min_amount': 300000,
            'max_amount': 1200000,
            'deadline': datetime.utcnow() + timedelta(days=75),
            'application_url': 'https://mii.org/funding',
            'categories': ['technology', 'research'],
            'focus_areas': ['automation', 'robotics', '3d printing', 'industry 4.0'],
            'eligibility_criteria': ['Manufacturing companies', 'Research institutions', 'Technology startups'],
            'geographic_restrictions': ['United States', 'Mexico', 'Canada']
        },
        {
            'title': 'Digital Education Transformation Grant',
            'description': 'Supporting innovative digital education platforms and tools that enhance learning outcomes and accessibility.',
            'funder_name': 'Education Innovation Council',
            'funder_type': 'foundation',
            'funder_country': 'United Kingdom',
            'min_amount': 150000,
            'max_amount': 800000,
            'deadline': datetime.utcnow() + timedelta(days=45),
            'application_url': 'https://eic.uk/grants',
            'categories': ['education', 'technology'],
            'focus_areas': ['digital learning', 'educational technology', 'accessibility'],
            'eligibility_criteria': ['Educational institutions', 'EdTech companies', 'Non-profit organizations'],
            'geographic_restrictions': ['United Kingdom', 'European Union']
        },
        {
            'title': 'Quantum Computing Research Fund',
            'description': 'Advancing quantum computing research and applications in cryptography, optimization, and scientific computing.',
            'funder_name': 'Quantum Research Consortium',
            'funder_type': 'private',
            'funder_country': 'United States',
            'min_amount': 2000000,
            'max_amount': 10000000,
            'deadline': datetime.utcnow() + timedelta(days=180),
            'application_url': 'https://qrc.org/funding',
            'categories': ['technology', 'research'],
            'focus_areas': ['quantum computing', 'cryptography', 'optimization'],
            'eligibility_criteria': ['Universities', 'Research institutions', 'Quantum technology companies'],
            'geographic_restrictions': ['United States', 'Canada', 'United Kingdom']
        },
        {
            'title': 'Agricultural Innovation Challenge',
            'description': 'Supporting sustainable agriculture technologies including precision farming, crop monitoring, and food security solutions.',
            'funder_name': 'Agricultural Development Bank',
            'funder_type': 'government',
            'funder_country': 'European Union',
            'min_amount': 200000,
            'max_amount': 1000000,
            'deadline': datetime.utcnow() + timedelta(days=100),
            'application_url': 'https://adb.eu/innovation-challenge',
            'categories': ['agriculture', 'technology'],
            'focus_areas': ['precision farming', 'crop monitoring', 'food security'],
            'eligibility_criteria': ['Agricultural companies', 'Research institutions', 'AgTech startups'],
            'geographic_restrictions': ['European Union']
        }
    ]
    
    print("Seeding funding opportunities...")
    
    for opp_data in opportunities:
        # Check if opportunity already exists
        existing = FundingOpportunity.query.filter_by(title=opp_data['title']).first()
        if existing:
            print(f"Opportunity '{opp_data['title']}' already exists, skipping...")
            continue
        
        opportunity = FundingOpportunity(
            title=opp_data['title'],
            description=opp_data['description'],
            funder_name=opp_data['funder_name'],
            funder_type=opp_data['funder_type'],
            funder_country=opp_data['funder_country'],
            min_amount=opp_data['min_amount'],
            max_amount=opp_data['max_amount'],
            deadline=opp_data['deadline'],
            application_url=opp_data['application_url']
        )
        
        # Set JSON fields
        opportunity.categories = json.dumps(opp_data['categories'])
        opportunity.focus_areas = json.dumps(opp_data['focus_areas'])
        opportunity.eligibility_criteria = json.dumps(opp_data['eligibility_criteria'])
        opportunity.geographic_restrictions = json.dumps(opp_data['geographic_restrictions'])
        
        db.session.add(opportunity)
        print(f"Added opportunity: {opp_data['title']}")
    
    db.session.commit()
    print(f"Successfully seeded {len(opportunities)} funding opportunities!")

def create_demo_user():
    """Create a demo user for testing"""
    
    demo_email = "demo@grantfounders.com"
    existing_user = User.query.filter_by(email=demo_email).first()
    
    if existing_user:
        print(f"Demo user already exists: {existing_user.api_key}")
        return existing_user
    
    demo_user = User(
        email=demo_email,
        name="Demo User",
        username="demo_user",
        organization="GrantFounders Demo",
        job_title="Product Manager",
        country="United States",
        is_verified=True
    )
    
    db.session.add(demo_user)
    db.session.flush()  # Get user ID
    
    # Create executive subscription
    subscription = Subscription(
        user_id=demo_user.id,
        plan='executive'
    )
    subscription.start_trial(trial_days=30)
    db.session.add(subscription)
    
    db.session.commit()
    
    print(f"Created demo user: {demo_user.email}")
    print(f"API Key: {demo_user.api_key}")
    print(f"Subscription: {subscription.plan.value} (Trial until {subscription.trial_end})")
    
    return demo_user

def main():
    """Main seeding function"""
    with app.app_context():
        print("Starting database seeding...")
        
        # Create demo user
        demo_user = create_demo_user()
        
        # Seed funding opportunities
        seed_funding_opportunities()
        
        print("\nDatabase seeding completed successfully!")
        print(f"\nDemo API Key: {demo_user.api_key}")
        print("\nYou can now test the API with:")
        print(f"curl -H 'Authorization: Bearer {demo_user.api_key}' http://localhost:5000/api/health")

if __name__ == '__main__':
    main()

