#!/usr/bin/env node

/**
 * Vercel Deployment Verification Script
 * 
 * This script verifies that all configurations are correct for Vercel deployment.
 * Run this before deploying to catch common issues.
 * 
 * Usage: node scripts/verify-deployment.js
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark(passed) {
  return passed ? '✅' : '❌';
}

const checks = [];

function addCheck(name, passed, details = '') {
  checks.push({ name, passed, details });
  const icon = checkmark(passed);
  log(`${icon} ${name}`, passed ? 'green' : 'red');
  if (details) {
    log(`   ${details}`, 'cyan');
  }
}

function section(title) {
  log('\n' + '='.repeat(70), 'blue');
  log(title, 'blue');
  log('='.repeat(70), 'blue');
}

// Check 1: Verify we're in the web directory or project root
section('1. PROJECT STRUCTURE');

const cwd = process.cwd();
const isWebDir = cwd.endsWith('/web') || cwd.endsWith('\\web');
const hasPackageJson = fs.existsSync(path.join(cwd, 'package.json'));

addCheck(
  'Running from web directory or has package.json',
  hasPackageJson,
  isWebDir ? 'In web directory' : 'At project root with package.json'
);

// Check 2: Verify root vercel.json exists
section('2. VERCEL CONFIGURATION');

const rootDir = isWebDir ? path.join(cwd, '..') : cwd;
const webDir = isWebDir ? cwd : path.join(cwd, 'web');

const rootVercelJson = path.join(rootDir, 'vercel.json');
const hasRootVercelJson = fs.existsSync(rootVercelJson);
addCheck('Root vercel.json exists', hasRootVercelJson, rootVercelJson);

if (hasRootVercelJson) {
  try {
    const config = JSON.parse(fs.readFileSync(rootVercelJson, 'utf8'));
    const hasWebInBuild = config.buildCommand && config.buildCommand.includes('web');
    addCheck(
      'Root vercel.json references web directory',
      hasWebInBuild,
      `buildCommand: ${config.buildCommand || 'not set'}`
    );
  } catch (err) {
    addCheck('Root vercel.json is valid JSON', false, err.message);
  }
}

// Check 3: Verify .vercelignore exists
const vercelIgnore = path.join(rootDir, '.vercelignore');
const hasVercelIgnore = fs.existsSync(vercelIgnore);
addCheck('.vercelignore exists', hasVercelIgnore, vercelIgnore);

// Check 4: Check for root package-lock.json (should NOT exist)
const rootPackageLock = path.join(rootDir, 'package-lock.json');
const hasRootPackageLock = fs.existsSync(rootPackageLock);
addCheck(
  'No package-lock.json at root (monorepo)',
  !hasRootPackageLock,
  hasRootPackageLock ? 'Found at root - this may cause Vercel issues' : 'Correctly absent'
);

// Check 5: Verify web directory structure
section('3. WEB DIRECTORY STRUCTURE');

const webPackageJson = path.join(webDir, 'package.json');
const hasWebPackageJson = fs.existsSync(webPackageJson);
addCheck('web/package.json exists', hasWebPackageJson, webPackageJson);

const webPackageLock = path.join(webDir, 'package-lock.json');
const hasWebPackageLock = fs.existsSync(webPackageLock);
addCheck('web/package-lock.json exists', hasWebPackageLock, webPackageLock);

const webNextConfig = path.join(webDir, 'next.config.ts');
const hasWebNextConfig = fs.existsSync(webNextConfig);
addCheck('web/next.config.ts exists', hasWebNextConfig, webNextConfig);

const webVercelJson = path.join(webDir, 'vercel.json');
const hasWebVercelJson = fs.existsSync(webVercelJson);
addCheck('web/vercel.json exists', hasWebVercelJson, webVercelJson);

// Check 6: Verify package.json scripts
section('4. BUILD SCRIPTS');

if (hasWebPackageJson) {
  try {
    const pkg = JSON.parse(fs.readFileSync(webPackageJson, 'utf8'));
    
    const hasDevScript = pkg.scripts && pkg.scripts.dev;
    addCheck('dev script exists', !!hasDevScript, hasDevScript || 'not found');
    
    const hasBuildScript = pkg.scripts && pkg.scripts.build;
    addCheck('build script exists', !!hasBuildScript, hasBuildScript || 'not found');
    
    const hasCheckEnv = pkg.scripts && pkg.scripts['check-env'];
    addCheck('check-env script exists', !!hasCheckEnv, hasCheckEnv || 'not found');
    
    const checkEnvInBuild = hasBuildScript && pkg.scripts.build.includes('check-env');
    addCheck(
      'build script includes check-env',
      checkEnvInBuild,
      checkEnvInBuild ? 'Env vars will be validated before build' : 'Add check-env to build script'
    );
  } catch (err) {
    addCheck('web/package.json is valid JSON', false, err.message);
  }
}

// Check 7: Verify check-env.js script exists
section('5. ENVIRONMENT VALIDATION');

const checkEnvScript = path.join(webDir, 'scripts', 'check-env.js');
const hasCheckEnvScript = fs.existsSync(checkEnvScript);
addCheck('scripts/check-env.js exists', hasCheckEnvScript, checkEnvScript);

// Check 8: Verify API routes
section('6. API ROUTES');

const apiDir = path.join(webDir, 'app', 'api');
const hasApiDir = fs.existsSync(apiDir);
addCheck('app/api directory exists', hasApiDir, apiDir);

if (hasApiDir) {
  const requiredRoutes = ['health', 'ace/score', 'auth', 'stripe/checkout', 'stripe/webhook'];
  requiredRoutes.forEach(route => {
    const routePath = path.join(apiDir, route, 'route.ts');
    const exists = fs.existsSync(routePath);
    addCheck(`API route: ${route}`, exists, routePath);
  });
}

// Check 9: Verify app structure
section('7. APP STRUCTURE');

const appDir = path.join(webDir, 'app');
const hasAppDir = fs.existsSync(appDir);
addCheck('app directory exists', hasAppDir, appDir);

if (hasAppDir) {
  const requiredFiles = ['layout.tsx', 'page.tsx', 'not-found.tsx', 'globals.css'];
  requiredFiles.forEach(file => {
    const filePath = path.join(appDir, file);
    const exists = fs.existsSync(filePath);
    addCheck(`app/${file}`, exists, filePath);
  });
}

// Check 10: Verify src structure
section('8. SOURCE STRUCTURE');

const srcDir = path.join(webDir, 'src');
const hasSrcDir = fs.existsSync(srcDir);
addCheck('src directory exists', hasSrcDir, srcDir);

if (hasSrcDir) {
  const requiredDirs = ['lib', 'services', 'config', 'types', 'components'];
  requiredDirs.forEach(dir => {
    const dirPath = path.join(srcDir, dir);
    const exists = fs.existsSync(dirPath);
    addCheck(`src/${dir}`, exists, dirPath);
  });
  
  // Check for critical files
  const criticalFiles = [
    'lib/ace-kernel.ts',
    'services/api-key-guard.ts',
    'services/metering.ts',
    'config/constants.ts',
  ];
  criticalFiles.forEach(file => {
    const filePath = path.join(srcDir, file);
    const exists = fs.existsSync(filePath);
    addCheck(`src/${file}`, exists, filePath);
  });
}

// Check 11: Dependencies
section('9. DEPENDENCIES');

if (hasWebPackageJson) {
  try {
    const pkg = JSON.parse(fs.readFileSync(webPackageJson, 'utf8'));
    
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'stripe',
      'zod',
    ];
    
    requiredDeps.forEach(dep => {
      const hasit = pkg.dependencies && pkg.dependencies[dep];
      addCheck(
        `dependency: ${dep}`,
        !!hasit,
        hasit ? `v${hasit}` : 'not found'
      );
    });
  } catch (err) {
    log(`Error reading package.json: ${err.message}`, 'red');
  }
}

// Check 12: TypeScript configuration
section('10. TYPESCRIPT CONFIGURATION');

const tsconfigPath = path.join(webDir, 'tsconfig.json');
const hasTsconfig = fs.existsSync(tsconfigPath);
addCheck('tsconfig.json exists', hasTsconfig, tsconfigPath);

if (hasTsconfig) {
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    const hasPathMapping = tsconfig.compilerOptions && tsconfig.compilerOptions.paths;
    addCheck(
      'Path mappings configured',
      !!hasPathMapping,
      hasPathMapping ? 'Path aliases configured' : 'No path mappings found'
    );
  } catch (err) {
    addCheck('tsconfig.json is valid JSON', false, err.message);
  }
}

// Summary
section('SUMMARY');

const total = checks.length;
const passed = checks.filter(c => c.passed).length;
const failed = total - passed;

log(`\nTotal Checks: ${total}`, 'cyan');
log(`Passed: ${passed}`, 'green');
log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');

const percentage = Math.round((passed / total) * 100);
log(`\nSuccess Rate: ${percentage}%`, percentage === 100 ? 'green' : 'yellow');

if (failed > 0) {
  log('\n⚠️  Some checks failed. Review the errors above before deploying.', 'yellow');
  log('💡 Tip: Fix the failed checks to ensure a smooth Vercel deployment.', 'cyan');
}

if (percentage === 100) {
  log('\n✅ All checks passed! Your project is ready for Vercel deployment.', 'green');
  log('📋 Next steps:', 'cyan');
  log('   1. Commit your changes: git add . && git commit -m "Ready for deployment"', 'cyan');
  log('   2. Push to GitHub: git push', 'cyan');
  log('   3. Connect to Vercel and set Root Directory to "web"', 'cyan');
  log('   4. Add environment variables in Vercel dashboard', 'cyan');
  log('   5. Deploy!', 'cyan');
}

section('DEPLOYMENT CHECKLIST');

log('\n📋 Pre-Deployment Checklist:', 'cyan');
log('   [ ] All code changes committed to git', 'yellow');
log('   [ ] Environment variables documented', 'yellow');
log('   [ ] Supabase database schema deployed', 'yellow');
log('   [ ] Stripe webhook configured (if using Stripe)', 'yellow');
log('   [ ] DNS records configured for custom domain', 'yellow');
log('   [ ] Vercel project created with Root Directory = "web"', 'yellow');
log('   [ ] Environment variables added to Vercel', 'yellow');
log('   [ ] First deployment tested on preview URL', 'yellow');
log('   [ ] Custom domain attached and SSL verified', 'yellow');
log('   [ ] Smoke tests passed on production URL', 'yellow');

process.exit(failed > 0 ? 1 : 0);
