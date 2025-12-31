#!/usr/bin/env node

/**
 * GrantFounders API Smoke Test
 * 
 * Run this script to verify your deployment is working correctly.
 * Usage: node scripts/smoke-test.js <API_URL> <API_KEY>
 * 
 * Example:
 *   node scripts/smoke-test.js https://www.grantfounders.com your-api-key-here
 */

const API_URL = process.argv[2] || 'http://localhost:3000';
const API_KEY = process.argv[3] || '';

async function runTest(name, url, options = {}) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log(`   ✅ PASS`);
      return true;
    } else {
      console.log(`   ❌ FAIL`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('GrantFounders API Smoke Test');
  console.log('='.repeat(60));
  console.log(`API URL: ${API_URL}`);
  console.log(`API Key: ${API_KEY ? '***' + API_KEY.slice(-4) : 'NOT PROVIDED'}`);
  
  const results = [];
  
  // Test 1: Health Check
  results.push(await runTest(
    'Health Check',
    `${API_URL}/api/health`
  ));
  
  // Test 2: Homepage
  results.push(await runTest(
    'Homepage',
    `${API_URL}/`
  ));
  
  // Test 3: ACE Score Endpoint (requires API key)
  if (API_KEY) {
    results.push(await runTest(
      'ACE Score - Valid Request',
      `${API_URL}/api/ace/score`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          project_name: "Smoke Test Project",
          sector: "gov",
          budget: 100000,
          duration_months: 12,
          beneficiaries: 1000,
          esg_score: 75,
          risk_index: 25,
          execution_capacity: 80,
          scalability: 70,
          strategic_value: 85,
          compliance_score: 90,
          expected_roi: 15
        })
      }
    ));
    
    results.push(await runTest(
      'ACE Score - Invalid Payload',
      `${API_URL}/api/ace/score`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ invalid: 'data' })
      }
    ));
  } else {
    console.log('\n⚠️  Skipping ACE Score tests (no API key provided)');
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`Summary: ${passed}/${total} tests passed`);
  console.log('='.repeat(60));
  
  process.exit(passed === total ? 0 : 1);
}

main();
